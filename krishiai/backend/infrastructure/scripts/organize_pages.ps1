$srcDir = "c:\Users\Asus Laptop\OneDrive\Desktop\Create with AI\Krishiai-Vendor-ML\Build-With-AI\krishiai\frontend\src\pages"
$farmerDir = Join-Path $srcDir "farmer"
$vendorDir = Join-Path $srcDir "vendor"

New-Item -ItemType Directory -Force -Path $farmerDir
New-Item -ItemType Directory -Force -Path $vendorDir

# Copy vendor pages
Get-ChildItem $srcDir -File -Filter "*Vendor*.jsx" | ForEach-Object {
    $dest = Join-Path $vendorDir $_.Name
    Copy-Item $_.FullName $dest -Force
    Remove-Item $_.FullName -Force
}

# Move remaining loose files into farmer
Get-ChildItem $srcDir -File | ForEach-Object {
    $dest = Join-Path $farmerDir $_.Name
    Copy-Item $_.FullName $dest -Force
    Remove-Item $_.FullName -Force
}

Write-Output "frontend/src/pages organized into farmer/ and vendor/ successfully!"
