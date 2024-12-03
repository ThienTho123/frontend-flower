
# 🌺 Website Bán Hoa 🌷

Chào mừng bạn đến với **Website Bán Hoa** - một nền tảng giúp khách hàng dễ dàng mua sắm và tìm hiểu về các loài hoa. Dự án được thiết kế với giao diện thân thiện, tích hợp các tính năng quản lý sản phẩm, giỏ hàng, và thanh toán trực tuyến.

## 🎨 Tổng Quan
**Website Bán Hoa** cung cấp:
- 🌼 **Danh mục hoa đa dạng**: Phù hợp với mọi nhu cầu như quà tặng, trang trí sự kiện, và hơn thế nữa.
- 🛒 **Giỏ hàng tiện lợi**: Tích hợp quy trình thanh toán đơn giản.
- 📊 **Quản lý dễ dàng**: Hệ thống backend hỗ trợ quản lý sản phẩm, hóa đơn, và khách hàng hiệu quả.

![Hình ảnh giao diện](https://drive.google.com/uc?id=1-W4NtWlcNTchihlsT6n9HBRm0USlp2Lp)

---

## 1. Yêu Cầu Hệ Thống
- **Java JDK** (phiên bản 8 trở lên)
- **Node.js** (phiên bản 16 trở lên)
- **MySQL** hoặc hệ quản trị cơ sở dữ liệu tương thích
- **Git** để clone mã nguồn
- **IntelliJ IDEA** và **Visual Studio Code**

---

## 2. Hướng Dẫn Cài Đặt
### 2.1 Clone hoặc Tải Dự Án
- **Backend**: Clone từ [Backend Repository](https://github.com/TXTThien/FlowerShop.git)
- **Frontend**: Clone từ [Frontend Repository](https://github.com/ThienTho123/frontend-flower.git)

### 2.2 Cài Đặt Cơ Sở Dữ Liệu
1. Import file `flowershop.sql` vào MySQL.
2. Đảm bảo MySQL đang chạy trên cổng mặc định (`3306`) hoặc thay đổi phù hợp.

### 2.3 Cấu Hình Backend
```properties
spring.datasource.url=jdbc:mysql://<Địa chỉ máy chủ>:<Cổng>/flowershop
spring.datasource.username=<Tên người dùng>
spring.datasource.password=<Mật khẩu>
```
> **Ghi chú:**
> - `<Địa chỉ máy chủ>` mặc định là `localhost`.
> - `<Cổng>` mặc định là `3306`, thay đổi nếu sử dụng cổng khác.

### 2.4 Cấu Hình Frontend
1. Mở thư mục frontend trong **Visual Studio Code**.
2. Chạy lệnh:
   ```bash
   npm i --force
   ```
   để cài đặt các gói cần thiết.
3. Sau khi cài đặt hoàn tất, chạy lệnh:
   ```bash
   npm start
   ```
   để khởi động ứng dụng.

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
