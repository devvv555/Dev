$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
try {
    $wb = $excel.Workbooks.Open("C:\Users\DELL\.gemini\antigravity\brain\0fe20059-b875-43a5-8bbf-033eb0baabd7\.user_uploaded\media_1793378014668_90fa750e.xlsx")
    $ws = $wb.Sheets.Item(1)
    $lastRow = $ws.UsedRange.Rows.Count
    Write-Output "Total rows: $lastRow"
    for ($r = 1; $r -le $lastRow; $r++) {
        $c1 = $ws.Cells.Item($r, 1).Text
        $c2 = $ws.Cells.Item($r, 2).Text
        $c3 = $ws.Cells.Item($r, 3).Text
        if ($c1 -match "D26AB05" -or $c2 -match "26AB12" -or $c3 -match "DEVDARSHAN") {
            Write-Output "MATCH: Row $r | $c1 | $c2 | $c3"
        }
    }
    $wb.Close($false)
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
