# BÁO CÁO PHẢN BIỆN: LỖ HỔNG LOGIC QUY TRÌNH HỆ THỐNG MỚI

Sau khi phân tích sâu vào bản thiết kế bổ sung (`newplan.md`), mặc dù ý tưởng hệ thống RẤT TỐT và mang tính thực tiễn cao, nhưng khi đặt vào môi trường vận hành thực tế (quán cafe đông khách, nhân viên thao tác vội vã), hệ thống xuất hiện **6 LỖ HỔNG LỚN (Bottlenecks & Edge Cases)**. 

Dưới đây là sự phản biện gay gắt nhằm mục đích bít các lỗ hổng này trước khi ta bắt tay vào code và vẽ DFD.

---

## 1. Lỗ hổng thời điểm Trừ Kho (Overselling / Hủy đơn)
*   **Logic đề xuất:** `Khi trạng thái đơn hàng là DONE (Hoàn thành) -> Hệ thống tự động trừ kho.`
*   **Phản biện:**
    *   **Overselling (Bán lố):** Quán chỉ còn đủ nguyên liệu cho 1 ly Trà Đào. Khách A order (Trạng thái: *Chờ*). Hệ thống CHƯA TRỪ KHO vì chưa DONE. Khách B vào app vẫn thấy món Trà Đào hiển thị "Còn hàng" và order tiếp. Barista pha cho khách A xong, quay sang khách B thì mới phát hiện hết nguyên liệu.
    *   **Hủy đơn / Làm hỏng (Waste):** Nếu Barista làm xong (Trạng thái *Done*, kho đã trừ), nhưng bưng ra khách lỡ tay làm đổ, hoặc khách báo hủy đơn. Nếu ta hủy đơn trên phần mềm, kho có được cộng lại không? Trả lời là KHÔNG, vì nguyên liệu đã bị pha rồi, không thể cất lại vào kho.
*   **Giải pháp (Cần vá):**
    *   Trừ kho phải diễn ra ngay khi đơn hàng được **CHỐT** (Chuyển sang `Đang làm` hoặc ngay lúc `Gửi đơn` thành công) để giữ chỗ (Reservation).
    *   Phải có thêm tính năng **Xuất Hủy (Wastage)**. Nếu làm sai/đổ, Barista bấm nút "Làm lại", hệ thống phải tạo một phiếu `PHIEUXUAT` (Lý do: Hao hụt/Làm hỏng) để trừ tiếp nguyên liệu.

## 2. Lỗ hổng Độ trễ Cập nhật (Realtime Gap)
*   **Logic đề xuất:** `Tới khi hết nguyên liệu trên quầy và trong kho, nhân viên mới nhập lên hệ thống (-1 hộp) -> Hệ thống khóa món.`
*   **Phản biện:**
    *   Khi quán đang đông (Giờ cao điểm), Barista dốc cạn hộp sữa cuối cùng. Họ phải lo pha tiếp ly khác chứ làm gì có thời gian mở app lên để bấm "Hết sữa". 
    *   Sẽ có một "độ trễ" khoảng 5-10 phút từ lúc sữa thực sự hết đến lúc phần mềm được cập nhật. Trong 10 phút đó, khách hàng bên ngoài vẫn quét QR và order đồ uống có sữa nườm nượp -> Hệ thống nhận đơn rác, Barista phải ra xin lỗi từng khách.
*   **Giải pháp (Cần vá):**
    *   Phải dựa hoàn toàn vào hệ thống để khóa món tự động. Máy tính tự động tính: *Tổng Tồn (Kho + Quầy) - Lượng dự kiến đang pha = Tồn thực tế*. Nếu Tồn thực tế < Định mức 1 ly -> Tự động khóa món trên app Khách hàng ngay lập tức mà không cần chờ Barista bấm nút. 

## 3. Lỗ hổng Quy đổi Đơn vị tính (Unit Conversion)
*   **Logic đề xuất:** `Linh động nhiều đơn vị (chai, thùng...)`
*   **Phản biện:**
    *   Quản lý **NHẬP KHO** bằng *Thùng* (VD: 1 Thùng sữa đặc Ngôi Sao Phương Nam). 
    *   Hệ thống **TRỪ KHO** khi pha chế bằng *ml* (VD: Cà phê sữa trừ 20ml sữa đặc).
    *   Hệ thống máy tính rất ngu, nó không biết 1 Thùng = bao nhiêu ml. Nếu bảng `NGUYENLIEU` không có trường *Hệ số quy đổi*, hệ thống sẽ lấy số lượng thùng trừ đi ml (1 Thùng - 20 = -19 Thùng) -> Database sụp đổ.
*   **Giải pháp (Cần vá):**
    *   Thiết kế bảng `NGUYENLIEU` phải phân định rõ: `DonViNhap` (Thùng/Hộp) và `DonViSuDung` (gram, ml). Phải thêm một cột `TyLeQuyDoi` (VD: 1 Thùng = 48 Hộp * 380ml = 18240). Mọi thao tác tính toán, trừ kho bên dưới hệ thống phải đưa về đơn vị nhỏ nhất (`DonViSuDung`).

## 4. Lỗ hổng Tuỳ chỉnh Món (Customization & Topping)
*   **Logic đề xuất:** `Cấu trúc bảng CONGTHUC mapping 1 Món với N Nguyên liệu.`
*   **Phản biện:**
    *   Khách order "Cà phê sữa" nhưng ghi chú **"Ít sữa, nhiều cà phê"** hoặc thêm Topping **"Thêm trân châu"**.
    *   Với ERD hiện tại, hệ thống vẫn trừ kho theo công thức *cố định* (20ml sữa). Kết quả là cuối tuần kiểm kho, lượng sữa thực tế dư ra rất nhiều so với máy tính (vì khách uống ít sữa), còn cà phê lại hụt đi.
    *   Vấn đề Size món (Size S, M, L) có công thức khác nhau hoàn toàn.
*   **Giải pháp (Cần vá):**
    *   Bảng `MON` phải thêm thuộc tính `Size`.
    *   Chấp nhận sai số (Tolerance) đối với các ghi chú "ít/nhiều", phần mềm không thể tracking chính xác 100% được. Phải thiết lập **Tỷ lệ hao hụt cho phép** (Ví dụ 5%).

## 5. Lỗ hổng Tách biệt Kho Tổng và Quầy Bar
*   **Logic đề xuất:** `Đầu ca nhân viên lấy nguyên liệu ra quầy -> nhập vào hệ thống trừ vào kho.`
*   **Phản biện:**
    *   Khi nhân viên mang sữa từ "Kho" ra "Quầy pha chế", số sữa đó vẫn thuộc tài sản của quán, nó CHƯA BỊ BÁN đi. 
    *   Nếu hệ thống trừ sạch số lượng này khỏi bảng `NGUYENLIEU` ngay lúc xuất ra quầy, thì trên máy tính `Tồn kho = 0`, hệ thống sẽ tự động Khóa Món -> Lỗi nghiêm trọng.
*   **Giải pháp (Cần vá):**
    *   Một là: Coi Kho và Quầy là một (Tồn tổng). Chỉ trừ khi xuất bán hoặc xuất hủy.
    *   Hai là: Nếu muốn tách, phải tạo 2 bảng `KHO_TONG` và `KHO_QUAY`. Phiếu xuất kho nội bộ chỉ làm thao tác chuyển số lượng từ `KHO_TONG` sang `KHO_QUAY`. Khi khách order, hệ thống trừ nguyên liệu ở `KHO_QUAY`. (Cách này rất phức tạp, khuyên dùng cách Một cho đồ án đại học).

## KẾT LUẬN & CHỐT PHƯƠNG ÁN SỬA ĐỔI

Để hệ thống hoàn chỉnh và có thể scale source code cũng như vẽ DFD chính xác, bạn cần đồng ý chốt các rule sau:

1.  **Trừ kho tạm (Reservation):** Ngay khi khách Gửi Đơn Hàng (hoặc NV bấm Nhận), hệ thống sẽ trừ tồn kho *tạm thời*. Nếu hủy đơn do lỗi, phải tạo phiếu xuất hủy.
2.  **Một kho duy nhất (Tồn Tổng):** Không phân biệt "Trong kho" và "Ngoài quầy", quản lý bằng Tồn Tổng để tính toán công thức trừ kho tự động.
3.  **Thêm tỷ lệ quy đổi (Unit Conversion):** Bảng nguyên liệu bắt buộc phải có hệ số chuyển đổi từ Đơn vị nhập hàng sang Đơn vị pha chế (VD: 1 Kg -> 1000 gram).

Bạn xác nhận các giải pháp vá lỗi này nhé, để mình bắt tay vào vẽ lại DFD mức 0, 1, 2 và thiết kế cấu trúc scale source code!
