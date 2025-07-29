Set WshShell = CreateObject("WScript.Shell")
' kill any existing cloudflared processes and node processes
WshShell.Run "cmd /c taskkill /F /IM cloudflared.exe > NUL 2>&1", 0
' WshShell.Run "cmd /c taskkill /F /IM node.exe > NUL 2>&1", 0
' start cloudflared tunnel and the backend and frontend servers
WshShell.Run "cmd /c cloudflared tunnel --config ""C:\masti\website\config.yml"" run ayush-portfolio > ""C:\masti\website\tunnel_logs\tunnel.log"" 2>&1", 0
WshShell.Run "cmd /c cd /d ""C:\masti\website\backend"" && npm run dev > ""C:\masti\website\tunnel_logs\backend.log"" 2>&1", 0
WshShell.Run "cmd /c cd /d ""C:\masti\website\frontend"" && npm start > ""C:\masti\website\tunnel_logs\frontend.log"" 2>&1", 0
Set WshShell = Nothing
WScript.Echo "Done"
WScript.Sleep 5000 ' Wait for 5 seconds to ensure all processes start properly
