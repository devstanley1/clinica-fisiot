$files = @("public/dashboard-cliente.html", "public/dashboard-recepcao.html", "public/dashboard-admin.html", "public/dashboard-fisio.html")
foreach ($f in $files) {
    if (Test-Path $f) {
        $c = Get-Content $f -Raw
        
        # 1. Update .main-content rules: set margin-left to 0 and width to 100%
        $c = $c -replace 'margin-left:\s*2[56]0px;', 'margin-left: 0;'
        $c = $c -replace 'width:\s*calc\(100%\s*-\s*2[56]0px\);', 'width: 100%;'
        
        # 2. Update .mobile-header display none -> flex
        $c = $c -replace '\.mobile-header\s*\{\s*display:\s*none;', '.mobile-header {
            display: flex;'
        
        # 3. Add transform to .sidebar
        $c = $c -replace 'z-index:\s*100;', "z-index: 100;
            transform: translateX(-100%);
            transition: transform 0.3s ease;"
        
        Set-Content $f -Value $c -Encoding utf8
    }
}
