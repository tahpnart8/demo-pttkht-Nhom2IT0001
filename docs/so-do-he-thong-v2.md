# Sơ đồ Hệ thống Nhà Ba Teria (Phiên bản Cuối kỳ)

> **Tài liệu phân tích thiết kế** — Hệ thống POS & ERP thu nhỏ quán cafe Nhà Ba Teria  
> Phiên bản: 2.0 (Bổ sung Quản lý Kho thủ công, Công thức, Báo cáo thống kê)

---

## 1. Sơ đồ DFD Mức 0 (Context Diagram)

Sơ đồ ngữ cảnh thể hiện tổng quan hệ thống tương tác với các tác nhân bên ngoài. Trong phiên bản này, Quản lý và Nhân viên được bổ sung luồng tương tác với kho hàng và nhà cung cấp.

```mermaid
graph LR
    KH["fa:fa-user Khách hàng"]
    BA["fa:fa-blender Barista"]
    PV["fa:fa-concierge-bell Phục vụ"]
    TN["fa:fa-cash-register Thu ngân"]
    QL["fa:fa-user-tie Quản lý"]
    NCC["fa:fa-truck Nhà cung cấp"]

    HT(("0\nHệ thống ERP\nNhà Ba Teria"))

    KH -->|"Chọn món, gửi đơn"| HT
    HT -->|"Xác nhận đơn, khóa món hết NL"| KH

    HT -->|"Danh sách đơn cần pha"| BA
    BA -->|"Cập nhật pha chế, báo xuất kho"| HT

    HT -->|"Danh sách đơn hoàn thành"| PV
    PV -->|"Xác nhận đã giao"| HT

    TN -->|"Xác nhận thanh toán"| HT
    HT -->|"Hóa đơn"| TN

    NCC -->|"Giao hàng hóa, hóa đơn nhập"| HT
    HT -->|"Thông tin đặt hàng"| NCC

    QL -->|"Thêm/sửa món, nhập/xuất/kiểm kho"| HT
    HT -->|"Cảnh báo tồn kho, Báo cáo tài chính"| QL
```

---

## 2. Sơ đồ DFD Mức 1

Hệ thống được phân rã thành 6 tiến trình chính, bổ sung thêm tiến trình Quản lý Kho & Báo cáo thống kê.

```mermaid
graph TB
    KH["fa:fa-user Khách hàng"]
    BA["fa:fa-blender Barista / Phục vụ"]
    TN["fa:fa-cash-register Thu ngân"]
    QL["fa:fa-user-tie Quản lý"]
    NCC["fa:fa-truck Nhà cung cấp"]

    P1(("1.0\nQuản lý\nĐặt món"))
    P2(("2.0\nXử lý\nĐơn hàng"))
    P3(("3.0\nThanh toán\n& Hóa đơn"))
    P4(("4.0\nQuản trị\nHệ thống"))
    P5(("5.0\nXác thực\nPhân quyền"))
    P6(("6.0\nQuản lý Kho\n& Báo cáo"))

    D1[("D1 MENU/MON/CONGTHUC")]
    D2[("D2 GIOHANG")]
    D3[("D3 DONHANG")]
    D4[("D4 HOADON")]
    D5[("D5 NHANVIEN/TAIKHOAN")]
    D6[("D6 BAN")]
    D7[("D7 NGUYENLIEU/NCC")]
    D8[("D8 PHIEU (NHAP/XUAT/KIEM)")]

    %% P1
    KH -->|"Chọn món"| P1
    P1 -->|"DS món (lọc món hết kho)"| KH
    P1 <-->|"Check tồn kho"| D7
    P1 <-->|"Đọc menu, công thức"| D1
    P1 <-->|"Lưu giỏ hàng"| D2

    %% P2
    KH -->|"Gửi đơn"| P2
    BA -->|"Đổi trạng thái"| P2
    P2 <-->|"Ghi/đọc đơn hàng"| D3
    P2 -->|"Xóa giỏ"| D2
    P2 -->|"Cập nhật bàn"| D6

    %% P3
    TN -->|"Xác nhận TT"| P3
    P3 <-->|"Tạo hóa đơn"| D4
    P3 <-->|"Đọc đơn hàng"| D3
    P3 -->|"Giải phóng bàn"| D6

    %% P4
    QL -->|"CRUD NV, Bàn, Menu"| P4
    P4 <-->|"Ghi/đọc"| D1
    P4 <-->|"Ghi/đọc"| D5
    P4 <-->|"Ghi/đọc"| D6

    %% P5
    QL & BA & TN -->|"Đăng nhập"| P5
    P5 <-->|"Check TK"| D5

    %% P6
    NCC -->|"Giao hàng"| P6
    QL -->|"Lập phiếu xuất/nhập/kiểm, Y/c Báo cáo"| P6
    BA -->|"Y/c Xuất kho quầy"| P6
    P6 -->|"Báo cáo Doanh thu, Cảnh báo kho"| QL
    P6 <-->|"Cập nhật SL tồn"| D7
    P6 <-->|"Lưu phiếu"| D8
    P6 <-->|"Đọc hóa đơn/đơn hàng"| D3
    P6 <-->|"Đọc hóa đơn"| D4
```

---

## 3. Sơ đồ DFD Mức 2

### 3.1. Phân rã tiến trình 1.0 — Quản lý Đặt món (Cập nhật check tồn kho)

```mermaid
graph TB
    KH["fa:fa-user Khách hàng"]
    D1[("D1 MON / CONGTHUC")]
    D7[("D7 NGUYENLIEU")]
    D2[("D2 GIOHANG")]

    P11(("1.1\nHiển thị Menu\n(Check Kho)"))
    P13(("1.3\nQuản lý\nGiỏ hàng"))

    KH -->|"Truy cập Menu"| P11
    P11 <-->|"1. Đọc Món & Công thức"| D1
    P11 <-->|"2. Kiểm tra Số lượng tồn NL"| D7
    P11 -->|"3. Trả Menu (Khóa món hết NL)"| KH

    KH -->|"Thêm vào giỏ"| P13
    P13 <-->|"Lưu giỏ hàng"| D2
```

### 3.2. Phân rã tiến trình 6.0 — Quản lý Kho & Báo cáo

Đây là tiến trình mới hoàn toàn, quản lý các nghiệp vụ Nhập/Xuất kho thủ công và xuất báo cáo.

```mermaid
graph TB
    NV["Quản lý / Nhân viên"]
    NCC["Nhà cung cấp"]

    D7[("D7 NGUYENLIEU")]
    D8[("D8 PHIEU KHO")]
    D1[("D1 MON")]
    D4[("D4 HOADON")]

    P61(("6.1\nNhập kho\n(Thủ công)"))
    P62(("6.2\nXuất kho\n(Thủ công)"))
    P63(("6.3\nKiểm kho\n(Thủ công)"))
    P64(("6.4\nCảnh báo &\nKhóa món"))
    P65(("6.5\nBáo cáo\nThống kê"))

    %% Nhập kho
    NCC -->|"Giao hàng"| P61
    NV -->|"Lập phiếu nhập, đơn giá"| P61
    P61 -->|"Cộng SoLuongTon"| D7
    P61 -->|"Lưu PHIEUNHAP"| D8

    %% Xuất kho
    NV -->|"Lập phiếu xuất (Quầy/Hủy)"| P62
    P62 -->|"Trừ SoLuongTon"| D7
    P62 -->|"Lưu PHIEUXUAT"| D8
    
    %% Kích hoạt cảnh báo
    P62 -->|"Tồn kho = 0?"| P64
    P64 -->|"Thông báo hết hàng"| NV
    P64 -->|"Set MON.TrangThai = Hết"| D1

    %% Kiểm kho
    NV -->|"Đếm thực tế, lập phiếu"| P63
    P63 -->|"Lưu PHIEUKIEMKHO"| D8
    P63 -->|"Cập nhật lại SoLuongTon"| D7

    %% Báo cáo
    NV -->|"Y/c xem Báo cáo"| P65
    P65 <-->|"Đọc doanh thu"| D4
    P65 <-->|"Đọc chi phí nhập"| D8
    P65 -->|"Hiển thị Biểu đồ Lợi nhuận"| NV
```
