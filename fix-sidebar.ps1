$files = @("public/dashboard-cliente.html", "public/dashboard-recepcao.html", "public/dashboard-admin.html", "public/dashboard-fisio.html")
foreach ($f in $files) {
    $c = Get-Content $f -Raw
    
    # Adicionar top: 0 e left: 0 e overflow-y auto na .sidebar
    $c = $c -replace '(\.sidebar \{\s*(?:[^{}]*)\n)', "$1            top: 0;
            left: 0;
            overflow-y: auto;
            max-height: 100vh;
"
    
    # Remover flex-grow: 1 e flex: 1 da .sidebar-nav global
    $c = $c -replace 'flex-grow: 1;', ''
    $c = $c -replace 'flex: 1;', ''
    
    # Ajuste na .sidebar-footer global para nao colar muito caso haja muitos itens
    $c = $c -replace '(\.sidebar-footer \{\s*)(padding: [^\n]*)', "${1}margin-top: auto;
            $2"

    Set-Content $f -Value $c -Encoding utf8
}
