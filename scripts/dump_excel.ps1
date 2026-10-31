$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
try {
    $wb = $excel.Workbooks.Open("C:\Users\DELL\.gemini\antigravity\brain\0fe20059-b875-43a5-8bbf-033eb0baabd7\.user_uploaded\media_1793378014668_90fa750e.xlsx")
    $ws = $wb.Sheets.Item(1)
    $lastRow = $ws.UsedRange.Rows.Count
    $output = @()
    for ($r = 2; $r -le $lastRow; $r++) {
        $dRoll = $ws.Cells.Item($r, 1).Text.Trim()
        $colRoll = $ws.Cells.Item($r, 2).Text.Trim()
        $name = $ws.Cells.Item($r, 3).Text.Trim()
        if ($dRoll -and $colRoll) {
            $output += "$dRoll,$colRoll,$name"
        }
    }
    $output | Out-File -FilePath "c:\Users\DELL\OneDrive\Documents\attendance-monitor\scripts\excel_mapping.csv" -Encoding utf8
    Write-Output "Dumped $($output.Count) rows to excel_mapping.csv"
    $wb.Close($false)
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
