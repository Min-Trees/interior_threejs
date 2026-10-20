#!/usr/bin/env bash

# ==============================================================================
# PHÚ QUÝ LUXURY FURNITURE - AUTO SETUP ENVIRONMENT (BASH / LINUX / MACOS)
# ==============================================================================
# Cách chạy:
#   chmod +x setup-env.sh
#   ./setup-env.sh
# ==============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ENV_FILE="$SCRIPT_DIR/.env"
BACKEND_ENV_FILE="$SCRIPT_DIR/backend/.env"

echo ""
echo "============================================================="
echo "   🚀 PHÚ QUÝ FURNITURE - TỰ ĐỘNG THIẾT LẬP MÔI TRƯỜNG (.ENV)"
echo "============================================================="
echo ""

PROXY_DOMAIN="iriguchi.proxy.rlwy.net"
PROXY_PORT="50783"
PG_USER="postgres"
PG_PASSWORD="WvuYhBooPMynozmoAWoGisDxVOviVUgs"
PG_DATABASE="railway"

# Thử lấy biến từ Railway CLI nếu có
if command -v railway &> /dev/null; then
    echo "🔍 Đang kiểm tra Railway CLI..."
    RAILWAY_JSON=$(railway variables --json 2>/dev/null || echo "")
    if [ -n "$RAILWAY_JSON" ]; then
        DETECTED_DOMAIN=$(echo "$RAILWAY_JSON" | grep -o '"RAILWAY_TCP_PROXY_DOMAIN":"[^"]*' | cut -d'"' -f4 || true)
        DETECTED_PORT=$(echo "$RAILWAY_JSON" | grep -o '"RAILWAY_TCP_PROXY_PORT":"[^"]*' | cut -d'"' -f4 || true)
        if [ -n "$DETECTED_DOMAIN" ] && [ -n "$DETECTED_PORT" ]; then
            echo "✅ Đã nhận diện thông số từ Railway CLI Cloud!"
            PROXY_DOMAIN="$DETECTED_DOMAIN"
            PROXY_PORT="$DETECTED_PORT"
        fi
    fi
fi

DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@${PROXY_DOMAIN}:${PROXY_PORT}/${PG_DATABASE}"

cat <<EOF > "$ENV_FILE"
# ==============================================================================
# PHÚ QUÝ LUXURY FURNITURE - ENVIRONMENT CONFIGURATION
# Tự động tạo bởi setup-env.sh vào lúc: $(date)
# ==============================================================================

# Railway PostgreSQL Cloud Database (Public TCP Proxy URL)
DATABASE_URL=$DATABASE_URL
DATABASE_PUBLIC_URL=$DATABASE_URL

# Railway Environment Variables
RAILWAY_TCP_PROXY_DOMAIN=$PROXY_DOMAIN
RAILWAY_TCP_PROXY_PORT=$PROXY_PORT
PGHOST=$PROXY_DOMAIN
PGPORT=$PROXY_PORT
PGDATABASE=$PG_DATABASE
PGUSER=$PG_USER
PGPASSWORD=$PG_PASSWORD

# Database Configuration Fallback
DB_HOST=localhost
DB_PORT=5432
DB_NAME=phuquy_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Security
JWT_SECRET=9a6747f3a778795c654d6a2f0e2d81f215f103f728f70cbe1fc44d5d5102bb8b497b790772d19c622a09b191492333260624d6b6706a461d1c371bc2e7f97c7b

# Groq LLM API Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Cổng thanh toán VNPay Sandbox
VNP_TMN_CODE=2QXUI4J4
VNP_HASH_SECRET=RAOCTPBM2IHMD3ENFRAPGCSYHH3SBNUE
VNP_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5173/payment/vnpay/callback
EOF

echo "📄 Đã tạo tệp: $ENV_FILE"

if [ -d "$SCRIPT_DIR/backend" ]; then
    cp "$ENV_FILE" "$BACKEND_ENV_FILE"
    echo "📄 Đã tạo bản sao: $BACKEND_ENV_FILE"
fi

echo ""
echo "📡 Đang kiểm tra kết nối mạng tới Railway Postgres ($PROXY_DOMAIN:$PROXY_PORT)..."
if command -v nc &> /dev/null; then
    if nc -z -w5 "$PROXY_DOMAIN" "$PROXY_PORT" 2>/dev/null; then
        echo "✅ KẾT NỐI DATABASE THÀNH CÔNG! Railway PostgreSQL đang sẵn sàng."
    else
        echo "⚠️  Không thể kết nối TCP. Hãy kiểm tra kết nối Internet."
    fi
else
    echo "ℹ️  Không tìm thấy lệnh nc, bỏ qua kiểm tra socket TCP."
fi

echo ""
echo "============================================================="
echo "   🎉 THIẾT LẬP MÔI TRƯỜNG THÀNH CÔNG! BẮT ĐẦU CHẠY DỰ ÁN:"
echo "============================================================="
echo "1. Khởi động Backend (Spring Boot):"
echo "   cd backend && ./mvnw spring-boot:run"
echo "   -> API chạy tại: http://localhost:8080"
echo ""
echo "2. Khởi động Frontend (React Three.js):"
echo "   cd frontend && npm install && npm run dev"
echo "   -> Website chạy tại: http://localhost:5173"
echo "============================================================="
echo ""
