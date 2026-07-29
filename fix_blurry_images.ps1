Add-Type -AssemblyName System.Drawing

$githubAssetsDirs = @(
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets\Commercial",
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets\kitchen",
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets"
)
$originalDirs = @(
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 fav pic",
    "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 photos"
)

foreach ($destDir in $githubAssetsDirs) {
    if (-not (Test-Path $destDir)) { continue }
    
    $assetFiles = Get-ChildItem -Path $destDir -File
    
    foreach ($file in $assetFiles) {
        $filename = $file.Name
        # Skip thumbnails
        if ($filename -match "_thumb") { continue }
        
        $srcPath = $null
        foreach ($origDir in $originalDirs) {
            $testPath = Join-Path $origDir $filename
            if (Test-Path $testPath) {
                $srcPath = $testPath
                break
            }
        }
        
        if ($srcPath) {
            $origSize = (Get-Item $srcPath).Length
            $destSize = $file.Length
            
            # If the original is significantly larger (at least 2MB), let's resize it to a crisp 1920px image
            if ($origSize -gt 1MB -and $destSize -lt 200KB) {
                Write-Host "Resizing $filename..."
                
                try {
                    $img = [System.Drawing.Image]::FromFile($srcPath)
                    $ratio = 1920.0 / $img.Width
                    if ($ratio -gt 1) { $ratio = 1 }
                    $newW = [int]($img.Width * $ratio)
                    $newH = [int]($img.Height * $ratio)
                    
                    $newImg = New-Object System.Drawing.Bitmap($newW, $newH)
                    $g = [System.Drawing.Graphics]::FromImage($newImg)
                    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                    $g.DrawImage($img, 0, 0, $newW, $newH)
                    
                    $destPath = $file.FullName
                    $img.Dispose() # release original so we can't lock it
                    
                    $newImg.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
                    
                    $g.Dispose()
                    $newImg.Dispose()
                    Write-Host "Replaced $filename with a crisp web version."
                } catch {
                    Write-Host "Error processing $filename : $_"
                }
            }
        }
    }
}
Write-Host "Done resizing."
