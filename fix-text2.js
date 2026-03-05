const fs = require('fs');
const path = require('path');

function fixDoubleUTF8(str) {
    return str.replace(/([\xC2-\xDF][\x80-\xBF])|([\xE0-\xEF][\x80-\xBF]{2})/g, function (match) {
        try {
            return Buffer.from(match, 'binary').toString('utf8');
        } catch (e) {
            return match;
        }
    });
}

const folders = ['public', 'src', 'src/routes', 'src/middleware'];
folders.forEach(folder => {
    const dirPath = path.join(__dirname, folder);
    if (!fs.existsSync(dirPath)) return;

    fs.readdirSync(dirPath).forEach(file => {
        if (file.endsWith('.html') || file.endsWith('.js')) {
            const fullPath = path.join(dirPath, file);
            let content = fs.readFileSync(fullPath, 'utf8');
            const original = content;

            content = fixDoubleUTF8(content);

            // Hardcoded fallbacks just in case
            content = content.replace(/Ã£o/g, 'ão')
                .replace(/Ã§Ã£o/g, 'ção')
                .replace(/Ã§/g, 'ç')
                .replace(/Ã¡/g, 'á')
                .replace(/Ã©/g, 'é')
                .replace(/Ã­/g, 'í')
                .replace(/Ã³/g, 'ó')
                .replace(/Ãº/g, 'ú')
                .replace(/Ãµes/g, 'ões')
                .replace(/Ã¢/g, 'â')
                .replace(/Ãª/g, 'ê')
                .replace(/Ã§/g, 'ç')
                .replace(/Ã‡/g, 'Ç')
                .replace(/Ãƒ/g, 'Ã')
                .replace(/Ã‰/g, 'É')
                .replace(/Ã“/g, 'Ó')
                .replace(/Ã /g, 'à')
                .replace(/Ã´/g, 'ô')
                .replace(/Âº/g, 'º')
                .replace(/Âª/g, 'ª')
                .replace(/Ãš/g, 'Ú')
                .replace(/Ã /g, 'à')
                .replace(/ðŸ‘‹/g, '👋');

            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Corrigido: ${file}`);
            }
        }
    });
});
