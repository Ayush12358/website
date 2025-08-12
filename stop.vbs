Set WshShell = CreateObject("WScript.Shell")
' stop cloudflared tunnel if it is running and delete logs and stop node processes
WshShell.Run "cmd /c taskkill /f /im cloudflared.exe > NUL 2>&1", 0
WshShell.Run "cmd /c del /q ""C:\masti\website\tunnel_logs\*"" > NUL 2>&1", 0
WshShell.Run "cmd /c taskkill /f /im node.exe > NUL 2>&1", 0
WshShell.Run "cmd /c taskkill /f /im python.exe > NUL 2>&1", 0
Set WshShell = Nothing
WScript.Sleep 3000 ' Wait for 6 seconds to ensure all processes start properly
