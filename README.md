
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
- **Git** để quản lý mã nguồn  
- **IntelliJ IDEA** và **Visual Studio Code**  

---

## 2. Hướng Dẫn Cài Đặt

### Bước 1: Clone hoặc Tải Dự Án
- **Backend**: Clone từ [Backend Repository](https://github.com/TXTThien/FlowerShop.git)
- **Frontend**: Clone từ [Frontend Repository](https://github.com/ThienTho123/frontend-flower.git)

### Bước 2: Cài Đặt Cơ Sở Dữ Liệu
1. Import file `flowershop.sql` vào MySQL.
2. Đảm bảo MySQL đang chạy trên cổng mặc định (`3306`) hoặc thay đổi phù hợp.

### Bước 3: Cấu Hình Backend
1. Mở **IntelliJ IDEA** và truy cập thư mục backend.
2. Chỉnh sửa cấu hình cơ sở dữ liệu trong file `application.properties` như sau:
    ```properties
    spring.datasource.url=jdbc:mysql://<Địa chỉ máy chủ>:<Cổng>/flowershop
    spring.datasource.username=<Tên người dùng>
    spring.datasource.password=<Mật khẩu>
    ```
    - `<Địa chỉ máy chủ>` mặc định là `localhost`.
    - `<Cổng>` mặc định là `3306`, thay đổi nếu cần.
3. Nếu muốn thay đổi nơi lưu trữ hình ảnh, chỉnh sửa khóa key trong file `GoogleCloudConsole.json`.

### Bước 4: Thiết Lập Server Backend
1. Trên thanh header, bấm vào **Current File**, chọn **Edit Configurations…** để mở hộp thoại cấu hình server.
2. Chọn **Add New…**, kéo xuống chọn **Spring Boot**.
3. Nhập tên file main class hoặc bấm vào biểu tượng để chọn file đó. Bấm **Apply** để hoàn tất.

### Bước 5: Chạy Server Backend
1. Bấm nút **Run** hoặc chọn trực tiếp file `SpringbootdemoApplication`, sau đó chọn **Current File** và bấm **Run**.
2. Truy cập vào địa chỉ sau để kiểm tra:
   [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

### Bước 6: Cấu Hình Frontend
1. Mở **Visual Studio Code** và truy cập thư mục frontend.
2. Mở terminal và chạy lệnh:
    ```bash
    npm i --force
    ```
3. Sau khi cài đặt hoàn tất, chạy lệnh:
    ```bash
    npm start
    ```

---

## 3. Liên Kết Kiểm Tra
- **Backend API Documentation**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **Frontend**: Sau khi chạy `npm start`, truy cập [http://localhost:8000](http://localhost:8000).

---

## 4. Ghi Chú
- Đảm bảo rằng các cổng `8080` (backend) và `8000` (frontend) không bị xung đột.
- Nếu gặp lỗi, kiểm tra lại cấu hình cơ sở dữ liệu hoặc liên hệ nhóm phát triển để được hỗ trợ.

---

## 5. Thông Tin Liên Hệ
- **Nhóm Phát Triển**:
  - Backend: [TXTThien](https://github.com/TXTThien)
  - Frontend: [ThienTho123](https://github.com/ThienTho123)
