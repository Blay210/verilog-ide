@echo off
setlocal
cd /d "%~dp0"
rem Start the prepared local app with its own private profile.
rem Build changes before using this launcher; it does not create an installer.
node scripts\latest-launch.mjs
if errorlevel 1 (
  echo.
  echo Pulse could not start. See the messages above.
  pause
  exit /b 1
)
endlocal
