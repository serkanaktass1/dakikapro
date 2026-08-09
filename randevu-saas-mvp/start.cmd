@echo off
cd /d "%~dp0"
set "NODE_EXE=C:\Users\serka\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE_EXE%" (
  echo Node.js bulunamadi. LUTFEN Node.js 20+ yukleyin ve terminalden: node server.js
  pause
  exit /b 1
)
set "PORT=4180"
echo DakikaPro baslatiliyor: http://localhost:4180
start "" "http://localhost:4180/"
"%NODE_EXE%" server.js
pause
