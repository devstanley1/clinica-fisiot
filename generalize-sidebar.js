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

    // Remove innerWidth <= 768 condition from switchTab
    content = content.replace(/if\s*\(\s*window\.innerWidth\s*<=\s*768\s*\)\s*\{\s*document\.getElementById\('sidebar'\)\.classList\.remove\('active'\);\s*\}/g,
        "const sidebarEl = document.getElementById('sidebar'); if (sidebarEl) sidebarEl.classList.remove('active');"
    );

    // Also replace the same logic if it was written with `sb` var (from my global injection)
    content = content.replace(/if\s*\(\s*window\.innerWidth\s*<=\s*768\s*\)\s*\{\s*const sb = document\.getElementById\('sidebar'\);\s*if\s*\(sb\)\s*sb\.classList\.remove\('active'\);\s*\}/g,
        "const sb = document.getElementById('sidebar'); if(sb) sb.classList.remove('active');"
    );

    // Remove innerWidth <= 768 from the Outside Click listener
    content = content.replace(/if\s*\(\s*window\.innerWidth\s*<=\s*768\s*&&\s*sidebar\s*&&\s*sidebar\.classList\.contains\('active'\)\s*\)/g,
        "if (sidebar && sidebar.classList.contains('active'))"
    );

    // Remove innerWidth <= 768 from .nav-item listener (the inline one we injected)
    content = content.replace(/if\s*\(\s*window\.innerWidth\s*<=\s*768\s*\)\s*\{\s*const sb = document\.getElementById\('sidebar'\);\s*if\s*\(sb\)\s*sb\.classList\.remove\('active'\);\s*\}/g,
        "const sb = document.getElementById('sidebar'); if(sb) sb.classList.remove('active');"
    );

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated behavior for: ${file}`);
});
