Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c ollama serve", 0, False
WshShell.Run "cmd /c open-webui serve", 0, False
WScript.Echo "Ollama server and web UI have been started successfully."
Set WshShell = Nothing
WScript.Sleep 3000 ' Wait for 6 seconds to ensure all processes start properly
