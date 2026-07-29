Add-Type -AssemblyName System.Drawing

# Directories in the github repo to optimize
$githubAssetsDir = "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets"
$githubSubDirs = Get-ChildItem -Path $githubAssetsDir -Directory -Recurse | Select-Object -ExpandProperty FullName
$githubSubDirs += $githubAssetsDir

# Find all potential original directories on the desktop to source from (to avoid blowing up compressed whatsapp photos if the user has a 4k one elsewhere)
$desktopPath = "c:\Users\spars\OneDrive\Attachments\Desktop"
$originalDirs = Get-ChildItem -Path $desktopPath -Directory | Where-Object { $_.Name -match "(?i)team 360|portfolio|photos|database" } | Select-Object -ExpandProperty FullName

$allSearchDirs = @()
foreach ($dir in $originalDirs) {
    if ($dir -notmatch "team 360 github") {
        $allSearchDirs += $dir
        $allSearchDirs += (Get-ChildItem -Path $dir -Directory -Recurse | Select-Object -ExpandProperty FullName)
    }
}

# Image Encoder for High Quality JPEG
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
# Quality level 90 gives virtually indistinguishable quality from 100 but cuts file size by over 50%
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]90)

$count = 0

foreach ($destDir in $githubSubDirs) {
    $assetFiles = Get-ChildItem -Path $destDir -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png)$" }
    
    foreach ($file in $assetFiles) {
        $filename = $file.Name
        if ($filename -match "_thumb") { continue }
        
        $bestMatchPath = $file.FullName
        $bestMatchSize = $file.Length
        
        # Scan desktop to find the absolute highest resolution original version of this file
        foreach ($origDir in $allSearchDirs) {
            $testPath = Join-Path $origDir $filename
            if (Test-Path $testPath) {
                $size = (Get-Item $testPath).Length
                if ($size -gt $bestMatchSize) {
                    $bestMatchSize = $size
                    $bestMatchPath = $testPath
                }
            }
            
            # Check without " copy" suffix
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
        
        try {
            $srcImage = [System.Drawing.Image]::FromFile($bestMatchPath)
            
            $maxDimension = 2560 # 2K Resolution is incredibly sharp but very light
            $width = $srcImage.Width
            $height = $srcImage.Height
            
            # Only resize if the image is larger than 2560px
            if ($width -gt $maxDimension -or $height -gt $maxDimension) {
                if ($width -gt $height) {
                    $newWidth = $maxDimension
                    $newHeight = [math]::Round($height * ($maxDimension / $width))
                } else {
                    $newHeight = $maxDimension
                    $newWidth = [math]::Round($width * ($maxDimension / $height))
                }
            } else {
                $newWidth = $width
                $newHeight = $height
            }
            
            # Create a new bitmap with the Web-Optimized dimensions
            $newImage = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
            $graphics = [System.Drawing.Graphics]::FromImage($newImage)
            
            # Set high quality rendering flags
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            
            $graphics.DrawImage($srcImage, 0, 0, $newWidth, $newHeight)
            
            # We must release the file handles before overwriting the file if the source is the destination
            $srcImage.Dispose()
            $graphics.Dispose()
            
            Write-Host "Optimizing $($file.Name)..."
            
            # Save over the asset file
            $newImage.Save($file.FullName, $jpegCodec, $encoderParams)
            $newImage.Dispose()
            
            $count++
        }
        catch {
            Write-Host "Error processing $($file.Name): $_"
        }
    }
}

Write-Host "Done! Successfully processed and web-optimized $count images for maximum sharpness and zero lag."
