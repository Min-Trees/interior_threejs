# ==============================================================================
# PHÚ QUÝ LUXURY FURNITURE - AI AGENT RUNNER & DIAGNOSTICS (POWERSHELL)
# ==============================================================================

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   💎 PHU QUY LUXURY FURNITURE - AI AGENT RUNNER & DIAGNOSTICS" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$ROOT_DIR = $PSScriptRoot
if (-not $ROOT_DIR) { $ROOT_DIR = (Get-Location).Path }
$BACKEND_DIR = Join-Path $ROOT_DIR "backend"
$FRONTEND_DIR = Join-Path $ROOT_DIR "frontend"
$ENV_FILE = Join-Path $ROOT_DIR ".env"

# BƯỚC 1: KIỂM TRA MÔI TRƯỜNG
Write-Host "`n=== BUOC 1: KIEM TRA CONG CU MOI TRUONG ===" -ForegroundColor Cyan
try {
    $nodeVer = node -v 2>$null
    Write-Host "  [+] Node.js: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "  [-] Thieu Node.js" -ForegroundColor Red
}

try {
    $javaVer = java -version 2>&1 | Select-Object -First 1
    Write-Host "  [+] Java: $javaVer" -ForegroundColor Green
} catch {
    Write-Host "  [-] Thieu Java 17 LTS" -ForegroundColor Red
}

$hasMvnw = Test-Path (Join-Path $BACKEND_DIR "mvnw.cmd")
if ($hasMvnw) {
    Write-Host "  [+] Phat hien Maven Wrapper (mvnw.cmd) trong backend/" -ForegroundColor Green
} else {
    Write-Host "  [-] Thieu Maven Wrapper" -ForegroundColor Yellow
}

# BƯỚC 2: CẤU HÌNH .ENV
Write-Host "`n=== BUOC 2: CAU HINH BIEN MOI TRUONG (.ENV) ===" -ForegroundColor Cyan
if (-not (Test-Path $ENV_FILE)) {
    Write-Host "  [*] .env chua ton tai. Dang tu dong chay setup-env.ps1..." -ForegroundColor Yellow
    & (Join-Path $ROOT_DIR "setup-env.ps1")
} else {
    Write-Host "  [+] Tep .env da san sang." -ForegroundColor Green
}

# BƯỚC 3: KIỂM TRA DATABASE RAILWAY
Write-Host "`n=== BUOC 3: KIEM TRA KET NOI DATABASE RAILWAY CLOUD ===" -ForegroundColor Cyan
$tcpTest = Test-NetConnection -ComputerName "iriguchi.proxy.rlwy.net" -Port 50783 -WarningAction SilentlyContinue
if ($tcpTest.TcpTestSucceeded) {
    Write-Host "  [+] KET NOI DATABASE THANG CONG! (iriguchi.proxy.rlwy.net:50783)" -ForegroundColor Green
} else {
    Write-Host "  [-] Khong ket noi duoc Database Railway qua TCP. Kiem tra Internet." -ForegroundColor Red
}

# BƯỚC 4: KIỂM TRA FRONTEND MODULES
Write-Host "`n=== BUOC 4: KIEM TRA PHU THUOC FRONTEND ===" -ForegroundColor Cyan
if (Test-Path (Join-Path $FRONTEND_DIR "node_modules")) {
    Write-Host "  [+] frontend/node_modules da san sang." -ForegroundColor Green
} else {
    Write-Host "  [-] Chua cai node_modules. Agent chay: cd frontend && npm install" -ForegroundColor Yellow
}

# BƯỚC 5: KIỂM TRA CỔNG DỊCH VỤ
Write-Host "`n=== BUOC 5: KIEM TRA TIEN TRINH & REST API ===" -ForegroundColor Cyan
try {
    $apiResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/products" -Method Get -TimeoutSec 3 -ErrorAction Stop
    $total = $apiResp.data.totalElements
    Write-Host "  [+] Backend Spring Boot DANG HOAT DONG! (HTTP 200 - $total san pham)" -ForegroundColor Green
} catch {
    Write-Host "  [-] Backend chua khoi dong tren port 8080." -ForegroundColor Gray
}

try {
    $feResp = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  [+] Frontend React Vite DANG HOAT DONG! (HTTP 200 tren port 5173)" -ForegroundColor Green
} catch {
    Write-Host "  [-] Frontend chua khoi dong tren port 5173." -ForegroundColor Gray
}

# BƯỚC 6: HƯỚNG DẪN HÀNH ĐỘNG DÀNH CHO AGENT
Write-Host "`n=== HUONG DAN HANH DONG DANH CHO AI AGENT ===" -ForegroundColor Cyan
Write-Host "1. Khoi dong Backend:" -ForegroundColor White
Write-Host "   cd backend; .\mvnw.cmd spring-boot:run" -ForegroundColor Gray
Write-Host "2. Khoi dong Frontend:" -ForegroundColor White
Write-Host "   cd frontend; npm run dev" -ForegroundColor Gray
Write-Host "3. Hoac khoi chay 1-Click ca 2 he thong:" -ForegroundColor White
Write-Host "   .\start-system.ps1" -ForegroundColor Green
Write-Host "======================================================================`n" -ForegroundColor Cyan
