$files = @("public/dashboard-cliente.html", "public/dashboard-recepcao.html", "public/dashboard-admin.html", "public/dashboard-fisio.html")
foreach ($f in $files) {
    if (Test-Path $f) {
        $c = Get-Content $f -Raw
        
        # Add .sidebar.active globally right before @keyframes fadeIn
        if ($c -notmatch '\.sidebar\.active\s*\{\s*transform:\s*translateX\(0\);\s*\}\s*@keyframes') {
            $c = $c -replace '@keyframes fadeIn', ".sidebar.active {
            transform: translateX(0);
        }

        @keyframes fadeIn"
            Set-Content $f -Value $c -Encoding utf8
        }
    }
}
