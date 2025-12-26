Set WshShell = CreateObject("WScript.Shell")
' start cloudflared tunnel and node processes in the background
WshShell.Run "cmd /c cd /d ""C:\masti\website\TTS_app"" && python3.11 app.py 5075", 0, False
Set WshShell = Nothing
