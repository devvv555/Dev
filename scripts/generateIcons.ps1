Add-Type -AssemblyName System.Drawing

function Resize-Png($src, $dst, $w, $h) {
    $img = [System.Drawing.Image]::FromFile($src)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $img.Dispose()
    $g.Dispose()
    $bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated $dst ($w x $h)"
}

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

Resize-Png "icon.png" "public/icon-192.png" 192 192
Resize-Png "icon.png" "public/icon-512.png" 512 512
Resize-Png "icon.png" "assets/icon.png" 512 512
Resize-Png "icon.png" "assets/favicon.png" 192 192
