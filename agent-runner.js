#!/usr/bin/env node

/**
 * ==============================================================================
 * PHÚ QUÝ LUXURY FURNITURE - AI AGENT RUNNER & DIAGNOSTIC GUIDE
 * ==============================================================================
 * Script chuyên biệt dành riêng cho AI Agent (Antigravity, Devin, Claude Code,
 * Cursor, Roo-Code, AutoGPT...) và lập trình viên khi khởi tạo dự án trên máy mới.
 *
 * Cách chạy:
 *   node agent-runner.js
 *   node agent-runner.js --setup
 *   node agent-runner.js --verify
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const http = require('http');
const { execSync } = require('child_process');

const ROOT_DIR = __dirname;
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const ENV_FILE = path.join(ROOT_DIR, '.env');

const RAILWAY_PROXY_HOST = 'iriguchi.proxy.rlwy.net';
const RAILWAY_PROXY_PORT = 50783;

// Bảng màu ANSI cho terminal
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

function header(title) {
  console.log(`\n${colors.cyan}${colors.bold}=== ${title} ===${colors.reset}`);
}

function success(msg) {
  console.log(`  ${colors.green}✔ [PASSED]${colors.reset} ${msg}`);
}

function warn(msg) {
  console.log(`  ${colors.yellow}⚠ [WARNING]${colors.reset} ${msg}`);
}

function fail(msg) {
  console.log(`  ${colors.red}✖ [FAILED]${colors.reset} ${msg}`);
}

function info(msg) {
  console.log(`  ${colors.gray}ℹ [INFO]${colors.reset} ${msg}`);
}

// 1. Kiểm tra môi trường (Tools & Dependencies)
function checkPrerequisites() {
  header('BƯỚC 1: KIỂM TRA CÔNG CỤ MÔI TRƯỜNG');
  const results = { java: false, maven: false, node: false, npm: false };

  // Node.js
  try {
    const nodeVer = execSync('node -v', { encoding: 'utf-8' }).trim();
    success(`Node.js đã cài đặt: ${nodeVer}`);
    results.node = true;
  } catch (e) {
    fail('Chưa tìm thấy Node.js. Vui lòng cài đặt Node.js 18+ LTS.');
  }

  // npm
  try {
    const npmVer = execSync('npm -v', { encoding: 'utf-8' }).trim();
    success(`npm đã cài đặt: v${npmVer}`);
    results.npm = true;
  } catch (e) {
    fail('Chưa tìm thấy npm.');
  }

  // Java
  try {
    const javaVer = execSync('java -version 2>&1', { encoding: 'utf-8' }).split('\n')[0].trim();
    success(`Java đã cài đặt: ${javaVer}`);
    results.java = true;
  } catch (e) {
    fail('Chưa tìm thấy Java 17+. Agent cần cài đặt OpenJDK / Temurin 17 LTS.');
  }

  // Maven / Maven Wrapper
  const hasMvnw = fs.existsSync(path.join(BACKEND_DIR, 'mvnw')) || fs.existsSync(path.join(BACKEND_DIR, 'mvnw.cmd'));
  if (hasMvnw) {
    success('Phát hiện Maven Wrapper tích hợp sẵn trong backend/ (không yêu cầu cài đặt Maven toàn cục)');
    results.maven = true;
  } else {
    try {
      const mvnVer = execSync('mvn -version', { encoding: 'utf-8' }).split('\n')[0].trim();
      success(`Apache Maven toàn cục: ${mvnVer}`);
      results.maven = true;
    } catch (e) {
      fail('Chưa có Maven toàn cục và thiếu mvnw.');
    }
  }

  return results;
}

// 2. Kiểm tra hoặc tự sinh cấu hình .env
function checkOrSetupEnv() {
  header('BƯỚC 2: CẤU HÌNH BIẾN MÔI TRƯỜNG (.ENV)');

  if (!fs.existsSync(ENV_FILE)) {
    info('Tệp .env chưa tồn tại. Đang tự động chạy setup-env.js...');
    try {
      execSync('node setup-env.js', { cwd: ROOT_DIR, stdio: 'inherit' });
      success('Đã tự động khởi tạo tệp .env thành công!');
    } catch (e) {
      fail(`Lỗi khởi tạo .env: ${e.message}`);
      return false;
    }
  } else {
    success(`Tệp .env đã tồn tại tại: ${ENV_FILE}`);
    // Kiểm tra có trỏ đến Railway Cloud không
    const content = fs.readFileSync(ENV_FILE, 'utf-8');
    if (content.includes('iriguchi.proxy.rlwy.net') || content.includes('railway')) {
      info('Cấu hình đang trỏ tới Database Railway Cloud (iriguchi.proxy.rlwy.net:50783)');
    } else {
      info('Cấu hình đang dùng PostgreSQL Local.');
    }
  }
  return true;
}

// 3. Kiểm tra kết nối mạng tới Railway TCP Proxy
function testDatabaseReachability() {
  header('BƯỚC 3: KIỂM TRA KẾT NỐI TỚI DATABASE RAILWAY CLOUD');

  return new Promise((resolve) => {
    info(`Đang mở kết nối Socket TCP tới ${RAILWAY_PROXY_HOST}:${RAILWAY_PROXY_PORT}...`);
    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.connect(RAILWAY_PROXY_PORT, RAILWAY_PROXY_HOST, () => {
      success(`Kết nối TCP tới Database Railway Cloud THÀNH CÔNG! (Port ${RAILWAY_PROXY_PORT} mở)`);
      socket.destroy();
      resolve(true);
    });

    socket.on('error', (err) => {
      warn(`Không thể kết nối socket tới Database Railway: ${err.message}`);
      info('Gợi ý: Kiểm tra kết nối Internet trên máy hoặc cấu hình tường lửa/proxy.');
      resolve(false);
    });

    socket.on('timeout', () => {
      warn('Kết nối socket tới Database Railway bị timeout sau 5 giây.');
      socket.destroy();
      resolve(false);
    });
  });
}

// 4. Kiểm tra gói thư viện Frontend
function checkFrontendModules() {
  header('BƯỚC 4: KIỂM TRA PHỤ THUỘC FRONTEND (NODE_MODULES)');
  const nodeModulesDir = path.join(FRONTEND_DIR, 'node_modules');

  if (fs.existsSync(nodeModulesDir)) {
    success('Thư mục frontend/node_modules đã sẵn sàng.');
    return true;
  } else {
    warn('Chưa cài đặt node_modules cho Frontend.');
    if (process.argv.includes('--setup')) {
      info('Đang tự động chạy `npm install` trong frontend/...');
      try {
        execSync('npm install', { cwd: FRONTEND_DIR, stdio: 'inherit' });
        success('Đã cài đặt phụ thuộc Frontend thành công!');
        return true;
      } catch (e) {
        fail(`Không thể cài đặt node_modules: ${e.message}`);
        return false;
      }
    } else {
      info('Agent có thể tự động cài đặt bằng lệnh: cd frontend && npm install');
      return false;
    }
  }
}

// 5. Kiểm tra các dịch vụ đang chạy & kiểm tra HTTP API Health
function checkRunningServices() {
  header('BƯỚC 5: KIỂM TRA TIẾN TRÌNH & REST API SẴN SÀNG');

  return new Promise((resolve) => {
    // 5.1 Test Backend API (Port 8080)
    info('Đang kiểm tra Backend API tại http://localhost:8080/api/v1/products...');
    const req = http.get('http://localhost:8080/api/v1/products', (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            const total = json?.data?.totalElements || (json?.data?.content ? json.data.content.length : 'OK');
            success(`Backend Spring Boot ĐANG HOẠT ĐỘNG! (HTTP 200 OK - Tổng số sản phẩm trong DB: ${total})`);
          } catch (e) {
            success('Backend Spring Boot ĐANG HOẠT ĐỘNG! (HTTP 200 OK)');
          }
        } else {
          warn(`Backend phản hồi với HTTP Status: ${res.statusCode}`);
        }
        checkFrontendService(resolve);
      });
    });

    req.on('error', () => {
      info('Backend hiện CHƯA KHỞI ĐỘNG trên cổng 8080.');
      checkFrontendService(resolve);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      info('Timeout kiểm tra Backend trên cổng 8080.');
      checkFrontendService(resolve);
    });
  });
}

function checkFrontendService(resolve) {
  info('Đang kiểm tra Frontend Web App tại http://localhost:5173...');
  const req = http.get('http://localhost:5173', (res) => {
    if (res.statusCode === 200) {
      success('Frontend React Vite ĐANG HOẠT ĐỘNG! (HTTP 200 OK tại http://localhost:5173)');
    } else {
      info(`Frontend phản hồi với HTTP Status: ${res.statusCode}`);
    }
    resolve();
  });

  req.on('error', () => {
    info('Frontend hiện CHƯA KHỞI ĐỘNG trên cổng 5173.');
    resolve();
  });

  req.setTimeout(2000, () => {
    req.destroy();
    info('Timeout kiểm tra Frontend trên cổng 5173.');
    resolve();
  });
}

// 6. In hướng dẫn hành động dành riêng cho Agent
function printAgentGuide() {
  header('🤖 HƯỚNG DẪN HÀNH ĐỘNG DÀNH CHO AI AGENT');

  console.log(`
${colors.bold}CÁCH CHẠY DỰ ÁN DÀNH CHO AGENT (Copy & Execute các lệnh sau):${colors.reset}

1. ${colors.cyan}Thiết lập môi trường tự động (nếu máy mới clone về):${colors.reset}
   ${colors.gray}# Lệnh đơn giản tự động tạo .env và kiểm tra Database:${colors.reset}
   ${colors.green}node setup-env.js${colors.reset}

2. ${colors.cyan}Cài đặt phụ thuộc Frontend (chỉ cần chạy lần đầu):${colors.reset}
   ${colors.green}cd frontend && npm install && cd ..${colors.reset}

3. ${colors.cyan}Khởi chạy Backend (Spring Boot kết nối Railway Cloud):${colors.reset}
   ${colors.gray}# Trên Windows:${colors.reset}
   ${colors.green}cd backend; .\\mvnw.cmd spring-boot:run${colors.reset}
   ${colors.gray}# Trên Linux / macOS:${colors.reset}
   ${colors.green}cd backend && ./mvnw spring-boot:run${colors.reset}

4. ${colors.cyan}Khởi chạy Frontend (React Vite + Three.js):${colors.reset}
   ${colors.green}cd frontend && npm run dev${colors.reset}

5. ${colors.cyan}Khởi chạy 1-Click tự động cả 2 hệ thống:${colors.reset}
   ${colors.gray}# Trên Windows:${colors.reset}
   ${colors.green}.\\start-system.ps1${colors.reset}
   ${colors.gray}# Trên Linux / macOS:${colors.reset}
   ${colors.green}./start-system.sh${colors.reset}

${colors.bold}THÔNG TIN XÁC THỰC & TEST TRÊN HỆ THỐNG:${colors.reset}
- URL Người dùng: ${colors.cyan}http://localhost:5173${colors.reset}
- URL Quản trị:   ${colors.cyan}http://localhost:5173/admin${colors.reset}
  - Admin:    ${colors.yellow}admin@phuquy.com${colors.reset} / Pass: ${colors.yellow}admin123${colors.reset}
  - Customer: ${colors.yellow}khachhang@gmail.com${colors.reset} / Pass: ${colors.yellow}customer123${colors.reset}
- REST API:       ${colors.cyan}http://localhost:8080/api/v1/products${colors.reset}
- Database:       ${colors.cyan}Railway Cloud PostgreSQL (iriguchi.proxy.rlwy.net:50783/railway)${colors.reset}
`);
}

// Main execution flow
async function main() {
  console.log(`
${colors.cyan}${colors.bold}======================================================================
   💎 PHÚ QUÝ LUXURY FURNITURE - AI AGENT RUNNER & DIAGNOSTICS
======================================================================${colors.reset}`);

  checkPrerequisites();
  checkOrSetupEnv();
  await testDatabaseReachability();
  checkFrontendModules();
  await checkRunningServices();
  printAgentGuide();

  console.log(`${colors.cyan}======================================================================${colors.reset}\n`);
}

main().catch(err => {
  console.error('Lỗi thực thi agent runner:', err);
  process.exit(1);
});
