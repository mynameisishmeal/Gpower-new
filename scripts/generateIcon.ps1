Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\ABROG\Documents\GitHub\Gpower-new\electron\logo.png"
$destPath = "C:\Users\ABROG\Documents\GitHub\Gpower-new\electron\icon.ico"

$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$sizes = @(256, 128, 64, 48, 32, 16)

$pngStreams = @()

foreach ($size in $sizes) {
    $resized = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($resized)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($srcBmp, 0, 0, $size, $size)
    $g.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $resized.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $resized.Dispose()
    $pngStreams += $ms
}

$srcBmp.Dispose()

$fs = [System.IO.File]::Create($destPath)
$bw = New-Object System.IO.BinaryWriter($fs)

# Header: 6 bytes
$bw.Write([UInt16]0) # Reserved
$bw.Write([UInt16]1) # ICO type
$bw.Write([UInt16]$sizes.Count) # Count of images

$headerSize = 6 + ($sizes.Count * 16)
$currentOffset = $headerSize

# Directory entries: 16 bytes each
for ($i = 0; $i -lt $sizes.Count; $i++) {
    $size = $sizes[$i]
    $w = if ($size -eq 256) { 0 } else { [byte]$size }
    $h = if ($size -eq 256) { 0 } else { [byte]$size }
    $dataLen = [UInt32]$pngStreams[$i].Length

    $bw.Write([byte]$w)
    $bw.Write([byte]$h)
    $bw.Write([byte]0) # Palette colors
    $bw.Write([byte]0) # Reserved
    $bw.Write([UInt16]1) # Color planes
    $bw.Write([UInt16]32) # Bits per pixel
    $bw.Write([UInt32]$dataLen) # Bytes in resource
    $bw.Write([UInt32]$currentOffset) # Offset

    $currentOffset += $dataLen
}

# Image data
for ($i = 0; $i -lt $sizes.Count; $i++) {
    $bytes = $pngStreams[$i].ToArray()
    $bw.Write($bytes)
    $pngStreams[$i].Dispose()
}

$bw.Close()
$fs.Close()

Write-Host "Generated high-resolution multi-size icon at: $destPath"
