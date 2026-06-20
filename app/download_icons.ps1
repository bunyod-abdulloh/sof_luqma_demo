# Sof Luqma - Fluent UI 3D icons downloader
# Usage: .\download_icons.ps1

$targetDir = ".\static\img\icons"
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

$icons = @{
    "apple"      = "Red apple"
    "nuts"       = "Peanuts"
    "melon"      = "Watermelon"
    "grain"      = "Sheaf of rice"
    "bread"      = "Bread"
    "meat"       = "Cut of meat"
    "milk"       = "Glass of milk"
    "olive"      = "Olive"
    "vinegar"    = "Bottle with popping cork"
    "herb"       = "Herb"
    "organic"    = "Seedling"
    "tea"        = "Hot beverage"
    "honey"      = "Honey pot"
    "ready-meal" = "Pot of food"
    "candy"      = "Candy"
    "all"        = "Shopping cart"
}

$baseUrl = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets"
$ok = 0
$fail = 0

foreach ($slug in $icons.Keys) {
    $folder = $icons[$slug]
    $filename = $folder.ToLower().Replace(" ", "_")
    $folderUrl = [uri]::EscapeDataString($folder)
    $url = "$baseUrl/$folderUrl/3D/${filename}_3d.png"
    $output = "$targetDir\$slug.png"

    try {
        Invoke-WebRequest -Uri $url -OutFile $output -ErrorAction Stop -UseBasicParsing
        Write-Host "  OK   $slug.png" -ForegroundColor Green
        $ok++
    }
    catch {
        Write-Host "  FAIL $slug.png" -ForegroundColor Red
        Write-Host "       URL: $url" -ForegroundColor DarkGray
        $fail++
    }
}

Write-Host ""
Write-Host "Done: $ok downloaded, $fail failed" -ForegroundColor Cyan