# TÀI LIỆU GIẢI THÍCH VÀ MÔ TẢ CÁC SƠ ĐỒ HỆ THỐNG
**Dự án:** Phân tích và Thiết kế Hệ thống Thông tin Quản lý Bán hàng (POS) và Điều hành nội bộ cho quán cà phê Nhà Ba Teria.

Tài liệu này tổng hợp và giải thích chi tiết ý nghĩa, luồng hoạt động và các thành phần cấu tạo nên toàn bộ các sơ đồ được sử dụng trong Đồ án.

---

## 1. MÔ HÌNH HÓA CHỨC NĂNG (FUNCTIONAL MODEL)

### 1.1. Hệ thống Sơ đồ Use Case
Sơ đồ Use Case mô tả sự tương tác giữa người dùng (Actor) và hệ thống (System) nhằm thực hiện các chức năng cụ thể.

*   **Sơ đồ Use Case tổng quát (Hình 3.1):** 
    *   **Tác nhân (Actors):** Khách hàng, Nhân viên, Quản lý (kế thừa quyền của Nhân viên).
    *   **Cấu trúc:** Khách hàng chủ yếu tương tác với phân hệ "Gọi món". Nhân viên và Quản lý thực hiện các chức năng nội bộ (Quản lý đơn hàng, Thanh toán, Quản lý Menu, Bàn, Nhân viên). Tất cả các chức năng nội bộ đều có quan hệ `<<include>>` với Use Case "Đăng nhập", nghĩa là bắt buộc phải xác thực trước khi thao tác.
*   **Các Sơ đồ Use Case phân rã (Hình 3.2 - Hình 3.10):**
    *   **Đăng nhập:** Người dùng nhập tài khoản/mật khẩu, hệ thống xác thực và cấp quyền.
    *   **Gọi món & Quản lý giỏ hàng:** Khách hàng quét mã QR, xem menu, thêm/sửa món trong giỏ hàng và gửi order vào hệ thống.
    *   **Quản lý đơn hàng:** Barista, Phục vụ tiếp nhận đơn từ khách, cập nhật trạng thái từ *Chờ -> Đang làm -> Hoàn thành -> Đã giao*.
    *   **Thanh toán & Hóa đơn:** Thu ngân xem các đơn "Đã giao", chọn phương thức thanh toán, xuất hóa đơn và in bill.
    *   **Quản trị (Nhân viên, Bàn, Menu):** Dành riêng cho Quản lý để thực hiện các thao tác CRUD (Thêm, Xem, Sửa, Xóa).

### 1.2. Hệ thống Sơ đồ Luồng dữ liệu (Data Flow Diagram - DFD)
Sơ đồ DFD mô tả cách dữ liệu di chuyển trong hệ thống, từ khi nhập liệu, qua các tiến trình xử lý, đến khi được lưu trữ hoặc xuất ra.

*   **DFD Mức 0 (Hình 3.11):** Còn gọi là sơ đồ ngữ cảnh, thể hiện hệ thống Nhà Ba Teria là một khối thống nhất xử lý dữ liệu từ 4 tác nhân bên ngoài: Khách hàng (gửi yêu cầu), Barista/Phục vụ (nhận và cập nhật đơn), Thu ngân (nhận thông tin thanh toán), Quản lý (quản trị dữ liệu).
*   **DFD Mức 1 (Hình 3.12):** Phân rã hệ thống thành 5 tiến trình chính:
    1. Quản lý Đặt món
    2. Xử lý Đơn hàng
    3. Thanh toán & Hóa đơn
    4. Quản trị Hệ thống
    5. Xác thực & Phân quyền
*   **DFD Mức 2 (Hình 3.13 - 3.17):** Phân rã chi tiết từng tiến trình của Mức 1. Ví dụ, tiến trình 2.0 (Xử lý đơn hàng) được chia thành: *Tạo đơn từ giỏ (2.1), Pha chế (2.2), Giao món (2.3), Theo dõi tiến độ (2.4)*, tương tác trực tiếp với các kho dữ liệu D2 (Giỏ hàng), D3 (Đơn hàng), D6 (Bàn).

---

## 2. MÔ HÌNH HÓA CẤU TRÚC (STRUCTURAL MODEL)

### 2.1. Sơ đồ các Lớp (Class Diagram - Hình 3.18)
Sơ đồ Lớp mô tả cấu trúc tĩnh của phần mềm bằng cách hiển thị các lớp, thuộc tính, phương thức và mối quan hệ giữa chúng.
*   **Các lớp chính:** TAIKHOAN, NHANVIEN, BAN, MENU, MON, GIOHANG, CHITIETGIOHANG, DONHANG, CHITIETDONHANG, HOADON, THANHTOAN.
*   **Quan hệ:**
    *   *1-1 (Một - Một):* NHANVIEN và TAIKHOAN.
    *   *1-N (Một - Nhiều):* Một BAN có nhiều DONHANG, Một HOADON chứa nhiều DONHANG.
    *   *Composition (Phụ thuộc tồn tại):* CHITIETDONHANG phụ thuộc hoàn toàn vào DONHANG. Nếu DONHANG bị xóa, chi tiết của nó cũng biến mất.

### 2.2. Sơ đồ Thực thể Mối quan hệ (ERD - Hình 4.1)
Sơ đồ ERD dùng để thiết kế Cơ sở dữ liệu vật lý (Database). Nó ánh xạ từ Class Diagram sang các bảng (Tables) thực tế trong CSDL PostgreSQL.
*   Thể hiện rõ các Khóa chính (PK) như `MaDH`, `MaMon` và Khóa ngoại (FK).
*   Định nghĩa các ràng buộc toàn vẹn: VD `TrangThai` của Bàn chỉ được là "Trống" hoặc "Đang có khách".

---

## 3. MÔ HÌNH HÓA HÀNH VI (BEHAVIOR MODEL)

### 3.1. Sơ đồ Tuần tự (Sequence Diagram)
Sơ đồ Tuần tự mô tả trình tự thời gian của các thông điệp (messages) được trao đổi giữa các đối tượng để hoàn thành một chức năng.

*   **Luồng Gọi món (Hình 3.19 - 3.22):** Khách quét QR -> MenuController tải menu -> Khách chọn món -> CartController tạo giỏ -> Khách chốt đơn -> OrderController tạo Đơn hàng, xóa Giỏ tạm, cập nhật trạng thái Bàn thành "Đang có khách".
*   **Luồng Đăng nhập (Hình 3.23 - 3.27):** Người dùng nhập thông tin -> AuthController truy vấn Database. Nếu thành công -> Sinh Token (JWT) -> Điều hướng đến màn hình tương ứng với Role (Barista/Thu ngân/Quản lý).
*   **Luồng Xử lý đơn hàng (Hình 3.28 - 3.33):** Barista lấy đơn "Chờ" -> Đổi sang "Đang làm" -> Báo "Hoàn thành". Phục vụ nhận món "Hoàn thành" -> Mang ra bàn -> Đổi thành "Đã giao". Cùng lúc đó, Khách hàng (qua màn hình Mobile) sẽ thấy trạng thái đơn hàng nhảy từng nấc một.
*   **Luồng Thanh toán (Hình 3.34 - 3.39):** Thu ngân chọn bàn "Đang có khách" -> PaymentController kéo danh sách đơn "Đã giao" -> Tạo Hóa đơn -> Chọn phương thức TT (Tiền mặt/Chuyển khoản) -> Cập nhật trạng thái thanh toán -> In bill và giải phóng trạng thái Bàn về "Trống".
*   **Luồng Thêm nhân viên (Hình 3.40 - 3.45):** Quản lý điền form -> StaffController kiểm tra trùng lặp (SĐT, Username) -> Nếu hợp lệ, INSERT vào bảng NHANVIEN và TAIKHOAN -> Trả về thông báo thành công.

### 3.2. Sơ đồ Hoạt động (Activity Diagram - Hình 3.46 - 3.53)
Sơ đồ Hoạt động mô tả luồng logic (thuật toán) dưới dạng các bước công việc (Activities) và rẽ nhánh điều kiện (Decisions) của từng nghiệp vụ.
*   Ví dụ: Trong Activity Diagram của "Quản lý hóa đơn", hệ thống bắt đầu bằng việc hiển thị danh sách, người dùng chọn tìm kiếm hoặc xem chi tiết. Nếu chọn tìm kiếm, hệ thống có nhánh kiểm tra xem dữ liệu có khớp không, nếu khớp thì hiển thị kết quả, nếu không thì báo "Không tìm thấy".

---

## 4. THIẾT KẾ KIẾN TRÚC VÀ GIAO DIỆN (ARCHITECTURE & UI)

### 4.1. Kiến trúc hệ thống (Hình 4.2 & 4.3)
*   **Mô hình 3 tầng (3-tier):**
    1.  **Presentation (Tầng hiển thị):** React + Vite. Nơi khách hàng và nhân viên thao tác qua màn hình cảm ứng hoặc Desktop.
    2.  **Business Logic (Tầng xử lý):** Node.js + Express. Xử lý API, xác thực JWT, phân quyền, điều phối logic nghiệp vụ.
    3.  **Data (Tầng dữ liệu):** Supabase (PostgreSQL). Nơi lưu trữ bảng, khóa ngoại và ràng buộc an toàn dữ liệu.
*   **Luồng xác thực JWT:** Đảm bảo tính bảo mật. Người dùng sau khi đăng nhập nhận được một chuỗi JWT. Mọi thao tác sau đó (sửa đơn, thanh toán) đều phải gửi kèm chuỗi JWT này để hệ thống kiểm tra quyền.

### 4.2. Giao diện (Mockup/Prototype)
Hệ thống giao diện được thiết kế theo các nguyên tắc:
*   **Mobile-first:** Các màn hình dành cho Khách, Barista và Phục vụ được thiết kế dọc (430x932px) để dễ thao tác bằng một tay trên điện thoại.
*   **Desktop Layout:** Dành cho Thu ngân và Quản lý để hiển thị được nhiều số liệu (dạng bảng, sidebar).
*   **Glassmorphism & UX:** Giao diện áp dụng hiệu ứng kính mờ tinh tế, tích hợp biểu tượng (icons) để nhân viên dễ nhận diện và thao tác nhanh trong khung giờ cao điểm quán đông khách.

---
*Tài liệu này được soạn thảo nhằm phục vụ mục đích thuyết minh và nắm bắt toàn diện ý nghĩa của hệ thống sơ đồ kỹ thuật trong Đồ án.*
