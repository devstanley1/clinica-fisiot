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

    // 1. Ensure switchTab closes the sidebar on mobile.
    // Replace the existing close logic inside switchTab if it exists, or just append it.
    // The current logic looks like:
    // if (window.innerWidth <= 768) {
    //     document.getElementById('sidebar').classList.remove('active');
    // }

    const closeSidebarLogic = `
                if (window.innerWidth <= 768) {
                    const sb = document.getElementById('sidebar');
                    if(sb) sb.classList.remove('active');
                }`;

    // Sometimes the logic is there but failing due to exact spacing, let's just make sure it's robust.
    // It's easier to inject a global event listener inside the main <script> tag.

    const clickOutsideScript = `
            // Fecha menu ao clicar fora dele na versao mobile
            document.addEventListener('click', function(event) {
                const sidebar = document.getElementById('sidebar');
                const menuToggle = document.querySelector('.menu-toggle');
                
                if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
                    // Se o clique NAO foi no sidebar e NAO foi no botao de abrir
                    if (!sidebar.contains(event.target) && (!menuToggle || !menuToggle.contains(event.target))) {
                        sidebar.classList.remove('active');
                    }
                }
            });
            
            // Garante fechamento ao clicar em funcionalidade na versao mobile
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        const sb = document.getElementById('sidebar');
                        if(sb) sb.classList.remove('active');
                    }
                });
            });
    `;

    // Inject this script block right before `</script>` tag of the main script block
    // We will find the script containing 'function toggleMenu()' and append our listeners at the end of that script.

    if (content.includes('function toggleMenu()') && !content.includes('Fecha menu ao clicar fora dele na versao mobile')) {
        // Find the end of this script block
        // Assuming there is </script> after toggleMenu()
        const parts = content.split('</script>');

        for (let i = 0; i < parts.length; i++) {
            if (parts[i].includes('function toggleMenu()')) {
                parts[i] = parts[i] + '\n' + clickOutsideScript + '\n';
                break;
            }
        }
        content = parts.join('</script>');
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Global click events injected in: ${file}`);
    } else {
        console.log(`Already injected or toggleMenu not found in: ${file}`);
    }
});
