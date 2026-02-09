@echo off
chcp 65001 >nul
echo ========================================
echo   微信小程序 UI 自动化测试
echo ========================================
echo.
echo 请确保：
echo 1. 微信开发者工具已打开
echo 2. 已在 设置 - 安全设置 中开启"服务端口"
echo 3. 项目已在开发者工具中打开
echo.
echo 按任意键开始测试...
pause >nul
echo.
echo 正在运行测试...
cd /d "%~dp0"
node tests/automation/index.js all
echo.
echo 测试完成，按任意键退出...
pause >nul
