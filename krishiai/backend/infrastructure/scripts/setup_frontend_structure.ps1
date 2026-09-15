$base = "c:\Users\Asus Laptop\OneDrive\Desktop\Create with AI\Krishiai-Vendor-ML\Build-With-AI\krishiai"
$src = Join-Path $base "frontend\src"

$dirs = @(
  "$src\farmer\components",
  "$src\farmer\pages",
  "$src\farmer\layouts",
  "$src\farmer\hooks",
  "$src\farmer\services",
  "$src\farmer\routes",
  "$src\farmer\store",
  "$src\farmer\utils",
  "$src\farmer\assets",
  "$src\vendor\components",
  "$src\vendor\pages",
  "$src\vendor\layouts",
  "$src\vendor\hooks",
  "$src\vendor\services",
  "$src\vendor\routes",
  "$src\vendor\store",
  "$src\vendor\utils",
  "$src\vendor\assets",
  "$src\shared\components",
  "$src\shared\layouts",
  "$src\shared\hooks",
  "$src\shared\services",
  "$src\shared\utils",
  "$src\shared\constants",
  "$src\shared\types",
  "$src\shared\context"
)

foreach ($d in $dirs) {
  New-Item -ItemType Directory -Force -Path $d | Out-Null
}

# Copy Farmer files
Copy-Item "$src\pages\farmer\*" "$src\farmer\pages\" -Recurse -Force
Copy-Item "$src\components\feature\*" "$src\farmer\components\" -Recurse -Force
Copy-Item "$src\components\landing\*" "$src\farmer\components\" -Recurse -Force
Copy-Item "$src\components\layout\*" "$src\farmer\layouts\" -Recurse -Force
Copy-Item "$src\hooks\*" "$src\farmer\hooks\" -Recurse -Force
Copy-Item "$src\services\*" "$src\farmer\services\" -Recurse -Force
Copy-Item "$src\utils\*" "$src\farmer\utils\" -Recurse -Force

# Copy Vendor files
Copy-Item "$src\pages\vendor\*" "$src\vendor\pages\" -Recurse -Force
Copy-Item "$src\components\vendor\*" "$src\vendor\components\" -Recurse -Force
Copy-Item "$src\services\*" "$src\vendor\services\" -Recurse -Force
Copy-Item "$src\utils\*" "$src\vendor\utils\" -Recurse -Force

# Copy Shared files
Copy-Item "$base\shared\frontend\components\*" "$src\shared\components\" -Recurse -Force
Copy-Item "$base\shared\frontend\hooks\*" "$src\shared\hooks\" -Recurse -Force
Copy-Item "$base\shared\frontend\services\*" "$src\shared\services\" -Recurse -Force
Copy-Item "$base\shared\frontend\context\*" "$src\shared\context\" -Recurse -Force
Copy-Item "$src\utils\*" "$src\shared\utils\" -Recurse -Force

Write-Output "Frontend technical responsibility structure initialized successfully!"
