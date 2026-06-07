# BÁO CÁO PHẢN BIỆN LẦN 2: LOGIC QUẢN LÝ KHO THỦ CÔNG

Sau khi bạn xác nhận bỏ việc trừ kho tự động theo từng order và chuyển sang mô hình: **Kiểm soát kho thủ công bởi nhân viên** (Lấy bao nhiêu xuất bấy nhiêu, hết thì báo hệ thống để khóa món). Đồng thời, bảng `CONGTHUC` chỉ dùng để mapping (Món A xài Nguyên liệu B) chứ không quản lý sát sao ml/gram nữa.

Cách làm này quả thực giúp giải quyết triệt để sự phức tạp của máy tính, hệ thống chạy rất nhẹ và mượt. Tuy nhiên, khi đào sâu vào kịch bản vận hành này, mình tiếp tục phát hiện ra **4 Mâu thuẫn & Lỗ hổng cực kỳ nghiêm trọng** như sau:

---

## Lỗ hổng 1: Mâu thuẫn "Vả nhau đôm đốp" ở Tính năng Kiểm Kho
*   **Vấn đề:** Bạn nói rằng: *"Bỏ định lượng công thức đi, chỉ mapping để biết món nào xài nguyên liệu gì thôi"*. Nhưng trong file thiết kế, bạn lại có tính năng: *"Hệ thống dò lại hóa đơn trong tuần, xuất ra số lượng món được gọi x định lượng nl trong công thức => ra báo cáo riêng đối chiếu với nhân viên"*.
*   **Phản biện:** Nếu bảng `CONGTHUC` không có lưu số lượng định mức (Ví dụ: 1 ly cafe sữa tốn 20ml sữa), thì làm sao cuối tuần hệ thống tính ra được *Số lượng lý thuyết* để đi so sánh với nhân viên? Máy tính không thể lấy `(100 ly Cà phê sữa) x (Có Sữa đặc)` để ra kết quả được. Bạn bắt buộc phải giữ lại con số định lượng trong Database, nếu không tính năng Kiểm kho đối chiếu sẽ vứt đi hoàn toàn.

## Lỗ hổng 2: Trạng thái "Hết Hàng Ảo" gây mất doanh thu (Cực kỳ nguy hiểm)
*   **Logic của bạn:** *"Ví dụ sữa còn 1 hộp trong kho, nhân viên lấy hộp đó ra quầy dùng, cho tới khi hết hẳn hộp trên quầy + trong kho thì mới nhập lên hệ thống (-1 hộp = 0) => hệ thống khóa món."*
*   **Phản biện:** 
    1.  Trên hệ thống, chức năng xuất kho hoạt động theo kiểu "Trừ tồn kho".
    2.  Khi nhân viên lấy hộp cuối cùng từ kho ra quầy, nếu họ bấm "Xuất kho" trên app ngay lúc đó -> Tồn kho trên app = 0 -> Phần mềm lập tức tự động **Khóa món** ngay lập tức.
    3.  NHƯNG thực tế cái hộp đó nhân viên vừa mới khui trên quầy, nó vẫn pha được thêm 30 ly nữa! Khách vô web không order được, trong khi quán vẫn dư sức pha. Quán mất trắng doanh thu 30 ly!
    4.  Nếu để tránh tình trạng trên, nhân viên không được bấm xuất kho lúc lấy hộp ra, mà **phải chờ tới lúc vắt kiệt giọt sữa cuối cùng** mới được cầm điện thoại lên bấm "Xuất kho -> Về 0". Chuyện này là bất khả thi trong giờ cao điểm đông khách. Nhân viên không rảnh để canh me lúc nào giọt cuối cùng rơi xuống ly.

## Lỗ hổng 3: Sự lệch pha về Đơn vị tính khi Đối chiếu
*   **Vấn đề:** Do bạn chọn quản lý đơn vị nhập xuất linh hoạt (Thùng/Hộp).
*   **Phản biện:** Cuối tuần, nhân viên đếm trong kho còn "3 Hộp". Nhưng hệ thống tính toán (nếu bạn vẫn giữ công thức) sẽ nhân số ly bán ra và báo hệ thống đã tiêu hao "4250 ml". Phần mềm làm sao có thể chập con số "3 Hộp" của nhân viên với "4250 ml" của hệ thống lại để xem có bị mất trộm hay hao hụt không? Cuối cùng, Quản lý nhìn vào báo cáo đối chiếu cũng mù tịt không biết đường nào mà lần.

## Lỗ hổng 4: Quên trừ / Quên nhập (Human Error)
*   **Vấn đề:** Phụ thuộc 100% vào ý thức của con người.
*   **Phản biện:** Khi giao phó sinh mệnh của hệ thống Tự động khóa món vào tay nhân viên bấm thủ công, rủi ro là vô tận. Giờ đông khách, Barista lấy 2 lốc sữa ra quầy mà quên bấm xuất kho trên iPad. Hệ thống vẫn báo còn đầy hàng. Cho đến khi hết sạch trên quầy, khách order ầm ầm, Barista mới tá hỏa là hết sạch nguyên liệu nhưng hệ thống thì vẫn cứ nhận đơn. Hệ thống này bị phụ thuộc quá lớn vào độ "siêng năng" của nhân viên quầy.

---

### KẾT LUẬN & ĐỀ XUẤT HƯỚNG ĐI

Để mô hình "Quản lý thủ công" của bạn thực sự khả thi trong đồ án mà không bị giảng viên bẻ gãy ở buổi bảo vệ, bạn cần "chấp vá" lại như sau:

1.  **Về Kiểm Kho (Sửa lỗ hổng 1 & 3):** Vẫn phải giữ con số "Định lượng" trong bảng `CONGTHUC` (1 ly tốn bao nhiêu gram/ml). Và bảng `NGUYENLIEU` bắt buộc phải có `TyLeQuyDoi` (1 Hộp = bao nhiêu gram/ml). Mọi phép trừ kho tự động hay đếm tay đều phải convert ra gram/ml để so sánh.
2.  **Về Khóa Món (Sửa lỗ hổng 2 & 4):**
    *   Tách biệt "Tồn kho" và "Tồn quầy".
    *   Lúc nhân viên lấy hộp sữa cuối cùng xuất ra quầy, phần mềm chỉ trừ ở "Tồn Kho Tổng" và cộng vào "Tồn Quầy". 
    *   Hệ thống sẽ **Tự động trừ Tồn Quầy** khi có hóa đơn hoàn thành. 
    *   Khi "Tồn Quầy" < Định mức 1 ly VÀ "Tồn Kho Tổng" = 0, lúc đó máy tính mới Tự động Khóa món. (Trở lại với giải pháp Trừ tự động, vì quản lý thủ công chắc chắn sẽ sinh ra Hết Hàng Ảo).

Bạn nghĩ sao về những lập luận này? Cứ đưa ra ý kiến, mình sẽ tiếp tục debate hoặc chốt giải pháp để tiến hành vẽ DFD nhé!
