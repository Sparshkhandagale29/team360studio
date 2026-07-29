Add-Type -AssemblyName System.Drawing

$srcFile = "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 fav pic\DSC02654 copy.jpg"
$destFile = "c:\Users\spars\OneDrive\Attachments\Desktop\team 360 github\assets\Commercial\DSC02654 copy.jpg"

try {
    $img = [System.Drawing.Image]::FromFile($srcFile)
    $ratio = 1920.0 / $img.Width
    if ($ratio -gt 1) { $ratio = 1 }
    $newW = [int]($img.Width * $ratio)
    $newH = [int]($img.Height * $ratio)
    
    $newImg = New-Object System.Drawing.Bitmap($newW, $newH)
    $g = [System.Drawing.Graphics]::FromImage($newImg)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $newW, $newH)
    
    $newImg.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    
    $g.Dispose()
    $newImg.Dispose()
    $img.Dispose()
    Write-Host "Success"
} catch {
    Write-Host "Error: $_"
}
