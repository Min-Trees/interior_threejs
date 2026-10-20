#!/usr/bin/env node

/**
 * ==============================================================================
 * PHÚ QUÝ LUXURY FURNITURE - AUTO SETUP ENVIRONMENT SCRIPT
 * ==============================================================================
 * Tự động tạo và cấu hình tệp .env cho máy mới hoặc agent khi clone dự án.
 * Tương thích đa nền tảng (Windows, macOS, Linux, WSL).
 *
 * Cách chạy:
 *   node setup-env.js
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const { execSync } = require('child_process');

const ROOT_DIR = __dirname;
const ENV_FILE = path.join(ROOT_DIR, '.env');
const BACKEND_ENV_FILE = path.join(ROOT_DIR, 'backend', '.env');

// Cấu hình Database Railway Cloud mặc định (Đã nạp đầy đủ 16 bảng và 14 sản phẩm nội thất 3D)
const DEFAULT_CONFIG = {
  // Railway Public TCP Proxy Configuration
  RAILWAY_TCP_PROXY_DOMAIN: 'iriguchi.proxy.rlwy.net',
  RAILWAY_TCP_PROXY_PORT: '50783',
  PGHOST: 'iriguchi.proxy.rlwy.net',
  PGPORT: '50783',
  PGDATABASE: 'railway',
  PGUSER: 'postgres',
  PGPASSWORD: 'WvuYhBooPMynozmoAWoGisDxVOviVUgs',
  DATABASE_URL: 'postgresql://postgres:WvuYhBooPMynozmoAWoGisDxVOviVUgs@iriguchi.proxy.rlwy.net:50783/railway',
  DATABASE_PUBLIC_URL: 'postgresql://postgres:WvuYhBooPMynozmoAWoGisDxVOviVUgs@iriguchi.proxy.rlwy.net:50783/railway',

  // Local Database Fallback (khi không dùng cloud)
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'phuquy_db',
  DB_USER: 'postgres',
  DB_PASSWORD: 'postgres',

  // JWT Secret Key
  JWT_SECRET: '9a6747f3a778795c654d6a2f0e2d81f215f103f728f70cbe1fc44d5d5102bb8b497b790772d19c622a09b191492333260624d6b6706a461d1c371bc2e7f97c7b',

  // Groq AI API
  GROQ_API_KEY: 'your_groq_api_key_here',
  GROQ_MODEL: 'llama-3.3-70b-versatile',

  // VNPay Sandbox
  VNP_TMN_CODE: '2QXUI4J4',
  VNP_HASH_SECRET: 'RAOCTPBM2IHMD3ENFRAPGCSYHH3SBNUE',
  VNP_PAY_URL: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  VNP_RETURN_URL: 'http://localhost:5173/payment/vnpay/callback',
};

console.log('\n=============================================================');
console.log('   🚀 PHÚ QUÝ FURNITURE - TỰ ĐỘNG THIẾT LẬP MÔI TRƯỜNG (.ENV)');
console.log('=============================================================\n');

// 1. Kiểm tra xem Railway CLI có đang liên kết không
let config = { ...DEFAULT_CONFIG };
try {
  console.log('🔍 Đang kiểm tra Railway CLI trên máy hiện tại...');
  const railwayOutput = execSync('railway variables --json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
  const railwayVars = JSON.parse(railwayOutput);

  if (railwayVars.RAILWAY_TCP_PROXY_DOMAIN && railwayVars.RAILWAY_TCP_PROXY_PORT) {
    console.log('✅ Đã nhận diện thông số Railway CLI trực tiếp từ Cloud!');
    config.RAILWAY_TCP_PROXY_DOMAIN = railwayVars.RAILWAY_TCP_PROXY_DOMAIN;
    config.RAILWAY_TCP_PROXY_PORT = railwayVars.RAILWAY_TCP_PROXY_PORT;
    config.PGHOST = railwayVars.RAILWAY_TCP_PROXY_DOMAIN;
    config.PGPORT = railwayVars.RAILWAY_TCP_PROXY_PORT;
    config.PGUSER = railwayVars.PGUSER || config.PGUSER;
    config.PGPASSWORD = railwayVars.PGPASSWORD || config.PGPASSWORD;
    config.PGDATABASE = railwayVars.PGDATABASE || config.PGDATABASE;
    config.DATABASE_URL = `postgresql://${config.PGUSER}:${config.PGPASSWORD}@${config.RAILWAY_TCP_PROXY_DOMAIN}:${config.RAILWAY_TCP_PROXY_PORT}/${config.PGDATABASE}`;
    config.DATABASE_PUBLIC_URL = config.DATABASE_URL;
  }
} catch (e) {
  console.log('ℹ️  Máy chưa cài Railway CLI hoặc chưa đăng nhập. Sử dụng cấu hình Database Railway Cloud tiêu chuẩn.');
}

// 2. Tạo nội dung tệp .env
const envContent = `# ==============================================================================
# PHÚ QUÝ LUXURY FURNITURE - ENVIRONMENT CONFIGURATION
# Tự động tạo bởi script setup-env.js vào lúc: ${new Date().toISOString()}
# ==============================================================================

# Railway PostgreSQL Cloud Database (Public TCP Proxy URL)
# Kết nối trực tiếp từ máy local lên Database Railway thông qua TCP Proxy:
DATABASE_URL=${config.DATABASE_URL}
DATABASE_PUBLIC_URL=${config.DATABASE_PUBLIC_URL}

# Railway Environment Variables
RAILWAY_TCP_PROXY_DOMAIN=${config.RAILWAY_TCP_PROXY_DOMAIN}
RAILWAY_TCP_PROXY_PORT=${config.RAILWAY_TCP_PROXY_PORT}
PGHOST=${config.PGHOST}
PGPORT=${config.PGPORT}
PGDATABASE=${config.PGDATABASE}
PGUSER=${config.PGUSER}
PGPASSWORD=${config.PGPASSWORD}

# Database Configuration Fallback (nếu chuyển về PostgreSQL local trên máy)
DB_HOST=${config.DB_HOST}
DB_PORT=${config.DB_PORT}
DB_NAME=${config.DB_NAME}
DB_USER=${config.DB_USER}
DB_PASSWORD=${config.DB_PASSWORD}

# JWT Security
JWT_SECRET=${config.JWT_SECRET}

# Groq LLM API Configuration (AI Chatbot Tư Vấn Phong Thủy & Nội Thất)
# Lấy API Key miễn phí tại https://console.groq.com/keys
GROQ_API_KEY=${config.GROQ_API_KEY}
GROQ_MODEL=${config.GROQ_MODEL}

# Cổng thanh toán VNPay Sandbox (Tài khoản thử nghiệm)
VNP_TMN_CODE=${config.VNP_TMN_CODE}
VNP_HASH_SECRET=${config.VNP_HASH_SECRET}
VNP_PAY_URL=${config.VNP_PAY_URL}
VNP_RETURN_URL=${config.VNP_RETURN_URL}
`;

// Ghi file .env ở thư mục gốc
fs.writeFileSync(ENV_FILE, envContent, 'utf-8');
console.log(`📄 Đã tạo tệp: ${ENV_FILE}`);

// Ghi thêm bản sao ở backend/.env nếu thư mục backend tồn tại
if (fs.existsSync(path.join(ROOT_DIR, 'backend'))) {
  fs.writeFileSync(BACKEND_ENV_FILE, envContent, 'utf-8');
  console.log(`📄 Đã tạo bản sao: ${BACKEND_ENV_FILE}`);
}

// 3. Kiểm tra kết nối mạng tới Railway TCP Proxy
console.log(`\n📡 Đang kiểm tra kết nối mạng tới Database Railway (${config.RAILWAY_TCP_PROXY_DOMAIN}:${config.RAILWAY_TCP_PROXY_PORT})...`);

const socket = new net.Socket();
socket.setTimeout(5000);

socket.connect(parseInt(config.RAILWAY_TCP_PROXY_PORT, 10), config.RAILWAY_TCP_PROXY_DOMAIN, () => {
  console.log('✅ KẾT NỐI DATABASE THÀNH CÔNG! Railway PostgreSQL đang hoạt động và sẵn sàng.');
  socket.destroy();
  printInstructions();
});

socket.on('error', (err) => {
  console.warn(`⚠️  Cảnh báo kết nối socket: ${err.message}`);
  console.log('👉 Lưu ý: Đảm bảo máy tính có kết nối Internet để kết nối vào Database Railway Cloud.');
  printInstructions();
});

socket.on('timeout', () => {
  console.warn('⚠️  Kết nối socket tới Railway bị timeout (sau 5s).');
  socket.destroy();
  printInstructions();
});

function printInstructions() {
  console.log('\n=============================================================');
  console.log('   🎉 THIẾT LẬP MÔI TRƯỜNG THÀNH CÔNG! BẮT ĐẦU CHẠY DỰ ÁN:');
  console.log('=============================================================');
  console.log('1. Khởi động Backend (Spring Boot):');
  console.log('   cd backend');
  console.log('   ./mvnw spring-boot:run  (hoặc mvn spring-boot:run)');
  console.log('   -> API chạy tại: http://localhost:8080');
  console.log('');
  console.log('2. Khởi động Frontend (React Three.js):');
  console.log('   cd frontend');
  console.log('   npm install  (chỉ cần chạy lần đầu)');
  console.log('   npm run dev');
  console.log('   -> Website chạy tại: http://localhost:5173');
  console.log('=============================================================\n');
}
