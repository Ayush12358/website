Set WshShell = CreateObject("WScript.Shell")
' stop cloudflared tunnel if it is running and delete logs and stop node processes
WshShell.Run "cmd /c taskkill /f /im cloudflared.exe > NUL 2>&1", 0
WshShell.Run "cmd /c del /q ""C:\masti\website\tunnel_logs\*"" > NUL 2>&1", 0
WshShell.Run "cmd /c taskkill /f /im node.exe > NUL 2>&1", 0
WshShell.Run "cmd /c taskkill /f /im python.exe > NUL 2>&1", 0
WScript.Sleep 3000 ' Wait for 3 seconds to ensure all processes start properly
' print message to console
WScript.Echo "Stopping cloudflared tunnel and node processes, deleting logs..."
' start cloudflared tunnel and node processes in the background
WshShell.Run "cmd /c cloudflared tunnel --config ""C:\masti\website\config.yml"" --loglevel debug run ayush-portfolio > ""C:\masti\website\tunnel_logs\tunnel.log"" 2>&1", 0
WshShell.Run "cmd /c cd /d ""C:\masti\website\backend"" && npm run dev > ""C:\masti\website\tunnel_logs\backend.log"" 2>&1", 0
WshShell.Run "cmd /c cd /d ""C:\masti\website\frontend"" && npm start > ""C:\masti\website\tunnel_logs\frontend.log"" 2>&1", 0
WshShell.Run "cmd /c cd /d ""C:\masti\website\TTS_app"" && python3.11 app.py 5075", 0, False
Set WshShell = Nothing
WScript.Sleep 6000 ' Wait for 6 seconds to ensure all processes start properly
