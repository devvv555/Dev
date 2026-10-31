$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
try {
    $wb = $excel.Workbooks.Open("C:\Users\DELL\.gemini\antigravity\brain\0fe20059-b875-43a5-8bbf-033eb0baabd7\.user_uploaded\media_1793378014668_90fa750e.xlsx")
    Write-Output "Sheets count: $($wb.Sheets.Count)"
    foreach ($sheet in $wb.Sheets) {
        Write-Output "Sheet: $($sheet.Name)"
    }
    $ws = $wb.Sheets.Item(1)
    for ($r = 1; $r -le 25; $r++) {
        $rowVals = @()
        for ($c = 1; $c -le 10; $c++) {
            $val = $ws.Cells.Item($r, $c).Text
            $rowVals += $val
        }
        Write-Output ($rowVals -join " | ")
    }
    $wb.Close($false)
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
