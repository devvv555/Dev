Add-Type -AssemblyName System.Drawing
$userFile = 'C:/Users/DELL/.gemini/antigravity/brain/2ddeaf45-7557-4e61-8587-63b5334bf39f/.user_uploaded/media_1792735959736_dd33137f.jpg'

function Resize-Image($src, $dst, $w, $h) {
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
    Write-Host "Exported: $dst"
}

# Overwrite root icon.png
Resize-Image $userFile 'icon.png' 512 512
Resize-Image $userFile 'public/icon-192.png' 192 192
Resize-Image $userFile 'public/icon-512.png' 512 512
Resize-Image $userFile 'assets/icon.png' 512 512
Resize-Image $userFile 'assets/adaptive-icon.png' 512 512
Resize-Image $userFile 'assets/favicon.png' 192 192
Resize-Image $userFile 'favicon.png' 192 192

Write-Host "Done generating all icons from user image!"
