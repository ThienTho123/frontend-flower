
# Hướng Dẫn Triển Khai Dự Án

---

## 1. Yêu Cầu Hệ Thống
Để triển khai và chạy dự án, đảm bảo rằng bạn đã cài đặt các công cụ sau:
- **Java JDK** (phiên bản 8 trở lên)
- **IntelliJ IDEA** hoặc một IDE hỗ trợ Spring Boot
- **Node.js** (phiên bản 16 trở lên)
- **MySQL** (hoặc một hệ quản trị cơ sở dữ liệu tương thích)
- **Visual Studio Code** (hoặc IDE tương tự để phát triển React)
- **Git** để clone dự án từ GitHub

---

## 2. Hướng Dẫn Cài Đặt

### 2.1 Clone hoặc Tải Dự Án
- **Backend**: Clone hoặc tải mã nguồn từ [Backend Repository](https://github.com/TXTThien/FlowerShop.git)
- **Frontend**: Clone hoặc tải mã nguồn từ [Frontend Repository](https://github.com/ThienTho123/frontend-flower.git)

---

### 2.2 Cài Đặt Cơ Sở Dữ Liệu
1. Mở MySQL Workbench hoặc công cụ quản lý cơ sở dữ liệu khác.
2. Import file `flowershop.sql` từ thư mục **Backend** để khởi tạo cơ sở dữ liệu.

---

### 2.3 Cấu Hình Backend
1. Mở thư mục **backend** trong **IntelliJ IDEA**.
2. Điều chỉnh cấu hình cơ sở dữ liệu trong file `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:<Cổng>/flowershop
   spring.datasource.username=<Tên người dùng>
   spring.datasource.password=<Mật khẩu>
   ```
3. (Tuỳ chọn) Nếu muốn thay đổi Firebase lưu trữ hình ảnh:
   - Thay thế tệp `GoogleCloudConsole.json` trong thư mục dự án bằng file cấu hình Firebase của bạn.

---

### 2.4 Thiết Lập Server Backend
1. Trong **IntelliJ IDEA**, mở menu **Run > Edit Configurations…**.
2. Thêm cấu hình mới:
   - Chọn **Spring Boot** và chỉ định `Main class` là file chính của ứng dụng (ví dụ: `SpringbootdemoApplication`).
   - Đặt tên cho server nếu cần, sau đó nhấn **Apply**.
3. Để chạy server backend:
   - Bấm **Run** hoặc chọn trực tiếp file chính `SpringbootdemoApplication`, sau đó bấm **Run**.
4. Kiểm tra hoạt động của server bằng cách truy cập:
   ```
   http://localhost:8080/swagger-ui/index.html
   ```

---

### 2.5 Cài Đặt Frontend
1. Mở thư mục **frontend** bằng **Visual Studio Code**.
2. Mở terminal, chạy lệnh:
   ```bash
   npm i --force
   ```
   để cài đặt các gói cần thiết.
3. Sau khi cài đặt hoàn tất, tiếp tục chạy:
   ```bash
   npm start
   ```
   để khởi động ứng dụng frontend.

---

## 3. Liên Kết Kiểm Tra
- **Backend API Documentation**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **Frontend**: Sau khi chạy `npm start`, truy cập [http://localhost:8000](http://localhost:8000) để xem giao diện người dùng.

---

## 4. Ghi Chú
- Hãy đảm bảo rằng cổng `8080` (backend) và `8000` (frontend) không bị sử dụng bởi ứng dụng khác.
- Trong trường hợp gặp lỗi, kiểm tra lại cấu hình cơ sở dữ liệu hoặc liên hệ nhóm phát triển để được hỗ trợ.

--- 

## 5. Thông Tin Liên Hệ
- **Nhóm Phát Triển**: 
  - Backend: [TXTThien](https://github.com/TXTThien)
  - Frontend: [ThienTho123](https://github.com/ThienTho123) 
