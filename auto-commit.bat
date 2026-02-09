@echo off
REM Auto commit and push script
cd /d "%~dp0"

git add .
git commit -m "Auto commit: %date% %time%"
git push origin main

echo Auto commit and push completed!
