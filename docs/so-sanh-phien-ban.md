# BÁO CÁO SO SÁNH PHIÊN BẢN HỆ THỐNG: GIỮA KỲ VÀ CUỐI KỲ
**Dự án:** Hệ thống POS và Quản lý nội bộ quán cafe Nhà Ba Teria

Dựa trên tài liệu thiết kế ban đầu (Bản cũ - Đồ án giữa kỳ) và tài liệu bổ sung (`newplan.md` - Bản mới cho đồ án cuối kỳ), dưới đây là phân tích và so sánh chi tiết những thay đổi mang tính cốt lõi của hệ thống.

---

## 1. PHẠM VI HỆ THỐNG VÀ QUY TRÌNH NGHIỆP VỤ (BUSINESS LOGIC)

| Tiêu chí | Phiên bản Cũ (Giữa kỳ) | Phiên bản Mới (Bổ sung Cuối kỳ) | Đánh giá Tác động |
| :--- | :--- | :--- | :--- |
| **Mục tiêu chính** | Tập trung vào bán hàng (POS): Order mã QR, quản lý trạng thái món, thanh toán và quản lý cơ bản (Menu, Bàn, Nhân viên). | Nâng cấp thành hệ thống ERP thu nhỏ: Bổ sung Quản lý Kho chuyên sâu, Công thức định lượng (BOM) và Báo cáo thống kê. | Hệ thống chuyển từ việc chỉ "ghi nhận" sang "quản trị vận hành", giúp chủ quán kiểm soát chi phí và thất thoát. |
| **Quản lý trạng thái món** | Thủ công. Quản lý tự vào hệ thống bật/tắt trạng thái "Còn món / Hết món". | **Tự động hóa**. Hệ thống dựa trên tồn kho nguyên liệu. Nếu (Tồn kho < Định mức), món tự động chuyển sang "Tạm ngưng phục vụ" trên menu khách. | Nâng cao UX cho khách (không order nhầm món đã hết). Đòi hỏi thuật toán kiểm tra kho thời gian thực (Real-time stock check) phức tạp hơn. |
| **Dòng chảy nguyên liệu** | Không quản lý. Khách mua -> Tính tiền. | Quản lý vòng đời chặt chẽ: Đầu ca xuất nguyên liệu ra quầy -> Bán hàng (trừ kho tự động theo công thức) -> Cuối ca cất nguyên liệu dư vào kho -> Cuối tuần đối chiếu kiểm kho. | Tránh thất thoát. Đòi hỏi logic liên kết nhiều bảng: Khi `DONHANG` hoàn thành, hệ thống trigger vòng lặp trừ số lượng trong `NGUYENLIEU` dựa vào `CONGTHUC`. |
| **Kiểm kho và Báo cáo** | Không có. | Hệ thống đối chiếu thông minh. Nhân viên nhập số lượng kiểm kê thực tế -> Hệ thống so sánh với số liệu lý thuyết (dựa trên hóa đơn bán ra x công thức) -> Cảnh báo chênh lệch (hao hụt). | Xử lý triệt để bài toán gian lận hoặc hao hụt thực tế (do pha chế sai tay nghề). |

---

## 2. THAY ĐỔI VỀ CƠ SỞ DỮ LIỆU (DATABASE & ERD)

Đây là phần có sự thay đổi lớn nhất, cấu trúc dữ liệu phình to gần gấp đôi để đáp ứng các nghiệp vụ mới.

*   **Số lượng thực thể:** Tăng từ **11 thực thể** (Bản cũ) lên **20 thực thể** (Bản mới).
*   **Các bảng MỚI được thêm vào (Thuộc phân hệ Kho & Định mức):**
    1.  `NGUYENLIEU`: Quản lý danh mục, số tồn và ngưỡng cảnh báo hết.
    2.  `CONGTHUC` (Bảng trung gian n-n): Liên kết `MON` và `NGUYENLIEU`, chứa định lượng (VD: 1 Cà phê sữa = 30g cafe + 20ml sữa).
    3.  `NCC`: Quản lý nhà cung cấp.
    4.  `PHIEUNHAP` & `CHITIETPHIEUNHAP`: Ghi nhận luồng hàng vào, cộng tồn kho và tính đơn giá vốn.
    5.  `PHIEUXUAT` & `CHITIETPHIEUXUAT`: Ghi nhận luồng xuất hàng (xuất ra quầy, xuất hủy), trừ tồn kho.
    6.  `PHIEUKIEMKHO` & `CHITIETKIEMKHO`: Lưu trữ báo cáo chênh lệch giữa số thực tế và số lý thuyết.

---

## 3. THAY ĐỔI VỀ HÀNH VI VÀ PHƯƠNG THỨC (CLASS DIAGRAM)

Các class cũ phải được "nâng cấp" thêm các phương thức mới để giao tiếp với phân hệ Kho:

*   **Lớp `MON`**: Bổ sung hàm `KiemTraTonKho()` để quét xem các nguyên liệu cấu thành nên món này có còn đủ hay không trước khi render ra menu.
*   **Lớp `DONHANG`**: Bổ sung hàm `TruTonKhoTuDong()` được gọi khi trạng thái đơn hàng chuyển sang "Hoàn thành" hoặc "Đã giao".
*   **Actor mới/Quyền hạn mới**: Bổ sung quyền "Quản lý kho" vào hệ thống tài khoản, hoặc mở rộng đặc quyền cho "Quản lý".

---

## 4. TÁC ĐỘNG TỚI GIAO DIỆN (UI/UX)

*   **Frontend (Khách hàng - CustomerMenu)**: Phải call API để check stock trước. Những món không đủ nguyên liệu sẽ bị mờ đi (Overlay xám) và hiển thị nhãn "Hết nguyên liệu", không cho phép bấm thêm vào giỏ. Đặc biệt lưu ý logic nguyên liệu chung (Hết sữa đặc -> Tắt toàn bộ món có dùng sữa đặc).
*   **Frontend (Quản trị - Manager Layout)**: Cần thêm một loạt Menu Sidebar mới:
    *   **Quản lý Nguyên Liệu**: Thêm/sửa/xóa nguyên liệu, thiết lập mức cảnh báo.
    *   **Quản lý Công thức (Recipe)**: Mapping món ăn với nguyên liệu tương ứng.
    *   **Nhập / Xuất / Kiểm kho**: Giao diện tạo phiếu chứng từ kho.
    *   **Dashboard Báo Cáo**: Hiển thị Biểu đồ doanh thu, Chi phí giá vốn (COGS), Báo cáo hàng bán chạy, và Báo cáo hao hụt kho.

---

## 5. THÁCH THỨC KỸ THUẬT CẦN XỬ LÝ CHO ĐỒ ÁN CUỐI KỲ

1.  **Thuật toán Check-Stock (Hiệu năng):** Khi khách hàng mở điện thoại quét QR, hệ thống phải quét danh sách món -> tìm công thức -> kiểm tra tồn kho nguyên liệu. Nếu làm không khéo sẽ gây thắt cổ chai (bottleneck) làm ứng dụng bị chậm.
2.  **Tính toàn vẹn Dữ liệu (Transactions):** Khi thanh toán/hoàn thành đơn hàng, việc trừ tồn kho của nhiều nguyên liệu phải được bọc trong một Transaction (SQL Transaction). Nếu trừ bị lỗi giữa chừng, phải rollback lại toàn bộ để kho không bị sai lệch.
3.  **Cập nhật các Sơ đồ DFD (Mức 2) & Sequence Diagram:** Phải vẽ thêm rẽ nhánh (Alt/Loop) cho các trường hợp báo lỗi hết nguyên liệu hoặc tính toán hao hụt trong sơ đồ.
