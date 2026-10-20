# ==============================================================================
# Phu Quy Luxury Furniture - One-Click System Launcher (Windows PowerShell)
# ==============================================================================

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   PHU QUY LUXURY FURNITURE - ONE-CLICK LAUNCHER" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$ROOT_DIR = $PSScriptRoot
if (-not $ROOT_DIR) { $ROOT_DIR = (Get-Location).Path }
$BACKEND_DIR = Join-Path $ROOT_DIR "backend"
$FRONTEND_DIR = Join-Path $ROOT_DIR "frontend"

# 1. Kiem tra cau hinh .env
if (-not (Test-Path (Join-Path $ROOT_DIR ".env"))) {
    Write-Host "[!] File .env chua ton tai. Dang tu dong cau hinh qua setup-env.ps1..." -ForegroundColor Yellow
    $setupScript = Join-Path $ROOT_DIR "setup-env.ps1"
    if (Test-Path $setupScript) {
        & powershell -ExecutionPolicy Bypass -File $setupScript
    } elseif (Test-Path (Join-Path $ROOT_DIR "setup-env.js")) {
        node (Join-Path $ROOT_DIR "setup-env.js")
    }
}

# 2. Kiem tra dich vu Database
Write-Host "[1/4] Kiem tra ket noi Database..." -ForegroundColor Magenta
$envContent = Get-Content (Join-Path $ROOT_DIR ".env") -Raw -ErrorAction SilentlyContinue
if ($envContent -match "iriguchi\.proxy\.rlwy\.net" -or $envContent -match "railway") {
    Write-Host "  [+] Su dung PostgreSQL Railway Cloud (iriguchi.proxy.rlwy.net:50783)." -ForegroundColor Green
} else {
    $pgProcesses = Get-Process -Name postgres* -ErrorAction SilentlyContinue
    if (-not $pgProcesses) {
        Write-Host "  [!] Khong phat hien tien trinh postgres cuc bo. Thu khoi dong..." -ForegroundColor Yellow
        Get-Service -Name postgres* -ErrorAction SilentlyContinue | Start-Service -ErrorAction SilentlyContinue
    } else {
        Write-Host "  [+] PostgreSQL cuc bo dang chay." -ForegroundColor Green
    }
}

# 3. Khoi dong Backend Spring Boot
Write-Host "[2/4] Kiem tra Backend (Spring Boot)..." -ForegroundColor Magenta
$backendListening = netstat -ano | findstr ":8080" | findstr "LISTENING"
if (-not $backendListening) {
    Write-Host "  [*] Dang khoi dong Backend tren cong 8080..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BACKEND_DIR'; Write-Host '--- PHU QUY BACKEND (8080) ---' -ForegroundColor Cyan; .\mvnw.cmd spring-boot:run" -WindowStyle Minimized
} else {
    Write-Host "  [+] Backend da san sang va dang lang nghe tren cong 8080." -ForegroundColor Green
}

# 4. Khoi dong Frontend Vite React
Write-Host "[3/4] Kiem tra Frontend (Vite + React)..." -ForegroundColor Magenta
$frontendListening = netstat -ano | findstr ":5173" | findstr "LISTENING"
if (-not $frontendListening) {
    Write-Host "  [*] Dang khoi dong Frontend tren cong 5173..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FRONTEND_DIR'; Write-Host '--- PHU QUY FRONTEND (5173) ---' -ForegroundColor Cyan; npm run dev -- --host" -WindowStyle Minimized
} else {
    Write-Host "  [+] Frontend da san sang va dang lang nghe tren cong 5173." -ForegroundColor Green
}

# 5. Cho va xac thuc ket noi
Write-Host "[4/4] Xac thuc trang thai he thong..." -ForegroundColor Magenta
$retries = 15
$allReady = $false

while ($retries -gt 0) {
    $bCheck = netstat -ano | findstr ":8080" | findstr "LISTENING"
    $fCheck = netstat -ano | findstr ":5173" | findstr "LISTENING"

    if ($bCheck -and $fCheck) {
        $allReady = $true
        break
    }
    Start-Sleep -Seconds 2
    $retries--
    Write-Host "  [*] Dang cho dich vu san sang... ($retries)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
if ($allReady) {
    Write-Host "[+] TOAN BO HE THONG DA KHOI CHAY THANH CONG!" -ForegroundColor Green
    Write-Host "  * Frontend Web App : http://localhost:5173" -ForegroundColor White
    Write-Host "  * Backend REST API : http://localhost:8080/api/v1" -ForegroundColor White
    Write-Host "  * Admin Dashboard  : http://localhost:5173/admin (admin@phuquy.com / admin123)" -ForegroundColor White
} else {
    Write-Host "[!] He thong dang khoi dong, vui long cho them it giay truoc khi mo trinh duyet." -ForegroundColor Yellow
    Write-Host "  * Frontend Web App : http://localhost:5173" -ForegroundColor White
    Write-Host "  * Backend REST API : http://localhost:8080/api/v1" -ForegroundColor White
}
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
