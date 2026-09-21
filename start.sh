#!/usr/bin/env bash
# ============================================
#  建检智管 - Linux/macOS 启动脚本
#  JianJian ZhiGuan - Linux/macOS Start Script
# ============================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================"
echo "  建检智管 AI 企业应用系统"
echo "  JianJian ZhiGuan AI Enterprise System"
echo "============================================"
echo ""

# 检查 Python
if ! command -v python3 &>/dev/null; then
    echo "[ERROR] Python 3 not found. Please install Python 3.10+."
    exit 1
fi
echo "[OK] Python: $(python3 --version)"

# 检查 Node.js
if command -v node &>/dev/null; then
    echo "[OK] Node.js: $(node --version)"
    FRONTEND_AVAILABLE=true
else
    echo "[WARN] Node.js not found. Frontend dev server will not start."
    FRONTEND_AVAILABLE=false
fi

# 初始化数据库
echo ""
echo "[1/3] Initializing database..."
cd src/backend
python3 init_db.py
if [ $? -ne 0 ]; then
    echo "[ERROR] Database initialization failed."
    exit 1
fi
echo "[OK] Database ready"

# 安装 Python 依赖
echo ""
echo "[2/3] Checking Python dependencies..."
pip3 install -q -r requirements.txt 2>/dev/null || pip install -q -r requirements.txt
echo "[OK] Python dependencies ready"

# 启动后端 (后台)
echo ""
echo "[3/3] Starting backend server..."
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"

cd "$SCRIPT_DIR/src/backend"
python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 启动前端 (后台)
if [ "$FRONTEND_AVAILABLE" = true ]; then
    echo "  Frontend: http://localhost:3000"
    cd "$SCRIPT_DIR/src/frontend"
    npm run dev -- --host 0.0.0.0 &
    FRONTEND_PID=$!
fi

echo ""
echo "============================================"
echo "  System running!"
echo "  Backend PID: $BACKEND_PID"
[ "$FRONTEND_AVAILABLE" = true ] && echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "  Press Ctrl+C to stop all services"
echo "============================================"

# 捕获退出信号，清理子进程
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    [ "$FRONTEND_AVAILABLE" = true ] && kill $FRONTEND_PID 2>/dev/null
    echo "All services stopped."
    exit 0
}
trap cleanup INT TERM

# 保持脚本运行
wait
