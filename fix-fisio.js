const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'public', 'dashboard-fisio.html');

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Fix missing mobile-header
    if (!content.includes('class="mobile-header"')) {
        const headerHTML = `
        <!-- Mobile Header -->
        <div class="mobile-header">
            <h1 class="logo" style="font-size: 1.5rem; margin: 0;">Fisio<span style="color: #f59e0b;">Vida</span></h1>
            <button class="menu-toggle" onclick="toggleMenu()">
                <i class="ph ph-list"></i>
            </button>
        </div>
`;
        content = content.replace(/<div class="main-content">/, headerHTML + '        <div class="main-content">');
    }

    // 2. Map of corrupted characters to fix
    const replacements = {
        'Ã£': 'ã',
        'Ã§': 'ç',
        'Ã§Ã£': 'çã',
        'Ã¡': 'á',
        'Ã©': 'é',
        'Ã­': 'í',
        'Ã³': 'ó',
        'Ãº': 'ú',
        'Ãµ': 'õ',
        'Ã¢': 'â',
        'Ãª': 'ê',
        'Ã‡': 'Ç',
        'Ãƒ': 'Ã',
        'Ã‰': 'É',
        'Ã“': 'Ó',
        'Ã ': 'à',
        'Ã´': 'ô',
        'Âº': 'º',
        'Âª': 'ª',
        'ðŸ‘‹': '👋', // Fixing the emoji
        'Ãµes': 'ões',
        'Ã§Ãµes': 'ções',
        'Ã¡rio': 'ário',
        'Ã©rio': 'ério',
        'Ã­vel': 'ível', // just to be safe, the single char mapping usually catches it
    };

    // We do a loop or just replace all mapping keys explicitly
    // To avoid double replacement, we replace larger strings first if any, but our map keys are mostly 2 chars.
    let oldContent = content;
    // Special emoji replacement first
    content = content.replace(/ðŸ‘‹/g, '👋');

    // Replace all keys
    for (const [bad, good] of Object.entries(replacements)) {
        // split join is faster and replaces all occurrences
        content = content.split(bad).join(good);
    }

    // specific final touches
    content = content.replace(/Visã£o/g, 'Visão')
        .replace(/Açãµes/g, 'Ações')
        .replace(/Açã£o/g, 'Ação')
        .replace(/Recepçã£o/g, 'Recepção')
        .replace(/Prontuã¡rio/g, 'Prontuário')
        .replace(/Especializaçã£o/g, 'Especialização')
        .replace(/Configuraçãµes/g, 'Configurações')
        .replace(/Diagnã³stico/g, 'Diagnóstico');

    fs.writeFileSync(file, content, 'utf8');
    console.log('Fisio Dashboard Fixed!');
}
