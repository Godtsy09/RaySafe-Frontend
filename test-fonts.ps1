$css = Invoke-WebRequest 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap' -UseBasicParsing
$css.Content | Out-File "test-fonts.css"
Write-Host "Done"