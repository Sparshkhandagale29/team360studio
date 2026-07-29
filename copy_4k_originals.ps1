$githubAssetsDirs = @(
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets\Commercial",
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets\kitchen",
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets\Hospitality",
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets\Residential",
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets"
)

$originalDirs = @(
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 fav pic",
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 photos"
)

$count = 0

foreach ($destDir in $githubAssetsDirs) {
    if (-not (Test-Path $destDir)) { continue }
    
    $assetFiles = Get-ChildItem -Path $destDir -File
    
    foreach ($file in $assetFiles) {
        $filename = $file.Name
        if ($filename -match "_thumb") { continue }
        
        $srcPath = $null
        
        # Check exact name
        foreach ($origDir in $originalDirs) {
            $testPath = Join-Path $origDir $filename
            if (Test-Path $testPath) {
                $srcPath = $testPath
                break
            }
            # Check without " copy"
            if ($filename -match " copy\.") {
                $baseName = $filename -replace " copy\.", "."
                $testPathBase = Join-Path $origDir $baseName
                if (Test-Path $testPathBase) {
                    $srcPath = $testPathBase
                    break
                }
            }
        }
        
        if ($srcPath) {
            $origSize = (Get-Item $srcPath).Length
            $destSize = $file.Length
            
            if ($origSize -gt $destSize) {
                Write-Host "Replacing $($file.Name) (Size: $([math]::Round($destSize/1MB, 2))MB) with 4K Original (Size: $([math]::Round($origSize/1MB, 2))MB)"
                Copy-Item -Path $srcPath -Destination $file.FullName -Force
                $count++
            }
        }
    }
}
Write-Host "Done! Successfully replaced $count blurry pictures with original 4K photos."
