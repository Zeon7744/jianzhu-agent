@echo off
REM ============================================
REM  建检智管 - Windows 启动脚本
REM  JianJian ZhiGuan - Windows Start Script
REM ============================================
chcp 65001 >nul 2>&1
echo ============================================
echo   建检智管 AI 企业应用系统
echo   JianJian ZhiGuan AI Enterprise System
echo ============================================
echo.

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.10+.
    pause
    exit /b 1
)
echo [OK] Python installed

REM 检查 node
node --version >nul 2>&1
if errorlevel 1 (
    echo [WARN] Node.js not found. Frontend dev server will not start.
) else (
    echo [OK] Node.js installed
)

REM 初始化数据库
echo.
echo [1/3] Initializing database...
cd /d "%~dp0src\backend"
python init_db.py
if errorlevel 1 (
    echo [ERROR] Database initialization failed.
    pause
    exit /b 1
)
echo [OK] Database ready

REM 安装 Python 依赖
echo.
echo [2/3] Checking Python dependencies...
pip install -q -r requirements.txt 2>nul
echo [OK] Python dependencies ready

REM 启动后端
echo.
echo [3/3] Starting backend server...
echo   Backend: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.
start "" cmd /c "cd /d %~dp0src\backend ^&^& python -m uvicorn app:app --host 0.0.0.0 --port 8000"

REM 启动前端
if not errorlevel 1 (
    echo   Frontend: http://localhost:3000
    echo.
    start "" cmd /c "cd /d %~dp0src\frontend ^&^& npm run dev -- --host 0.0.0.0"
)

echo.
echo ============================================
echo   System starting...
echo   Press any key to close this window
echo ============================================
pause >nul
