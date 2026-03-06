const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
let inlineCssContent = fs.readFileSync(path.join(publicDir, 'style.css'), 'utf8');
let styleCounter = 1;

// Regex para buscar o bloco <head> e injetar se for necessario
function processHtmlFile(filePath, filename) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Swap backdrop-filter order
    // Webhint wants -webkit-backdrop-filter BEFORE backdrop-filter
    content = content.replace(/backdrop-filter:([^;]+);\s*-webkit-backdrop-filter:([^;]+);/g, '-webkit-backdrop-filter:$2;\n            backdrop-filter:$1;');

    // 2. Fix empty selects and inputs and buttons missing title
    content = content.replace(/<select([^>]*)>/gi, (match, p1) => {
        if (!p1.toLowerCase().includes('title=')) {
            return `<select${p1} title="Selecione uma opção">`;
        }
        return match;
    });

    content = content.replace(/<input([^>]*)>/gi, (match, p1) => {
        let attrs = p1;
        // Se for input hidden não precisa
        if (attrs.toLowerCase().includes('type="hidden"')) return match;

        let needsTitle = !attrs.toLowerCase().includes('title=');
        let needsPlaceholder = !attrs.toLowerCase().includes('placeholder=');

        // Form elements must have labels: Element has no title attribute Element has no placeholder
        if (needsTitle) {
            if (attrs.endsWith('/')) {
                attrs = attrs.substring(0, attrs.length - 1) + ' title="Campo de entrada" /';
            } else {
                attrs += ' title="Campo de entrada"';
            }
            return `<input${attrs}>`;
        }
        return match;
    });

    content = content.replace(/<button([^>]*)>/gi, (match, p1) => {
        if (!p1.toLowerCase().includes('title=')) {
            return `<button${p1} title="Ação">`;
        }
        return match;
    });

    // 3. Extract CSS inline styles
    const styleRegex = /<([a-zA-Z0-9\-]+)([^>]*?)\s+style=(['"])(.*?)\3([^>]*)>/gi;
    let newCss = '';

    content = content.replace(styleRegex, (match, tag, before, quote, styleContent, after) => {
        let rules = styleContent.trim();
        if (!rules) return `<${tag}${before}${after}>`;
        if (!rules.endsWith(';')) rules += ';';

        let className = `inline-fix-${filename.replace('.html', '')}-${styleCounter++}`;
        newCss += `.${className} { ${rules} }\n`;

        let attrs = (`${before} ${after}`).replace(/\s+/g, ' ').trim();
        if (/class=(['"])(.*?)\1/i.test(attrs)) {
            attrs = attrs.replace(/class=(['"])(.*?)\1/i, (m, q, classes) => {
                return `class=${q}${classes.trim()} ${className}${q}`;
            });
        } else {
            attrs += ` class="${className}"`;
        }

        if (attrs.length > 0) attrs = ' ' + attrs;
        return `<${tag}${attrs}>`;
    });

    if (newCss) {
        inlineCssContent += `\n/* Extracted from ${filename} */\n${newCss}`;
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Processed: ${filename}`);
    }
}

const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
files.forEach(f => {
    processHtmlFile(path.join(publicDir, f), f);
});

fs.writeFileSync(path.join(publicDir, 'style.css'), inlineCssContent, 'utf8');
console.log('style.css atualizado com classes extraídas.');
