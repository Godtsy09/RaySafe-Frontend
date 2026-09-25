$fontsDir = "D:\RaySafe\RaySafe-Fronted\src\assets\fonts"

$fonts = @(
    @{ Family = "DM+Sans:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600"; Subdir = "dm-sans" },
    @{ Family = "Fraunces:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600"; Subdir = "fraunces" },
    @{ Family = "JetBrains+Mono:wght@200;400;500;600"; Subdir = "jetbrains-mono" },
    @{ Family = "Cormorant+Garamond:wght@300;400"; Subdir = "cormorant-garamond" },
    @{ Family = "Playfair+Display:wght@400;500;600"; Subdir = "playfair-display" }
)

foreach ($font in $fonts) {
    $subdir = Join-Path $fontsDir $font.Subdir
    if (-not (Test-Path $subdir)) { New-Item -ItemType Directory -Path $subdir | Out-Null }
    
    Write-Host "Downloading $($font.Family)..."
    $cssUrl = "https://fonts.googleapis.com/css2?family=$($font.Family)&display=swap"
    $css = Invoke-WebRequest -Uri $cssUrl -UseBasicParsing
    
    # Get all font URLs (both ttf and woff2)
    $urls = [System.Text.RegularExpressions.Regex]::Matches($css.Content, 'https://[^\)]+\.(woff2|ttf)') | ForEach-Object { $_.Value }
    
    foreach ($url in $urls) {
        $filename = [System.IO.Path]::GetFileName($url)
        $outPath = Join-Path $subdir $filename
        Write-Host "  Downloading $filename..."
        try {
            Invoke-WebRequest -Uri $url -OutFile $outPath -UseBasicParsing
        } catch {
            $msg = $_.Exception.Message
            $warningMsg = "Failed to download: " + $url + " - " + $msg
            Write-Warning $warningMsg
        }
    }
}

Write-Host "Done!"