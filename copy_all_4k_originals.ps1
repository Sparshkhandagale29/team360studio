$githubAssetsDirs = @(
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets\Commercial",
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets\kitchen",
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets\Hospitality",
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets\Residential",
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets"
)

# Find all potential original directories on the desktop
$desktopPath = "c:\Users\spars\OneDrive\Attachments\Desktop"
$originalDirs = Get-ChildItem -Path $desktopPath -Directory | Where-Object { $_.Name -match "(?i)team 360|portfolio|photos|database" } | Select-Object -ExpandProperty FullName

# Include all subdirectories of those matches
$allSearchDirs = @()
foreach ($dir in $originalDirs) {
    if ($dir -notmatch "team 360 github") { # Exclude the github repo itself
        $allSearchDirs += $dir
        $allSearchDirs += (Get-ChildItem -Path $dir -Directory -Recurse | Select-Object -ExpandProperty FullName)
    }
}

$count = 0

foreach ($destDir in $githubAssetsDirs) {
    if (-not (Test-Path $destDir)) { continue }
    
    $assetFiles = Get-ChildItem -Path $destDir -File
    
    foreach ($file in $assetFiles) {
        $filename = $file.Name
        if ($filename -match "_thumb") { continue }
        
        $bestMatchPath = $null
        $bestMatchSize = 0
        
        foreach ($origDir in $allSearchDirs) {
            # exact name
            $testPath = Join-Path $origDir $filename
            if (Test-Path $testPath) {
                $size = (Get-Item $testPath).Length
                if ($size -gt $bestMatchSize) {
                    $bestMatchSize = $size
                    $bestMatchPath = $testPath
                }
            }
            
            # without copy
            if ($filename -match "(?i) copy\.") {
                $baseName = $filename -replace "(?i) copy\.", "."
                $testPathBase = Join-Path $origDir $baseName
                if (Test-Path $testPathBase) {
                    $size = (Get-Item $testPathBase).Length
                    if ($size -gt $bestMatchSize) {
                        $bestMatchSize = $size
                        $bestMatchPath = $testPathBase
                    }
                }
            }
        }
        
        if ($bestMatchPath -and $bestMatchSize -gt $file.Length) {
            # Only copy if the found file is substantially larger (meaning it's the high-res original)
            if ($bestMatchSize -gt ($file.Length * 1.5)) {
                Write-Host "Replacing $($file.Name) (Size: $([math]::Round($file.Length/1MB, 2))MB) with 4K Original (Size: $([math]::Round($bestMatchSize/1MB, 2))MB) from $bestMatchPath"
                Copy-Item -Path $bestMatchPath -Destination $file.FullName -Force
                $count++
            }
        }
    }
}
Write-Host "Done! Successfully replaced $count blurry pictures with original 4K photos."
