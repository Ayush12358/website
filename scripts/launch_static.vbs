Set WshShell = CreateObject("WScript.Shell")
' start cloudflared tunnel and node processes in the background
WshShell.Run "cmd /c cloudflared tunnel --config ""C:\masti\website\config.yml"" --loglevel debug run ayush-portfolio > ""C:\masti\website\tunnel_logs\tunnel.log"" 2>&1", 0
WshShell.Run "cmd /c cd /d ""C:\masti\website\backend"" && npm run dev > ""C:\masti\website\tunnel_logs\backend.log"" 2>&1", 0
WshShell.Run "cmd /c cd /d ""C:\masti\website\frontend"" && npm start > ""C:\masti\website\tunnel_logs\frontend.log"" 2>&1", 0
Set WshShell = Nothing
WScript.Sleep 6000 ' Wait for 6 seconds to ensure all processes start properly
