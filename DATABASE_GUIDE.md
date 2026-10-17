# 🗄️ HƯỚNG DẪN TRUY CẬP VÀ QUẢN TRỊ CƠ SỞ DỮ LIỆU
## Dự Án: Phú Quý Luxury Furniture E-Commerce (PostgreSQL 17)

Tài liệu này hướng dẫn chi tiết các phương pháp kết nối, truy vấn và quản lý cơ sở dữ liệu `phuquy_db` khi hệ thống đang hoạt động.

---

## 📌 1. THÔNG SỐ KẾT NỐI (CONNECTION PARAMETERS)

| Thông số | Giá trị mặc định | Chú thích |
|---|---|---|
| **Host** | `localhost` (hoặc `127.0.0.1`) | Máy chủ cơ sở dữ liệu |
| **Port** | `5432` | Cổng PostgreSQL mặc định |
| **Database Name** | `phuquy_db` | Tên cơ sở dữ liệu |
| **Username** | `postgres` | Tài khoản quản trị DB |
| **Password** | `postgres` (hoặc giá trị trong `.env`) | Mật khẩu kết nối |
| **Connection URI** | `postgresql://postgres:postgres@localhost:5432/phuquy_db` | Dùng cho VS Code / Prisma / DBeaver |

---

## 🖼️ 2. SƠ ĐỒ THỰC THỂ QUAN HỆ (ERD SVG)

Toàn bộ 15 bảng cơ sở dữ liệu đã được trực quan hóa dưới dạng ảnh vector SVG chất lượng cao:
- **Tệp gốc**: [database_erd.svg](file:///d:/Job/PhuQuy/database_erd.svg)
- **Xem trực tiếp trên trình duyệt khi Frontend đang chạy**: [http://localhost:5173/database_erd.svg](http://localhost:5173/database_erd.svg)

---

## 💻 3. CÁC CÁCH KẾT NỐI VÀ TRUY CẬP CƠ SỞ DỮ LIỆU

### Cách 1: Sử dụng DBeaver (Khuyên dùng nhất - Trực quan, miễn phí)
1. Tải và cài đặt DBeaver miễn phí tại: [https://dbeaver.io](https://dbeaver.io)
2. Mở DBeaver, chọn menu **Database** ➔ **New Database Connection** ➔ Chọn **PostgreSQL** ➔ Bấm **Next**.
3. Điền thông tin kết nối:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `phuquy_db`
   - **Username**: `postgres`
   - **Password**: `postgres`
4. Bấm nút **Test Connection** (Nếu DBeaver hỏi tải Driver PostgreSQL JDBC, bấm Download).
5. Bấm **Finish**. Bạn có thể duyệt bảng, xem ER Diagram sinh tự động, và chỉnh sửa dữ liệu dạng Excel.

---

### Cách 2: Sử dụng pgAdmin 4 (Công cụ chính thức đi kèm PostgreSQL)
1. Mở **Start Menu** trên Windows ➔ Gõ tìm kiếm và mở **pgAdmin 4**.
2. Nhập Master Password lúc cài PostgreSQL.
3. Ở cột bên trái, điều hướng theo đường dẫn:
   `Servers` ➔ `PostgreSQL 17` ➔ `Databases` ➔ `phuquy_db` ➔ `Schemas` ➔ `public` ➔ `Tables`.
4. Xem dữ liệu: Chuột phải vào bất kỳ bảng nào (VD: `products`, `orders`) ➔ Chọn **View/Edit Data** ➔ **All Rows**.
5. Chạy SQL: Bấm vào biểu tượng kính lúp / **Query Tool** trên thanh công cụ để viết lệnh SQL.

---

### Cách 3: Sử dụng Extension trong VS Code
Nếu bạn đang dùng VS Code để phát triển:
1. Mở tab Extensions (`Ctrl + Shift + X`), tìm và cài đặt:
   - **Database Client** (của cweijan) hoặc **PostgreSQL** (của Chris Kolkman).
2. Bấm vào biểu tượng Database ở thanh Sidebar bên trái ➔ Bấm **Create Connection** ➔ Chọn **PostgreSQL**.
3. Nhập Connection URL:
   ```text
   postgresql://postgres:postgres@localhost:5432/phuquy_db
   ```
4. Bấm **Connect** để duyệt bảng trực tiếp trong VS Code mà không cần cài thêm phần mềm ngoài.

---

### Cách 4: Sử dụng Dòng lệnh CLI (`psql`)
Bạn có thể kết nối ngay trong Terminal / PowerShell mà không cần cài thêm bất kỳ giao diện nào:

#### Trên Windows (PowerShell):
```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d phuquy_db
```
*(Hệ thống sẽ hỏi mật khẩu: nhập `postgres` và nhấn Enter)*.

#### Trên Linux / macOS:
```bash
psql -h localhost -U postgres -d phuquy_db
```

#### Một số lệnh `psql` thông dụng:
- `\dt` : Liệt kê tất cả 15 bảng trong database.
- `\d products` : Xem cấu trúc chi tiết các cột, kiểu dữ liệu, index của bảng `products`.
- `\q` : Thoát khỏi psql.

---

### Cách 5: Nếu bạn đang chạy ứng dụng bằng Docker Compose
Nếu hệ thống đang chạy qua Docker:
```bash
# Truy cập psql bên trong container
docker exec -it phuquy_postgres psql -U postgres -d phuquy_db
```

---

## 🔍 4. CÁC CÂU LỆNH TRUY VẤN SQL MẪU TIỆN DỤNG

Sau khi kết nối, bạn có thể chạy các câu truy vấn hữu ích sau để kiểm tra dữ liệu:

### 1. Xem danh sách tài khoản (Admin & Khách hàng):
```sql
SELECT id, email, full_name, phone, status, role_id, created_at 
FROM users;
```

### 2. Xem sản phẩm nội thất kèm giá và tồn kho:
```sql
SELECT id, name, price, discount_price, stock_quantity, material, is_featured 
FROM products 
ORDER BY price DESC;
```

### 3. Xem các đơn hàng mới nhất và trạng thái thanh toán:
```sql
SELECT order_code, recipient_name, total_amount, payment_method, payment_status, status, created_at 
FROM orders 
ORDER BY created_at DESC;
```

### 4. Xem lịch sử tin nhắn tư vấn AI Chatbot RAG:
```sql
SELECT m.id, m.session_id, m.sender, m.content, m.created_at 
FROM chat_messages m 
ORDER BY m.created_at DESC 
LIMIT 10;
```

### 5. Xem danh sách mã giảm giá (Vouchers):
```sql
SELECT code, title, discount_type, discount_value, min_order_value, usage_limit, used_count, is_active 
FROM vouchers;
```
