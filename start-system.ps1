# ==============================================================================
# Phú Quý Furniture - One-Click Automated System Launcher for Windows PowerShell
# ==============================================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "🚀 Khởi động Hệ Thống Phú Quý Furniture E-Commerce & 3D" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$ROOT_DIR = $PSScriptRoot
$BACKEND_DIR = Join-Path $ROOT_DIR "backend"
$FRONTEND_DIR = Join-Path $ROOT_DIR "frontend"

# 1. Kiểm tra cấu hình .env
if (-not (Test-Path (Join-Path $ROOT_DIR ".env"))) {
    Write-Host "⚠️ File .env chưa tồn tại. Đang tạo từ .env.example..." -ForegroundColor Yellow
    Copy-Item (Join-Path $ROOT_DIR ".env.example") (Join-Path $ROOT_DIR ".env")
}

# 2. Kiểm tra dịch vụ PostgreSQL
Write-Host "[1/4] Kiểm tra PostgreSQL Database..." -ForegroundColor Magenta
$pgProcesses = Get-Process -Name postgres* -ErrorAction SilentlyContinue
if (-not $pgProcesses) {
    Write-Host "⚠️ Cảnh báo: Không phát hiện tiến trình postgres. Đang thử khởi động dịch vụ..." -ForegroundColor Yellow
    Get-Service -Name postgres* -ErrorAction SilentlyContinue | Start-Service -ErrorAction SilentlyContinue
} else {
    Write-Host "  ✅ PostgreSQL đang chạy (PIDs: $($pgProcesses.Count) processes)." -ForegroundColor Green
}

# 3. Khởi động Backend Spring Boot
Write-Host "[2/4] Kiểm tra Backend (Spring Boot)..." -ForegroundColor Magenta
$backendListening = netstat -ano | findstr ":8080" | findstr "LISTENING"
if (-not $backendListening) {
    Write-Host "  ⏳ Đang khởi động Backend trên cổng 8080..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BACKEND_DIR'; Write-Host '--- PHU QUY BACKEND (8080) ---' -ForegroundColor Cyan; mvn spring-boot:run" -WindowStyle Minimized
} else {
    Write-Host "  ✅ Backend đã sẵn sàng và đang lắng nghe trên cổng 8080." -ForegroundColor Green
}

# 4. Khởi động Frontend Vite React
Write-Host "[3/4] Kiểm tra Frontend (Vite + React)..." -ForegroundColor Magenta
$frontendListening = netstat -ano | findstr ":5173" | findstr "LISTENING"
if (-not $frontendListening) {
    Write-Host "  ⏳ Đang khởi động Frontend trên cổng 5173..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FRONTEND_DIR'; Write-Host '--- PHU QUY FRONTEND (5173) ---' -ForegroundColor Cyan; npm run dev -- --host" -WindowStyle Minimized
} else {
    Write-Host "  ✅ Frontend đã sẵn sàng và đang lắng nghe trên cổng 5173." -ForegroundColor Green
}

# 5. Chờ và xác thực kết nối
Write-Host "[4/4] Xác thực trạng thái hệ thống..." -ForegroundColor Magenta
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
    Write-Host "  ⏳ Đang chờ dịch vụ sẵn sàng... ($retries)" -ForegroundColor Gray
}

Write-Host "========================================================" -ForegroundColor Cyan
if ($allReady) {
    Write-Host "🎉 TOÀN BỘ HỆ THỐNG ĐÃ KHỞI CHẠY THÀNH CÔNG!" -ForegroundColor Green
    Write-Host "👉 Frontend Web App : http://localhost:5173" -ForegroundColor White
    Write-Host "👉 Backend REST API : http://localhost:8080/api/v1" -ForegroundColor White
    Write-Host "👉 Admin Dashboard  : http://localhost:5173/admin (admin@phuquy.com / admin123)" -ForegroundColor White
} else {
    Write-Host "⚠️ Hệ thống đang khởi động, vui lòng chờ thêm ít giây trước khi mở trình duyệt." -ForegroundColor Yellow
    Write-Host "👉 Frontend Web App : http://localhost:5173" -ForegroundColor White
    Write-Host "👉 Backend REST API : http://localhost:8080/api/v1" -ForegroundColor White
}
Write-Host "========================================================" -ForegroundColor Cyan
