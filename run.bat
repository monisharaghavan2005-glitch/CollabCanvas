@echo off
set ROOT=%~dp0
if not exist "%ROOT%backend\.env" (
  echo [CollabCanvas] backend\.env is missing.
  echo Copy backend\.env.example to backend\.env and set your PostgreSQL password first.
  pause
  exit /b 1
)
start "CollabCanvas Backend" cmd /k "cd /d %ROOT%backend && npm.cmd run dev"
start "CollabCanvas Frontend" cmd /k "cd /d %ROOT%frontend && npm.cmd run dev"
timeout /t 3 >nul
start http://localhost:5173
