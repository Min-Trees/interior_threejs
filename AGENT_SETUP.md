# 🤖 AGENT & DEVELOPER ENVIRONMENT SETUP GUIDE
## Dự Án: Phú Quý Luxury Furniture E-Commerce & 3D Interactive Showroom with AI RAG Chatbot

> **Mục đích tài liệu**: Cung cấp hướng dẫn từng bước chi tiết, chuẩn xác và có thể chạy tự động bằng lệnh (scriptable / machine-executable) để bất kỳ **AI Agent** nào (Antigravity, Devin, Claude Code, Cursor, Roo-Code, AutoGPT...) hoặc lập trình viên có thể tự động kiểm tra môi trường, tải cài đặt các phụ thuộc, khởi chạy và xác thực toàn bộ hệ thống từ đầu đến cuối.

---

## 📑 MỤC LỤC
1. [Tổng Quan Kiến Trúc & Yêu Cầu](#1-tổng-quan-kiến-trúc--yêu-cầu)
2. [Lựa Chọn Phương Thức Cài Đặt](#2-lựa-chọn-phương-thức-cài-đặt)
3. [Phương Thức A: Cài Đặt Trực Tiếp (Native Host - Khuyên Dùng Cho Dev/Agent)](#3-phương-thức-a-cài-đặt-trực-tiếp-native-host)
   - [3.1. Kiểm tra môi trường (Prerequisite Check)](#31-kiểm-tra-môi-trường-prerequisite-check)
   - [3.2. Lệnh cài đặt công cụ thiếu (Windows / Linux / macOS)](#32-lệnh-cài-đặt-công-cụ-thiếu)
   - [3.3. Thiết lập Cơ sở dữ liệu PostgreSQL](#33-thiết-lập-cơ-sở-dữ-liệu-postgresql)
   - [3.4. Cấu hình biến môi trường (.env)](#34-cấu-hình-biến-môi-trường-env)
   - [3.5. Cài đặt & Khởi động Backend (Spring Boot)](#35-cài-đặt--khởi-động-backend-spring-boot)
   - [3.6. Cài đặt & Khởi động Frontend (React Vite + Three.js)](#36-cài-đặt--khởi-động-frontend-react-vite--threejs)
4. [Phương Thức B: Khởi Chạy Nhanh Bằng Docker Compose (1-Click)](#4-phương-thức-b-khởi-chạy-nhanh-bằng-docker-compose-1-click)
5. [Quy Trình Kiểm Tra & Xác Thực Hệ Thống (Health Checks Cho Agent)](#5-quy-trình-kiểm-tra--xác-thực-hệ-thống-health-checks)
6. [Tài Khoản Mẫu & Dữ Liệu Tự Động Khởi Tạo](#6-tài-khoản-mẫu--dữ-liệu-tự-động-khởi-tạo)
7. [Xử Lý Lỗi Phổ Biến (Troubleshooting & Self-Healing Guide)](#7-xử-lý-lỗi-phổ-biến-troubleshooting)

---

## 1. Tổng Quan Kiến Trúc & Yêu Cầu

| Thành phần | Công nghệ | Cổng mặc định | Yêu cầu phiên bản tối thiểu |
|---|---|:---:|---|
| **Database** | PostgreSQL + pgvector | `5432` | PostgreSQL 15+ (Khuyên dùng 16) |
| **Backend** | Spring Boot 3.3.4 (Java) | `8080` | OpenJDK / Eclipse Temurin 17 LTS, Maven 3.8+ |
| **Frontend** | React 18, Vite 5, Three.js | `5173` | Node.js 18.x hoặc 20.x LTS, npm 9+ |
| **AI LLM** | Groq Cloud API | External | API Key miễn phí tại `console.groq.com` (Tùy chọn) |

---

## 2. Lựa Chọn Phương Thức Cài Đặt

Agent hãy lựa chọn phương thức phù hợp với môi trường hiện tại:
- **Phương thức A (Native)**: Phù hợp nhất khi Agent có quyền chạy shell trực tiếp trên máy chủ / workspace cá nhân (Windows PowerShell hoặc Linux Bash).
- **Phương thức B (Docker Compose)**: Phù hợp khi máy đã có sẵn Docker Desktop / Docker Engine; chỉ cần 1 câu lệnh duy nhất để dựng toàn bộ DB, Backend và Frontend.

---

## 3. Phương Thức A: Cài Đặt Trực Tiếp (Native Host)

### 3.1. Kiểm tra môi trường (Prerequisite Check)

Agent hãy thực thi khối lệnh sau để kiểm tra các phần mềm đã cài đặt trên máy:

#### Trên Windows (PowerShell):
```powershell
Write-Host "=== KIỂM TRA MÔI TRƯỜNG ==="
java -version 2>&1 | Select-Object -First 1
mvn -version 2>&1 | Select-Object -First 1
node -v
npm -v
Get-Service -Name postgres* -ErrorAction SilentlyContinue | Select-Object Name, Status
```

#### Trên Linux / macOS (Bash):
```bash
echo "=== KIỂM TRA MÔI TRƯỜNG ==="
java -version 2>&1 | head -n 1
mvn -version | head -n 1
node -v
npm -v
pg_isready || systemctl status postgresql
```

---

### 3.2. Lệnh cài đặt công cụ thiếu

Nếu bất kỳ công cụ nào ở bước 3.1 chưa có, Agent hãy chạy các lệnh sau tương ứng với OS:

#### 🪟 Windows (Sử dụng Winget hoặc Chocolatey):
```powershell
# Cài Java 17 LTS
winget install -e --id EclipseAdoptium.Temurin.17.JDK --accept-package-agreements --accept-source-agreements

# Cài Apache Maven
winget install -e --id Apache.Maven --accept-package-agreements --accept-source-agreements

# Cài Node.js LTS (bao gồm npm)
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements

# Cài PostgreSQL 16
winget install -e --id PostgreSQL.PostgreSQL.16 --accept-package-agreements --accept-source-agreements
```
*(Sau khi cài đặt trên Windows, tải lại biến môi trường bằng: `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")`)*

#### 🐧 Linux (Ubuntu / Debian):
```bash
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk maven nodejs npm postgresql postgresql-contrib curl
# Cập nhật Node lên bản LTS nếu repo cũ:
sudo npm install -g n && sudo n lts
```

#### 🍎 macOS (Homebrew):
```bash
brew install openjdk@17 maven node postgresql@16
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
brew services start postgresql@16
```

---

### 3.3. Thiết lập Cơ sở dữ liệu PostgreSQL

Hệ thống sử dụng cơ sở dữ liệu có tên `phuquy_db` với người dùng mặc định `postgres`.

#### Cách 1: Sử dụng PostgreSQL cục bộ đang chạy
Chạy lệnh SQL để tạo database (nếu chưa có):
```sql
CREATE DATABASE phuquy_db;
```

**Lệnh tự động cho Agent:**
- **Windows PowerShell**:
  ```powershell
  # Kiểm tra và tạo database phuquy_db qua psql
  & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "SELECT 1 FROM pg_database WHERE datname = 'phuquy_db';" | Select-String "1" -Quiet || & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE phuquy_db;"
  ```
- **Linux/macOS**:
  ```bash
  sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'phuquy_db'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE phuquy_db;"
  ```

#### Cách 2: Nếu chưa cài PostgreSQL cục bộ -> Dùng Docker 1 container riêng cho DB:
```bash
docker run -d \
  --name phuquy_postgres \
  -p 5432:5432 \
  -e POSTGRES_DB=phuquy_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  pgvector/pgvector:pg16
```

> **Ghi chú**: Bạn **không cần phải chạy script tạo bảng thủ công**. Khi Backend Spring Boot khởi động, Hibernate với cấu hình `ddl-auto: update` và lớp `DataSeeder.java` sẽ tự động tạo bảng và nạp đầy đủ dữ liệu mẫu (11 sản phẩm nội thất cao cấp, danh mục, voucher, tài khoản admin & khách hàng).

---

### 3.4. Cấu hình biến môi trường (.env) - Tự Động Hoá 100%

Dự án hỗ trợ script tự động cấu hình `.env` cho Agent hoặc lập trình viên khi clone sang máy mới, kết nối trực tiếp vào **Database Railway Cloud** (đã có sẵn 16 bảng & 14 sản phẩm 3D, không cần tốn công cài đặt PostgreSQL cục bộ):

#### 🚀 Cách 1: Chạy script tự động (Khuyên dùng cho Agent)
Agent chỉ cần chạy 1 câu lệnh duy nhất tùy theo môi trường:
```bash
# Đa nền tảng (Bất kỳ OS nào có Node.js):
node setup-env.js

# Hoặc trên Windows PowerShell:
.\setup-env.ps1

# Hoặc trên Linux / macOS / WSL:
chmod +x setup-env.sh && ./setup-env.sh
```

**Script trên tự động thực hiện:**
1. Kiểm tra Railway CLI (nếu có đăng nhập thì tự động kéo URL mới nhất từ cloud).
2. Tự động sinh tệp `.env` tại thư mục gốc và sao chép vào `backend/.env`.
3. Kiểm tra socket TCP kết nối tới Database Railway Cloud (`iriguchi.proxy.rlwy.net:50783`).
4. Báo cáo trạng thái sẵn sàng để khởi động Backend & Frontend.

#### 🛠️ Cách 2: Sao chép thủ công từ tệp mẫu
```bash
# Windows PowerShell
Copy-Item .env.example .env -Force

# Linux / macOS
cp .env.example .env
```

2. Nội dung file `.env` chuẩn:
   ```properties
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=phuquy_db
   DB_USER=postgres
   DB_PASSWORD=postgres

   # JWT Security (Chuỗi bảo mật 64+ ký tự)
   JWT_SECRET=9a6747f3a778795c654d6a2f0e2d81f215f103f728f70cbe1fc44d5d5102bb8b497b790772d19c622a09b191492333260624d6b6706a461d1c371bc2e7f97c7b

   # Groq LLM API Configuration (Tùy chọn: dùng cho Chatbot AI RAG)
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   ```
   *(Nếu chưa có Groq API key, hệ thống vẫn chạy bình thường với chế độ Chatbot phản hồi quy chuẩn dựa trên bộ từ khóa nội thất).*

---

### 3.5. Cài đặt & Khởi động Backend (Spring Boot)

Thư mục: `backend/`

1. **Biên dịch và tải dependencies**:
   ```bash
   cd backend
   mvn clean compile
   ```

2. **Khởi động server Backend (Port 8080)**:
   - **Chạy trực tiếp (Foreground)**:
     ```bash
     mvn spring-boot:run
     ```
   - **Chạy dưới nền (Background/Daemon cho Agent)**:
     - **Windows PowerShell**:
       ```powershell
       Start-Process mvn -ArgumentList "spring-boot:run" -WorkingDirectory "d:\Job\PhuQuy\backend" -WindowStyle Hidden
       ```
     - **Linux / macOS**:
       ```bash
       nohup mvn spring-boot:run > backend.log 2>&1 &
       ```

3. **Xác nhận Backend sẵn sàng**:
   Chờ khoảng 8 - 15 giây, kiểm tra log xuất hiện dòng:
   ```text
   Tomcat initialized with port 8080 (http)
   Started FurnitureApplication in ... seconds
   ```

---

### 3.6. Cài đặt & Khởi động Frontend (React Vite + Three.js)

Thư mục: `frontend/`

1. **Cài đặt thư viện Node modules**:
   ```bash
   cd frontend
   npm install
   ```
   *(Nếu xảy ra xung đột peer dependency, hãy dùng: `npm install --legacy-peer-deps`)*

2. **Khởi động Frontend Dev Server (Port 5173)**:
   - **Chạy với cờ `--host` để lắng nghe mọi interface mạng (IPv4 + IPv6)**:
     ```bash
     npm run dev -- --host
     ```
   - **Chạy dưới nền (Background/Daemon cho Agent)**:
     - **Windows PowerShell**:
       ```powershell
       Start-Process npm -ArgumentList "run dev -- --host" -WorkingDirectory "d:\Job\PhuQuy\frontend" -WindowStyle Hidden
       ```
     - **Linux / macOS**:
       ```bash
       nohup npm run dev -- --host > frontend.log 2>&1 &
       ```

3. **Xác nhận Frontend sẵn sàng**:
   Frontend sẽ lắng nghe tại `http://localhost:5173` và tự động kích hoạt proxy `/api` chuyển tiếp đến `http://localhost:8080`.

---

## 4. Phương Thức B: Khởi Chạy Nhanh Bằng Docker Compose (1-Click)

Nếu máy chủ của Agent đã cài đặt Docker và Docker Compose, Agent chỉ cần 1 bước duy nhất:

```bash
# Đứng tại thư mục gốc dự án
docker compose up --build -d
```

Để theo dõi tiến trình:
```bash
docker compose ps
docker compose logs -f backend
```

Để dừng toàn bộ:
```bash
docker compose down
```

---

## 5. Quy Trình Kiểm Tra & Xác Thực Hệ Thống (Health Checks)

Sau khi khởi chạy, Agent **bắt buộc** thực hiện chuỗi lệnh xác thực tự động sau để đảm bảo hệ thống hoạt động hoàn hảo:

### Bước 1: Kiểm tra các cổng đang lắng nghe (Port Check)
- **Windows (PowerShell)**:
  ```powershell
  netstat -ano | findstr ":8080 :5173 :5432" | findstr "LISTENING"
  ```
- **Linux / macOS**:
  ```bash
  netstat -tuln | grep -E ':(8080|5173|5432)\b'
  ```
  *(Kết quả hợp lệ: Cả 3 cổng 5432, 8080, 5173 đều ở trạng thái `LISTENING`)*.

### Bước 2: Kiểm tra phản hồi HTTP của Frontend (Vite)
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/
# Trên Windows PowerShell:
curl.exe -s -o nul -w "%{http_code}" http://localhost:5173/
```
*(Kết quả kỳ vọng: **200**)*

### Bước 3: Kiểm tra API Danh sách sản phẩm (Backend Public Endpoint)
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/v1/products
# Trên Windows PowerShell:
curl.exe -s -o nul -w "%{http_code}" http://localhost:8080/api/v1/products
```
*(Kết quả kỳ vọng: **200**)*

### Bước 4: Kiểm tra Đăng nhập & Sinh JWT Token
- **Trên Windows PowerShell**:
  ```powershell
  Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@phuquy.com","password":"admin123"}'
  ```
- **Trên Linux / macOS (Bash)**:
  ```bash
  curl -s -X POST http://localhost:8080/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@phuquy.com","password":"admin123"}'
  ```
*(Kết quả kỳ vọng: Trả về trạng thái `success: true` cùng đối tượng `data` chứa `token: "ey..."` và thông tin tài khoản vai trò `ROLE_ADMIN`)*.

---

## 6. Tài Khoản Mẫu & Dữ Liệu Tự Động Khởi Tạo

Khi Backend khởi động, `DataSeeder.java` tự động tạo sẵn các tài khoản sau trong database:

| Phân quyền | Email | Mật khẩu | Phạm vi quyền hạn |
|---|---|---|---|
| **Admin (Quản trị viên)** | `admin@phuquy.com` | `admin123` | Quản lý toàn bộ danh mục, sản phẩm, đơn hàng, thống kê doanh thu tại `/admin` |
| **Customer (Khách hàng)** | `khachhang@gmail.com` | `customer123` | Mua hàng, xem 3D Showroom, giỏ hàng, đặt hàng COD/VietQR, chat AI |

**Dữ liệu 3D mẫu đã nạp sẵn:**
- Showroom Biệt thự cao cấp với 4 không gian hoàn chỉnh: Phòng Khách, Phòng Ăn, Phòng Ngủ Master, Phòng Làm Việc.
- 11 model sản phẩm nội thất chi tiết (Sofa da Ý Grand Sovereign, Bàn ăn Hoàng Gia gỗ óc chó, Giường ngủ Master bọc nỉ, Bàn làm việc Executive...).
- Hỗ trợ chế độ Đi bộ (First-person Walk) với phím `W/A/S/D`, Xoay tự do 360° (Orbit), Minimap định vị và tương tác đúp chuột để kiểm tra từng món đồ.

---

## 7. Xử Lý Lỗi Phổ Biến (Troubleshooting)

### 🔴 Lỗi 1: Cổng 8080 hoặc 5173 bị chiếm dụng (`Port already in use`)
- **Nguyên nhân**: Phiên bản trước của ứng dụng vẫn còn chạy nền.
- **Giải pháp**:
  - **Windows (PowerShell)**:
    ```powershell
    # Tìm PID chiếm cổng 8080 và dừng
    $port8080 = (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess
    if ($port8080) { Stop-Process -Id $port8080 -Force }

    # Tìm PID chiếm cổng 5173 và dừng
    $port5173 = (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess
    if ($port5173) { Stop-Process -Id $port5173 -Force }
    ```
  - **Linux / macOS**:
    ```bash
    fuser -k 8080/tcp
    fuser -k 5173/tcp
    ```

### 🔴 Lỗi 2: Backend không kết nối được PostgreSQL (`Connection refused` hoặc `password authentication failed`)
- **Nguyên nhân**: Dịch vụ PostgreSQL chưa bật hoặc sai mật khẩu người dùng `postgres`.
- **Giải pháp**:
  1. Kiểm tra dịch vụ PostgreSQL:
     ```powershell
     Get-Service -Name postgres* | Start-Service
     ```
  2. Nếu mật khẩu cục bộ khác `postgres`, cập nhật lại biến `DB_PASSWORD` trong file `.env` hoặc truyền tham số khi chạy:
     ```bash
     mvn spring-boot:run -Dspring-boot.run.arguments="--spring.datasource.password=YOUR_PASSWORD"
     ```

### 🔴 Lỗi 3: Lỗi tải phụ thuộc npm (`ERESOLVE unable to resolve dependency tree`)
- **Giải pháp**:
  ```bash
  cd frontend
  npm install --legacy-peer-deps
  ```

### 🔴 Lỗi 4: Truy cập Frontend từ máy khác trong mạng LAN không được
- **Nguyên nhân**: Vite mặc định chỉ bind trên `localhost`.
- **Giải pháp**: Luôn chạy lệnh với tham số `--host`:
  ```bash
  npm run dev -- --host
  ```

---

## 8. Bảng Tóm Tắt Lệnh Khởi Động Nhanh Cho Agent

```text
# 1. Khởi động DB (nếu dùng Docker)
docker run -d --name phuquy_postgres -p 5432:5432 -e POSTGRES_DB=phuquy_db -e POSTGRES_PASSWORD=postgres pgvector/pgvector:pg16

# 2. Khởi động Backend (Background)
cd backend && mvn spring-boot:run

# 3. Khởi động Frontend (Background)
cd frontend && npm run dev -- --host

# 4. Xác nhận hệ thống
Frontend URL : http://localhost:5173
Backend API  : http://localhost:8080/api/v1
Admin Portal : http://localhost:5173/admin (admin@phuquy.com / admin123)
```
