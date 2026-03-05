const fs = require('fs');
const path = require('path');

const filesToFix = [
    'public/dashboard-cliente.html',
    'public/dashboard-admin.html',
    'public/dashboard-fisio.html'
];

filesToFix.forEach(file => {
    let filepath = path.join(__dirname, file);
    if (!fs.existsSync(filepath)) return;
    let content = fs.readFileSync(filepath, 'utf8');

    // Just check if we need to add the third `</div>` before script token
    // The previous main block ends with `</div>\n        </div>\n        <script>`
    // we want `</div>\n        </div>\n    </div>\n        <script>`
    if (content.includes('</div>\n        </div>\n        <script>')) {
        content = content.replace('</div>\n        </div>\n        <script>', '</div>\n        </div>\n    </div>\n        <script>');
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Fixed missing </div> in: ${file}`);
    } else if (content.includes('</div>\n        </div>\n\n        <script>')) {
        content = content.replace('</div>\n        </div>\n\n        <script>', '</div>\n        </div>\n    </div>\n\n        <script>');
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Fixed missing </div> (pattern 2) in: ${file}`);
    } else if (!content.includes('</div>\n    </div>\n        <script>')) {
        const match = content.match(/(<\/div>\s*<\/div>\s*)(<script>)/);
        if (match) {
            content = content.replace(/(<\/div>\s*<\/div>\s*)(<script>)/, '$1</div>\n    $2');
            fs.writeFileSync(filepath, content, 'utf8');
            console.log(`Fixed missing </div> (regex) in: ${file}`);
        }
    }
});
