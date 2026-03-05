const fs = require('fs');
const path = require('path');

const dashboards = [
    'public/dashboard-admin.html',
    'public/dashboard-cliente.html',
    'public/dashboard-fisio.html',
    'public/dashboard-recepcao.html'
];

dashboards.forEach(file => {
    let filepath = path.join(__dirname, file);
    if (!fs.existsSync(filepath)) return;

    let content = fs.readFileSync(filepath, 'utf8');

    // Make sure mobile-header is BEFORE sidebar.
    // If we find mobile header is inside or after main-content, extract it.
    // Let's just locate mobile-header and see what its structure is.
    const headerRegex = /<!-- Mobile Header -->\s*<div class="mobile-header">[\s\S]*?<\/div>/;
    const matchHeader = content.match(headerRegex);

    if (matchHeader) {
        let headerCode = matchHeader[0];

        // Let's swap the button and logo inside headerCode to put the button on the left
        // The current format is usually <h1 class="logo"...>...</h1> \n <button class="menu-toggle"...>...</button>
        // We will parse them using regex.
        let logoMatch = headerCode.match(/<h1 class="logo".*?>[\s\S]*?<\/h1>/);
        let btnMatch = headerCode.match(/<button class="menu-toggle"[\s\S]*?<\/button>/);

        if (logoMatch && btnMatch) {
            let newHeaderCode = `<!-- Mobile Header -->
        <div class="mobile-header">
            ${btnMatch[0]}
            ${logoMatch[0]}
        </div>`;
            content = content.replace(headerRegex, newHeaderCode);
        }
    }

    // Now, for dashboard-fisio, fix the structural order if it's placed after sidebar
    if (file.includes('dashboard-fisio.html')) {
        // extract new header regex if it changed
        const newHeaderMatch = content.match(/<!-- Mobile Header -->\s*<div class="mobile-header">[\s\S]*?<\/div>/);
        if (newHeaderMatch) {
            const headerCode = newHeaderMatch[0];
            // Remove it from its current position
            content = content.replace(newHeaderMatch[0], '');
            // Place it right after <div class="app-container">
            // taking into consideration possible whitespace
            content = content.replace(/(<div class="app-container">\s*)/, '$1' + headerCode + '\n');
        }
    }

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated layout for: ${file}`);
});
