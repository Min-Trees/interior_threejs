# Đồ Án Tốt Nghiệp: Website Thương Mại Điện Tử Nội Thất Tích Hợp Chatbot Tư Vấn RAG & Groq LLM

> **Hệ thống E-Commerce Nội thất cao cấp Phú Quý**, tích hợp Chatbot AI tư vấn bán hàng thông minh dựa trên kỹ thuật **RAG (Retrieval-Augmented Generation)** kết hợp mô hình ngôn ngữ lớn **Groq LLM API** (`llama-3.3-70b-versatile`).

---

## 1. Công Nghệ Sử Dụng

- **Frontend**: React 18, Vite, TailwindCSS, Lucide React, React Router v6, Axios, React Markdown.
- **Backend**: Spring Boot 3.3.4 (Java 17 LTS), Spring Data JPA, Spring Security, JJWT 0.12.6, Bean Validation, Lombok.
- **Cơ sở dữ liệu**: PostgreSQL 16/17 (hỗ trợ `pgvector` / semantic search).
- **AI & Chatbot RAG**: Groq Cloud API (mô hình `llama-3.3-70b-versatile`), Hybrid Semantic Search (truy xuất sản phẩm theo ngữ cảnh, kích thước, chất liệu, tầm giá).
- **Đóng gói & Triển khai**: Docker, Docker Compose, Nginx Alpine, Eclipse Temurin 17 JRE.

---

## 2. Các Chức Năng Chính Của Hệ Thống

### 2.1. Phân Hệ Khách Hàng (Customer)
- **Trang chủ**: Hero banner sang trọng, danh mục nổi bật, bộ sưu tập bán chạy, chính sách bảo hành 3 năm và miễn phí vận chuyển.
- **Duyệt & Lọc sản phẩm**:
  - Lọc đa tiêu chí: Danh mục (Sofa, Bàn ăn, Giường ngủ, Tủ kệ, Làm việc), Khoảng giá (Dưới 10tr, 10-20tr, 20-30tr, trên 30tr), Chất liệu (Gỗ sồi, Da bò Ý, Gỗ óc chó, Vải nỉ, Đá ceramic...).
  - Sắp xếp theo giá tăng/giảm dần, hàng mới nhất.
  - Phân trang chuẩn server-side.
- **Chi tiết sản phẩm**: Thư viện hình ảnh sắc nét, bảng thông số kỹ thuật (chất liệu, kích thước, màu sắc, trọng lượng, tồn kho), chọn số lượng, thêm vào giỏ hàng.
- **Giỏ hàng & Đặt hàng (Checkout)**:
  - Tăng/giảm số lượng, xóa từng món hoặc xóa toàn bộ giỏ.
  - Điền thông tin giao hàng, chọn hình thức thanh toán: Tiền mặt khi nhận hàng (**COD**) hoặc Chuyển khoản ngân hàng (**VietQR**).
  - Tự động sinh mã đơn hàng độc nhất (VD: `PQ-260904-8899`) và tự động trừ số lượng tồn kho sản phẩm.
- **Lịch sử đơn hàng**: Theo dõi trạng thái đơn hàng thời gian thực (`Chờ xác nhận`, `Đã xác nhận`, `Đang giao hàng`, `Đã hoàn thành`, `Đã hủy`).
- **Đăng nhập / Đăng ký**: Hỗ trợ JWT Bearer token và nút điền nhanh tài khoản Demo chỉ với 1 click.

### 2.2. Phân Hệ Quản Trị (Admin Portal)
- **Bảng điều khiển (Dashboard)**: Thống kê tổng doanh thu thực tế, số lượng đơn hàng, số mặt hàng trong kho, số lượng tài khoản khách hàng, danh sách đơn hàng mới nhất.
- **Quản lý Sản phẩm (CRUD)**: Thêm mới sản phẩm kèm đầy đủ thông số nội thất, sửa thông số, cập nhật giá, xóa/ẩn sản phẩm.
- **Quản lý Danh mục (CRUD)**: Quản lý nhóm phòng khách, phòng ngủ, phòng ăn, phòng làm việc.
- **Quản lý Đơn hàng**: Xem chi tiết đơn hàng của từng khách hàng và cập nhật chuyển đổi trạng thái xử lý đơn hàng.

### 2.3. Phân Hệ Chatbot AI Tư Vấn (RAG Pipeline)
- **Widget Chat Nổi**: Nút AI phát sáng ấn tượng ở góc phải màn hình, có thể thu phóng mượt mà.
- **Kỹ thuật RAG (Retrieval-Augmented Generation)**:
  1. Người dùng đặt câu hỏi (VD: *"Tôi muốn tìm sofa góc da cho phòng khách tầm 25 triệu"*).
  2. Backend tiến hành phân tích intent, trích xuất từ khóa, tầm giá và chất liệu -> Truy vấn cơ sở dữ liệu để tìm top 3-4 sản phẩm phù hợp nhất.
  3. Ghép danh sách sản phẩm thực tế cùng thông số, giá bán và tình trạng tồn kho vào **System Prompt**.
  4. Gửi payload kèm lịch sử hội thoại nhiều lượt đến **Groq LLM API** (`llama-3.3-70b-versatile`).
  5. AI phản hồi bằng ngôn ngữ tự nhiên, mạch lạc, lịch thiệp và **chỉ dựa trên thông tin sản phẩm có thật** (không bịa đặt thông tin).
  6. Đính kèm **Thẻ sản phẩm trực quan (Product Cards)** ngay bên dưới tin nhắn giúp khách hàng có thể bấm "Xem chi tiết" hoặc "Thêm vào giỏ" ngay lập tức.

---

## 3. Tài Khoản Demo Khởi Tạo Sẵn

Hệ thống được cấu hình sẵn dữ liệu mẫu (`DataSeeder`) khi khởi chạy:

| Phân quyền | Email | Mật khẩu | Chức năng |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin@phuquy.com` | `admin123` | Truy cập trang quản trị `/admin`, quản lý kho, đơn hàng, thống kê |
| **Khách hàng (Customer)** | `khachhang@gmail.com` | `customer123` | Đặt hàng, giỏ hàng, xem lịch sử đơn, chat với AI |

---

## 4. Hướng Dẫn Cài Đặt & Khởi Chạy

> 🤖 **Dành cho AI Agent & Thiết lập tự động**: Tham khảo tài liệu chuyên biệt tại **[AGENT_SETUP.md](file:///d:/Job/PhuQuy/AGENT_SETUP.md)** để lấy danh sách lệnh kiểm tra môi trường, cài đặt tự động và xác thực health checks.
>
> ⚡ **Khởi động nhanh bằng 1 click**: Chạy script `.\start-system.ps1` (Windows) hoặc `./start-system.sh` (Linux/macOS).

### Cách 1: Chạy Bằng Docker Compose (Khuyên dùng)
Yêu cầu: Đã cài đặt Docker Desktop.

1. Clone hoặc tải mã nguồn dự án về máy:
   ```bash
   cd d:/Job/PhuQuy
   ```
2. Cấu hình file `.env` (tùy chọn điền `GROQ_API_KEY` từ [console.groq.com](https://console.groq.com)):
   ```properties
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```
3. Khởi chạy toàn bộ hệ thống bằng một câu lệnh:
   ```bash
   docker compose up --build -d
   ```
4. Truy cập hệ thống:
   - **Frontend (Giao diện người dùng & Admin)**: `http://localhost:3000`
   - **Backend REST API**: `http://localhost:8080/api/v1`
   - **PostgreSQL Database**: `localhost:5432` (Database: `phuquy_db`, User: `postgres`, Pass: `postgres`)

---

### Cách 2: Chạy Trực Tiếp (Local Development)

#### 1. Khởi động Cơ sở dữ liệu PostgreSQL
- Đảm bảo dịch vụ PostgreSQL đang chạy ở cổng `5432`.
- Tạo cơ sở dữ liệu `phuquy_db`:
  ```sql
  CREATE DATABASE phuquy_db;
  ```

#### 2. Khởi động Backend (Spring Boot)
```bash
cd d:/Job/PhuQuy/backend
mvn clean spring-boot:run
```
Backend sẽ tự động kết nối PostgreSQL, tự động sinh bảng và nạp sẵn 11 sản phẩm nội thất mẫu cùng tài khoản admin/khách hàng.

#### 3. Khởi động Frontend (React Vite)
```bash
cd d:/Job/PhuQuy/frontend
npm install
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:5173`

---

## 5. Danh Sách REST API Endpoints Chính

| Phương thức | Endpoint | Mô tả | Quyền truy cập |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Đăng ký tài khoản khách hàng mới | Public |
| `POST` | `/api/v1/auth/login` | Đăng nhập hệ thống, trả về JWT token | Public |
| `GET` | `/api/v1/auth/me` | Lấy thông tin tài khoản hiện tại | User / Admin |
| `GET` | `/api/v1/categories` | Lấy danh sách danh mục nội thất | Public |
| `POST` | `/api/v1/categories` | Thêm danh mục mới | Admin |
| `GET` | `/api/v1/products` | Danh sách sản phẩm (lọc danh mục, giá, chất liệu, search) | Public |
| `GET` | `/api/v1/products/featured`| Danh sách sản phẩm bán chạy / nổi bật | Public |
| `GET` | `/api/v1/products/slug/{slug}` | Xem chi tiết sản phẩm theo slug | Public |
| `POST` | `/api/v1/products` | Thêm sản phẩm mới | Admin |
| `PUT` | `/api/v1/products/{id}` | Cập nhật thông số kỹ thuật sản phẩm | Admin |
| `DELETE` | `/api/v1/products/{id}` | Xóa / ẩn sản phẩm | Admin |
| `GET` | `/api/v1/cart` | Lấy danh sách giỏ hàng của người dùng | User |
| `POST` | `/api/v1/cart/items` | Thêm sản phẩm vào giỏ hàng | User |
| `PUT` | `/api/v1/cart/items/{id}`| Cập nhật số lượng sản phẩm trong giỏ | User |
| `DELETE`| `/api/v1/cart/items/{id}`| Xóa sản phẩm khỏi giỏ hàng | User |
| `POST` | `/api/v1/orders` | Đặt hàng & thanh toán (COD / Chuyển khoản) | User |
| `GET` | `/api/v1/orders/my-orders`| Xem lịch sử đặt hàng của tài khoản | User |
| `GET` | `/api/v1/orders/admin/all`| Danh sách tất cả đơn hàng toàn hệ thống | Admin |
| `PUT` | `/api/v1/orders/admin/{id}/status` | Cập nhật trạng thái đơn hàng | Admin |
| `GET` | `/api/v1/orders/admin/dashboard-stats` | Thống kê doanh thu, đơn hàng, khách hàng | Admin |
| `POST` | `/api/v1/chat/message` | Gửi câu hỏi đến Chatbot AI RAG Groq LLM | Public / User |
| `GET` | `/api/v1/chat/history/{sessionId}` | Xem lại lịch sử phiên hội thoại | Public / User |
