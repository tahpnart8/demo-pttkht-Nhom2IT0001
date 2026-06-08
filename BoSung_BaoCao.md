Dưới đây là các đoạn nội dung bạn cần copy và dán bổ sung vào file Word báo cáo đồ án của bạn. Mình đã canh chỉnh theo đúng cấu trúc hiện tại của bạn.

---

### 1. Bổ sung vào "Bảng 3. Bảng công nghệ sử dụng" (Mục 4.2.2)
*Copy 2 dòng này dán thêm vào cuối Bảng 3:*

| Env Management     | dotenv                | Quản lý biến môi trường                                      |
| Data Visualization | Chart.js & React-Chartjs-2 | Vẽ biểu đồ thống kê tài chính trực quan, tương tác động      |

---

### 2. Bổ sung vào "Bảng 4. Bảng ma trận phân quyền truy cập" (Mục 4.2.3)
*Copy 2 dòng này dán thêm vào cuối Bảng 4:*

| Quản lý Xuất / Nhập / Tồn kho   | x      | x       | x         | x         | V         |
| Xem Báo cáo Thống kê Tài chính  | x      | x       | x         | x         | V         |

---

### 3. Viết nối tiếp vào "Mục 4.3.6. Nhóm giao diện Quản lý (Manager - Desktop)"
*Copy toàn bộ đoạn dưới đây và dán ngay bên dưới phần mô tả của "MH-18: Sidebar điều hướng Desktop Layout":*


**MH-19: Quản lý Kho nguyên liệu (Inventory Management)**

[Hình 4.22. Giao diện trang Quản lý Kho nguyên liệu]
*(Hướng dẫn cap hình: Mở web -> Đăng nhập Quản lý -> Chọn Quản lý Kho -> Tab Nguyên liệu. Chụp toàn màn hình).*

**Mô tả:** Trang tổng quan quản lý tình trạng nguyên vật liệu của quán, hỗ trợ quản lý theo dõi sát sao tài sản lưu động.
* **Lưới dữ liệu (Data Grid):** Hiển thị đầy đủ thông tin: Mã nguyên liệu, Tên, Đơn vị tính (Kg, Gram, Lít, Lon...), Số lượng tồn tại kho thực tế, và Mức tối thiểu (ngưỡng cảnh báo).
* **Hệ thống cảnh báo tự động (Auto-Alert):** Áp dụng logic so sánh lượng tồn thực tế và định mức. Các nguyên liệu có số lượng tồn dưới mức tối thiểu sẽ hiển thị cảnh báo đỏ nổi bật, hỗ trợ người quản lý lên kế hoạch đặt hàng và nhập kho kịp thời.
* **Bảo toàn toàn vẹn dữ liệu:** Tính năng Xóa nguyên liệu được tích hợp cơ chế kiểm tra quan hệ ràng buộc (Foreign Key Validation). Hệ thống sẽ chặn và báo lỗi nếu quản lý cố ý xóa một nguyên liệu đang nằm trong công thức của các món ăn, đảm bảo hệ thống không bị lỗi dữ liệu dây chuyền.


**MH-20: Thao tác Xuất/Nhập kho (Warehouse Transaction)**

[Hình 4.23. Giao diện modal Thao tác Xuất/Nhập kho]
*(Hướng dẫn cap hình: Tại Tab Nguyên liệu -> Bấm nút Nhập kho hoặc Xuất kho -> Chụp lại Modal Form đang nhập dữ liệu).*

**Mô tả:** Giao diện Form xử lý các giao dịch thay đổi số lượng kho theo thời gian thực (Real-time Transaction).
* **Form Nhập kho:** Quản lý nhập số lượng, đơn giá nhập, hệ thống tự động nhân tỷ giá để tính ra Thành tiền và ghi nhận trực tiếp vào biểu đồ Chi phí kinh doanh của tháng đó.
* **Form Xuất kho:** Tích hợp thuật toán "Zero-stock validation" (Kiểm tra tồn kho tuyệt đối). Hệ thống sẽ chặn ngay lập tức và báo lỗi nếu quản lý nhập số lượng xuất lớn hơn số lượng đang tồn tại kho. Tính năng này đảm bảo không bao giờ xảy ra tình trạng kho bị âm (Negative Inventory) gây sai lệch sổ sách. Hỗ trợ ghi nhận lý do xuất chi tiết (VD: Xuất quầy bar, Xuất hủy do hư hỏng).


**MH-21: Xử lý Kiểm kho định kỳ (Inventory Audit)**

[Hình 4.24. Giao diện thao tác Kiểm kho định kỳ]
*(Hướng dẫn cap hình: Sang Tab Kiểm Kho -> Bấm Tạo phiếu kiểm kho -> Nhập thử vài số lượng chênh lệch -> Chụp lại Modal đó).*

**Mô tả:** Giao diện hỗ trợ quy trình kiểm kê chốt sổ cuối ngày hoặc cuối tuần của quán.
* **Cơ chế tự động tính lệch (Discrepancy Calculation):** Hệ thống tự động truy xuất số lượng "Lý thuyết" tồn trong cơ sở dữ liệu. Người dùng chỉ việc nhập số lượng "Thực tế" kiểm đếm được bằng tay. 
* **Giao diện phản hồi trực quan:** Thuật toán ngay lập tức tính toán độ lệch và render màu cảnh báo (Badge): Màu đỏ cho "Hao hụt", Màu xanh cho "Dư thừa" và màu xám nếu "Khớp". Quản lý có thể thêm Ghi chú (VD: Rớt vỡ ly) trước khi Lưu để ghi nhận vĩnh viễn vào hệ thống phục vụ truy xuất sau này.


**MH-22: Báo cáo Thống kê Doanh thu (Analytics Dashboard)**

[Hình 4.25. Giao diện Dashboard Báo cáo Doanh thu]
*(Hướng dẫn cap hình: Chọn mục Báo cáo -> Chọn Tất cả thời gian -> Chụp toàn bộ màn hình có biểu đồ).*

**Mô tả:** Trung tâm phân tích tài chính và hoạt động kinh doanh (Business Intelligence) của hệ thống.
* **Bộ lọc thời gian động:** Tích hợp DatePicker cho phép truy vấn doanh thu theo một khoảng thời gian tùy chọn bất kỳ thay vì cố định các kỳ, mang lại sự linh hoạt tối đa.
* **Thẻ tổng quan (Summary Cards):** 3 thẻ lớn hiển thị Tổng Doanh Thu, Tổng Chi Phí Nhập Kho, và Lợi Nhuận Thuần với định dạng tiền tệ VNĐ. Đi kèm là bảng Top 5 món bán chạy nhất để phân tích hành vi tiêu dùng của khách hàng.
* **Biểu đồ động (Auto-scaling Chart):** Tích hợp thư viện Chart.js vẽ biểu đồ cột kép (Doanh Thu vs Chi Phí). Logic biểu đồ tự động thích ứng với khối lượng dữ liệu: Nếu khoảng thời gian < 31 ngày, trục X sẽ tự chia nhỏ theo Từng Ngày; Nếu thời gian > 31 ngày, trục X sẽ tự động gộp dữ liệu theo Tháng, giúp trải nghiệm xem báo cáo luôn gọn gàng và mang tính chuyên môn cao.


**MH-23: Báo cáo Kho (Master-Detail Report)**

[Hình 4.26. Giao diện Báo cáo Hao hụt và Xuất Nhập (Master-Detail)]
*(Hướng dẫn cap hình: Trong mục Báo cáo -> Chuyển sang Tab Xuất Nhập Kho -> Bấm "Xem chi tiết" 1 ngày -> Chụp màn hình có Modal đó).*

**Mô tả:** Giao diện thống kê luồng vận hành kho được thiết kế dựa trên Design Pattern "Master-Detail".
* **Bảng dữ liệu chính (Master):** Báo cáo Xuất Nhập được gom nhóm tự động theo "Từng Ngày có giao dịch", trong khi Báo cáo Hao hụt được gom theo "Từng Phiếu Kiểm". Việc gom nhóm này giúp người xem có cái nhìn tổng thể về hiệu suất hoạt động mà không bị ngợp bởi hàng ngàn dòng dữ liệu chi tiết.
* **Modal Chi tiết (Detail):** Khi người dùng muốn đào sâu dữ liệu (Drill-down) bằng cách bấm vào một ngày cụ thể, một Modal lớn sẽ xuất hiện. Modal này tách đôi màn hình: Nửa trên hiển thị danh sách các khoản NHẬP, nửa dưới hiển thị danh sách các khoản XUẤT trong đúng ngày đó. Cấu trúc này giúp truy vết (Traceability) dữ liệu cực kỳ nhanh chóng và chính xác.

---

### 4. Bổ sung vào "Bảng tổng hợp danh sách màn hình" (Mục 4.3.7)
*Copy các dòng dưới đây dán nối tiếp vào cuối Bảng tổng hợp (sau dòng MH-18):*

| MH-19 | Quản lý Kho – DS Nguyên liệu   | Quản lý      | /manager/inventory     |
| MH-20 | Quản lý Kho – Thao tác Xuất/Nhập | Quản lý      | /manager/inventory     |
| MH-21 | Quản lý Kho – Kiểm kho định kỳ  | Quản lý      | /manager/inventory     |
| MH-22 | Báo cáo Thống kê – Dashboard    | Quản lý      | /manager/reports       |
| MH-23 | Báo cáo Thống kê – Master-Detail| Quản lý      | /manager/reports       |
