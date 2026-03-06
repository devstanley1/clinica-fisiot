const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function processHtmlFile(filePath, filename) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix buttons that have title but no aria-label
    content = content.replace(/<button([^>]*)>/gi, (match, p1) => {
        let attrs = p1;
        if (!attrs.toLowerCase().includes('aria-label=')) {
            attrs += ' aria-label="Botão de interface"';
        }
        if (!attrs.toLowerCase().includes('title=')) {
            attrs += ' title="Botão"';
        }
        return `<button${attrs}>`;
    });

    // Fix links that are just icons
    content = content.replace(/<a([^>]*)>\s*<i\s+class="ph([^"]+)"\s*><\/i>\s*<\/a>/gi, (match, p1, p2) => {
        let attrs = p1;
        if (!attrs.toLowerCase().includes('aria-label=')) {
            attrs += ' aria-label="Link de navegação"';
        }
        return `<a${attrs}>\n                <i class="ph${p2}"></i>\n            </a>`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Aria-label corrigido em: ${filename}`);
    }
}

const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
files.forEach(f => {
    processHtmlFile(path.join(publicDir, f), f);
});
