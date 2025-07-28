Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

currentDir = fso.GetAbsolutePathName(".")
WScript.Echo "Current working directory: " & currentDir
WshShell.Run "cmd /c cloudflared tunnel --config """ & currentDir & "\config.yml"" run ayush-portfolio > """ & currentDir & "\tunnel_logs\tunnel.log"" 2>&1", 0
WshShell.Run "cmd /c cd /d """ & currentDir & "\backend"" && npm run dev > """ & currentDir & "\tunnel_logs\backend.log"" 2>&1", 0
WshShell.Run "cmd /c cd /d """ & currentDir & "\frontend"" && npm start > """ & currentDir & "\tunnel_logs\frontend.log"" 2>&1", 0

Set fso = Nothing
Set WshShell = Nothing
WScript.Sleep 60000 ' Wait for 60 seconds to ensure all processes start properly
