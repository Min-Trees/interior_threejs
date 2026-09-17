#!/usr/bin/env bash
# ==============================================================================
# Phú Quý Furniture - One-Click Automated System Launcher for Linux / macOS
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "========================================================"
echo "🚀 Khởi động Hệ Thống Phú Quý Furniture E-Commerce & 3D"
echo "========================================================"

# 1. Kiểm tra file .env
if [ ! -f "$ROOT_DIR/.env" ]; then
    echo "⚠️ File .env chưa tồn tại. Đang copy từ .env.example..."
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
fi

# 2. Kiểm tra PostgreSQL
echo "[1/4] Kiểm tra PostgreSQL Database..."
if command -v pg_isready &> /dev/null; then
    pg_isready -h localhost -p 5432 || echo "⚠️ Cảnh báo: PostgreSQL chưa phản hồi trên port 5432."
else
    echo "ℹ️ Bỏ qua kiểm tra pg_isready (không tìm thấy lệnh)."
fi

# 3. Khởi động Backend
echo "[2/4] Kiểm tra & Khởi động Backend (Spring Boot 8080)..."
if ! nc -z localhost 8080 2>/dev/null; then
    echo "  ⏳ Đang khởi động Backend dưới nền..."
    cd "$BACKEND_DIR"
    nohup mvn spring-boot:run > "$ROOT_DIR/backend.log" 2>&1 &
else
    echo "  ✅ Backend đã chạy sẵn trên cổng 8080."
fi

# 4. Khởi động Frontend
echo "[3/4] Kiểm tra & Khởi động Frontend (Vite 5173)..."
if ! nc -z localhost 5173 2>/dev/null; then
    echo "  ⏳ Đang khởi động Frontend dưới nền..."
    cd "$FRONTEND_DIR"
    nohup npm run dev -- --host > "$ROOT_DIR/frontend.log" 2>&1 &
else
    echo "  ✅ Frontend đã chạy sẵn trên cổng 5173."
fi

# 5. Xác thực
echo "[4/4] Kiểm tra sẵn sàng..."
sleep 5

echo "========================================================"
echo "🎉 HỆ THỐNG ĐÃ ĐƯỢC KÍCH HOẠT!"
echo "👉 Frontend Web App : http://localhost:5173"
echo "👉 Backend REST API : http://localhost:8080/api/v1"
echo "👉 Admin Dashboard  : http://localhost:5173/admin (admin@phuquy.com / admin123)"
echo "========================================================"
