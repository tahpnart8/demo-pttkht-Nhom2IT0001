# Sơ đồ Hệ thống Nhà Ba Teria

> **Tài liệu phân tích thiết kế** — Hệ thống quản lý quán cafe Nhà Ba Teria  
> Ngày tạo: 16/05/2026 | Phiên bản: 1.0

---

## 1. Sơ đồ DFD Mức 0 (Context Diagram)

Sơ đồ ngữ cảnh thể hiện tổng quan hệ thống với 4 tác nhân bên ngoài tương tác.

```mermaid
graph LR
    KH["fa:fa-user Khách hàng"]
    BA["fa:fa-blender Barista"]
    PV["fa:fa-concierge-bell Phục vụ"]
    TN["fa:fa-cash-register Thu ngân"]
    QL["fa:fa-user-tie Quản lý"]

    HT(("0\nHệ thống\nQuản lý\nNhà Ba Teria"))

    KH -->|"Chọn món, gửi đơn hàng"| HT
    HT -->|"Xác nhận đơn, tiến độ đơn hàng"| KH

    HT -->|"Danh sách đơn cần pha chế"| BA
    BA -->|"Cập nhật trạng thái pha chế"| HT

    HT -->|"Danh sách đơn hoàn thành"| PV
    PV -->|"Xác nhận đã giao món"| HT

    TN -->|"Chọn đơn, xác nhận thanh toán"| HT
    HT -->|"Hóa đơn, thông tin thanh toán"| TN

    QL -->|"Thêm/sửa/xóa nhân viên, món, bàn"| HT
    HT -->|"Danh sách dữ liệu quản trị"| QL
```

### Mô tả tác nhân

| Tác nhân | Vai trò | Phương thức truy cập |
|----------|---------|---------------------|
| **Khách hàng** | Quét QR, xem menu, đặt món, theo dõi đơn | Mobile (không cần đăng nhập) |
| **Barista** | Nhận đơn, pha chế, báo hoàn thành | Mobile (đăng nhập `barista`) |
| **Phục vụ** | Nhận món đã pha, giao cho khách | Mobile (đăng nhập `phucvu`) |
| **Thu ngân** | Thanh toán, xuất hóa đơn | Desktop (đăng nhập `thungan`) |
| **Quản lý** | CRUD nhân viên, menu, bàn; truy cập toàn bộ | Desktop (đăng nhập `admin`) |

---

## 2. Sơ đồ DFD Mức 1

Phân rã hệ thống thành 5 tiến trình chính.

```mermaid
graph TB
    KH["fa:fa-user Khách hàng"]
    BA["fa:fa-blender Barista"]
    PV["fa:fa-concierge-bell Phục vụ"]
    TN["fa:fa-cash-register Thu ngân"]
    QL["fa:fa-user-tie Quản lý"]

    P1(("1.0\nQuản lý\nĐặt món"))
    P2(("2.0\nXử lý\nĐơn hàng"))
    P3(("3.0\nThanh toán\n& Hóa đơn"))
    P4(("4.0\nQuản trị\nHệ thống"))
    P5(("5.0\nXác thực\nPhân quyền"))

    D1[("D1 MENU / MON")]
    D2[("D2 GIOHANG")]
    D3[("D3 DONHANG")]
    D4[("D4 HOADON / THANHTOAN")]
    D5[("D5 NHANVIEN / TAIKHOAN")]
    D6[("D6 BAN")]

    KH -->|"Chọn món, số lượng, ghi chú"| P1
    P1 -->|"Xác nhận đã thêm vào giỏ"| KH
    P1 <-->|"Đọc danh sách món"| D1
    P1 <-->|"Lưu/đọc giỏ hàng"| D2

    KH -->|"Gửi đơn hàng"| P2
    P2 -->|"Tiến độ đơn hàng"| KH
    P2 <-->|"Tạo/đọc đơn hàng"| D3
    P2 -->|"Cập nhật trạng thái bàn"| D6
    P2 -->|"Xóa giỏ sau khi đặt"| D2

    BA -->|"Chờ->Đang làm->Hoàn thành"| P2
    P2 -->|"DS đơn cần pha chế"| BA

    PV -->|"Hoàn thành->Đã giao"| P2
    P2 -->|"DS đơn cần giao"| PV

    TN -->|"Chọn đơn, phương thức TT"| P3
    P3 -->|"Hóa đơn, xác nhận TT"| TN
    P3 <-->|"Đọc đơn hàng đã giao"| D3
    P3 <-->|"Tạo/đọc hóa đơn"| D4
    P3 -->|"Giải phóng bàn"| D6

    QL -->|"CRUD dữ liệu"| P4
    P4 -->|"Danh sách dữ liệu"| QL
    P4 <-->|"Quản lý món/menu"| D1
    P4 <-->|"Quản lý bàn"| D6
    P4 <-->|"Quản lý nhân viên"| D5

    BA & PV & TN & QL -->|"Đăng nhập"| P5
    P5 -->|"JWT Token + Phân quyền"| BA & PV & TN & QL
    P5 <-->|"Xác thực tài khoản"| D5
```

### Mô tả tiến trình

| Mã | Tiến trình | Chức năng chính |
|----|-----------|----------------|
| 1.0 | Quản lý Đặt món | Hiển thị menu, tìm kiếm, thêm/sửa/xóa giỏ hàng |
| 2.0 | Xử lý Đơn hàng | Tạo đơn từ giỏ, chuyển trạng thái theo phân quyền |
| 3.0 | Thanh toán & Hóa đơn | Tạo hóa đơn, xác nhận thanh toán, giải phóng bàn |
| 4.0 | Quản trị Hệ thống | CRUD nhân viên, menu, bàn |
| 5.0 | Xác thực & Phân quyền | Đăng nhập JWT, kiểm tra quyền hạn |

---

## 3. Sơ đồ DFD Mức 2

### 3.1. Phân rã tiến trình 1.0 — Quản lý Đặt món

```mermaid
graph TB
    KH["fa:fa-user Khách hàng"]
    D1[("D1 MENU / MON")]
    D2[("D2 GIOHANG / CHITIETGIOHANG")]

    P11(("1.1\nHiển thị\nMenu"))
    P12(("1.2\nTìm kiếm\n& Lọc"))
    P13(("1.3\nQuản lý\nGiỏ hàng"))

    KH -->|"Truy cập /order/MaBan"| P11
    P11 -->|"DS menu + món"| KH
    P11 <-->|"SELECT menu, mon"| D1

    KH -->|"Từ khóa, danh mục"| P12
    P12 -->|"Kết quả lọc"| KH
    P12 <-->|"Đọc dữ liệu"| D1

    KH -->|"Thêm/sửa SL/xóa món"| P13
    P13 -->|"Giỏ hàng cập nhật"| KH
    P13 <-->|"INSERT/UPDATE/DELETE"| D2
```

### 3.2. Phân rã tiến trình 2.0 — Xử lý Đơn hàng

```mermaid
graph TB
    KH["fa:fa-user Khách hàng"]
    BA["fa:fa-blender Barista"]
    PV["fa:fa-concierge-bell Phục vụ"]

    D2[("D2 GIOHANG")]
    D3[("D3 DONHANG / CHITIETDONHANG")]
    D6[("D6 BAN")]

    P21(("2.1\nTạo Đơn\ntừ Giỏ"))
    P22(("2.2\nPha chế\nBarista"))
    P23(("2.3\nGiao món\nPhục vụ"))
    P24(("2.4\nTheo dõi\nTiến độ"))

    KH -->|"Bấm Gửi Order"| P21
    P21 -->|"MaDH + xác nhận"| KH
    P21 <-->|"Đọc + xóa giỏ"| D2
    P21 -->|"INSERT đơn hàng"| D3
    P21 -->|"BAN.TrangThai = DangCoKhach"| D6

    P22 <-->|"Đọc đơn Cho/DangLam"| D3
    BA -->|"Cho->DangLam->HoanThanh"| P22
    P22 -->|"UPDATE TrangThaiOrder"| D3

    P23 <-->|"Đọc đơn HoanThanh"| D3
    PV -->|"HoanThanh->DaGiao"| P23
    P23 -->|"UPDATE TrangThaiOrder"| D3

    KH -->|"Polling mỗi 5s"| P24
    P24 -->|"Trạng thái hiện tại"| KH
    P24 <-->|"SELECT by MaDH"| D3
```

### 3.3. Phân rã tiến trình 3.0 — Thanh toán & Hóa đơn

```mermaid
graph TB
    TN["fa:fa-cash-register Thu ngân"]

    D3[("D3 DONHANG")]
    D4[("D4 HOADON / THANHTOAN")]
    D6[("D6 BAN")]

    P31(("3.1\nChọn bàn\n& đơn hàng"))
    P32(("3.2\nTạo\nHóa đơn"))
    P33(("3.3\nXác nhận\nThanh toán"))
    P34(("3.4\nGiải phóng\nBàn"))

    TN -->|"Chọn bàn DangCoKhach"| P31
    P31 -->|"DS đơn chưa TT (DaGiao)"| TN
    P31 <-->|"SELECT DH WHERE MaHD IS NULL"| D3

    TN -->|"Chọn đơn cần thanh toán"| P32
    P32 -->|"MaHD + TongTien"| TN
    P32 -->|"INSERT HOADON"| D4
    P32 -->|"UPDATE DH.MaHD"| D3

    TN -->|"Phương thức TT"| P33
    P33 -->|"Xác nhận thành công"| TN
    P33 -->|"INSERT THANHTOAN"| D4

    P33 -->|"Kiểm tra còn đơn chưa TT?"| P34
    P34 <-->|"SELECT DH WHERE MaHD IS NULL"| D3
    P34 -->|"BAN.TrangThai = Trong"| D6
```

## 4. Sequence Diagram — Luồng Gọi Món

> **Kịch bản:** Khách hàng quét mã QR trên bàn, xem menu, thêm món vào giỏ hàng và gửi đơn hàng.

```mermaid
sequenceDiagram
    participant KH as Khach hang
    participant FE as Frontend
    participant API as API Server
    participant MENU as MENU
    participant MON as MON
    participant GH as GIOHANG
    participant CTGH as CHITIETGIOHANG
    participant DH as DONHANG
    participant CTDH as CHITIETDONHANG
    participant BAN as BAN

    Note over KH,BAN: 1. Khach hang quet QR va xem menu
    KH->>FE: 1. Quet ma QR tren ban
    FE->>API: 2. GET /api/menu
    API->>MENU: 3. SELECT * FROM MENU
    MENU-->>API: 4. Danh sach danh muc
    API->>MON: 5. SELECT * FROM MON WHERE MaMenu
    MON-->>API: 6. Danh sach mon theo menu
    API-->>FE: 7. JSON danh sach menu va mon
    FE-->>KH: 8. Hien thi giao dien dat mon

    Note over KH,BAN: 2. Khach hang them mon vao gio hang
    KH->>FE: 9. Chon mon va bam Them
    FE->>API: 10. POST /api/cart/B01/items (MaMon, SoLuong)
    API->>GH: 11. SELECT MaGio FROM GIOHANG WHERE MaBan = B01
    alt Gio hang chua ton tai
        API->>GH: 12a. INSERT INTO GIOHANG (MaGio, MaBan)
        GH-->>API: 13a. MaGio moi
    end
    API->>CTGH: 14. INSERT INTO CHITIETGIOHANG (MaGio, MaMon, SoLuong)
    CTGH-->>API: 15. OK da them vao gio
    API-->>FE: 16. Xac nhan item da them
    FE-->>KH: 17. Cap nhat so luong tren icon gio hang

    Note over KH,BAN: 3. Khach hang gui don hang
    KH->>FE: 18. Bam Gui don hang
    FE->>API: 19. POST /api/orders (MaBan = B01)
    API->>GH: 20. SELECT MaGio FROM GIOHANG WHERE MaBan
    API->>CTGH: 21. SELECT MaMon, SoLuong, GhiChu FROM CHITIETGIOHANG
    CTGH-->>API: 22. Danh sach mon trong gio
    API->>MON: 23. SELECT DonGia FROM MON WHERE MaMon
    MON-->>API: 24. Don gia tung mon
    API->>DH: 25. INSERT INTO DONHANG (MaDH, TrangThaiOrder = Cho, MaBan)
    DH-->>API: 26. MaDH moi
    API->>CTDH: 27. INSERT INTO CHITIETDONHANG (MaDH, MaMon, SoLuong, DonGia)
    CTDH-->>API: 28. OK chi tiet da luu
    API->>BAN: 29. UPDATE BAN SET TrangThai = DangCoKhach WHERE MaBan
    BAN-->>API: 30. OK trang thai ban da cap nhat
    API->>CTGH: 31. DELETE FROM CHITIETGIOHANG WHERE MaGio
    API->>GH: 32. DELETE FROM GIOHANG WHERE MaGio
    GH-->>API: 33. OK gio hang da xoa
    API-->>FE: 34. MaDH va thong bao dat hang thanh cong
    FE-->>KH: 35. Chuyen sang trang theo doi don hang
```

**Giải thích:**

| Bước | Mô tả |
|:----:|-------|
| 1-8 | Khách quét QR, hệ thống truy vấn bảng `MENU` và `MON` để hiển thị thực đơn |
| 9-17 | Khách thêm món, hệ thống tạo `GIOHANG` (nếu chưa có) rồi INSERT vào `CHITIETGIOHANG` |
| 18-35 | Khách gửi đơn → tạo `DONHANG` + `CHITIETDONHANG`, cập nhật `BAN`, xóa giỏ hàng |

---

## 4b. Sequence Diagram — Luồng Xử Lý Đơn Hàng

> **Kịch bản:** Barista nhận đơn và pha chế, Phục vụ giao món cho khách. Khách theo dõi trạng thái đơn hàng theo thời gian thực.

```mermaid
sequenceDiagram
    participant BA as Barista
    participant PV as Phuc vu
    participant FE as Frontend
    participant API as API Server
    participant MW as Auth Middleware
    participant NV as NHANVIEN
    participant TK as TAIKHOAN
    participant DH as DONHANG
    participant KH as Khach hang

    Note over BA,KH: 1. Barista dang nhap he thong
    BA->>FE: 1. Nhap tai khoan va mat khau
    FE->>API: 2. POST /api/auth/login (TenDangNhap, MatKhau)
    API->>TK: 3. SELECT * FROM TAIKHOAN WHERE TenDangNhap
    TK-->>API: 4. Thong tin tai khoan (QuyenHan = barista)
    API->>NV: 5. SELECT * FROM NHANVIEN WHERE MaNV
    NV-->>API: 6. Thong tin nhan vien
    API-->>FE: 7. JWT Token (role = barista) va user info
    FE-->>BA: 8. Hien thi man hinh Quan ly don hang

    Note over BA,KH: 2. Barista xem danh sach don cho xu ly
    FE->>MW: 9. GET /api/orders (Authorization Bearer JWT)
    MW->>MW: 10. Verify JWT va kiem tra role
    MW->>API: 11. Cho phep truy cap
    API->>DH: 12. SELECT * FROM DONHANG WHERE TrangThaiOrder = Cho
    DH-->>API: 13. Danh sach don hang dang cho
    API-->>FE: 14. JSON danh sach don hang
    FE-->>BA: 15. Hien thi cac don o trang thai Cho

    Note over BA,KH: 3. Barista bat dau pha che
    BA->>FE: 16. Bam nut Bat dau lam tren don DH001
    FE->>MW: 17. PATCH /api/orders/DH001/status (TrangThai = DangLam)
    MW->>MW: 18. Verify JWT role = barista OK
    MW->>API: 19. Chuyen tiep request
    API->>DH: 20. SELECT TrangThaiOrder FROM DONHANG WHERE MaDH = DH001
    DH-->>API: 21. TrangThaiOrder = Cho
    API->>API: 22. Kiem tra: barista duoc chuyen Cho sang DangLam = OK
    API->>DH: 23. UPDATE DONHANG SET TrangThaiOrder = DangLam WHERE MaDH = DH001
    DH-->>API: 24. OK da cap nhat
    API-->>FE: 25. Don hang da chuyen sang DangLam
    FE-->>BA: 26. Don chuyen qua tab Dang lam

    Note over BA,KH: 4. Barista hoan thanh pha che
    BA->>FE: 27. Bam nut Hoan thanh tren don DH001
    FE->>MW: 28. PATCH /api/orders/DH001/status (TrangThai = HoanThanh)
    MW->>API: 29. Chuyen tiep (role barista OK)
    API->>DH: 30. UPDATE DONHANG SET TrangThaiOrder = HoanThanh
    DH-->>API: 31. OK da cap nhat
    API-->>FE: 32. Don hang da hoan thanh pha che
    FE-->>BA: 33. Don chuyen qua tab Hoan thanh

    Note over BA,KH: 5. Phuc vu giao mon cho khach
    PV->>FE: 34. Dang nhap (role = phucvu)
    FE->>MW: 35. GET /api/orders (Authorization Bearer JWT)
    MW->>API: 36. Cho phep truy cap
    API->>DH: 37. SELECT * FROM DONHANG WHERE TrangThaiOrder = HoanThanh
    DH-->>API: 38. Danh sach don can giao
    API-->>FE: 39. JSON don hang hoan thanh
    FE-->>PV: 40. Hien thi cac don cho giao
    PV->>FE: 41. Bam Da giao tren don DH001
    FE->>MW: 42. PATCH /api/orders/DH001/status (TrangThai = DaGiao)
    MW->>API: 43. Chuyen tiep (role phucvu OK)
    API->>API: 44. Kiem tra: phucvu duoc chuyen HoanThanh sang DaGiao = OK
    API->>DH: 45. UPDATE DONHANG SET TrangThaiOrder = DaGiao
    DH-->>API: 46. OK da cap nhat
    API-->>FE: 47. Don hang da giao thanh cong
    FE-->>PV: 48. Don chuyen qua tab Da giao

    Note over BA,KH: 6. Khach hang nhan trang thai da giao
    KH->>FE: 49. Polling GET /api/orders?table=B01
    FE->>API: 50. GET /api/orders?table=B01
    API->>DH: 51. SELECT TrangThaiOrder FROM DONHANG WHERE MaDH = DH001
    DH-->>API: 52. TrangThaiOrder = DaGiao
    API-->>FE: 53. JSON trang thai moi nhat
    FE-->>KH: 54. Hien thi trang thai Da giao cho khach
```

**Giải thích:**

| Bước | Mô tả |
|:----:|-------|
| 1-8 | Barista đăng nhập → truy vấn `TAIKHOAN` và `NHANVIEN` → nhận JWT Token |
| 9-15 | Hệ thống lọc `DONHANG` theo trạng thái `Chờ` để hiển thị |
| 16-26 | Barista chuyển đơn từ `Chờ` → `Đang làm` (validate quyền qua Middleware) |
| 27-33 | Barista chuyển đơn từ `Đang làm` → `Hoàn thành` |
| 34-48 | Phục vụ đăng nhập, lọc đơn `Hoàn thành`, chuyển sang `Đã giao` |
| 49-54 | Khách hàng polling để nhận trạng thái mới nhất từ `DONHANG` |

---

## 5. Sequence Diagram — Luồng Thanh Toán

```mermaid
sequenceDiagram
    participant TN as Thu ngan
    participant FE as Frontend
    participant API as API Server
    participant DB as Database

    Note over TN,DB: BUOC 1 - DANG NHAP
    TN->>FE: Nhap tai khoan thu ngan
    FE->>API: POST /api/auth/login
    API->>DB: SELECT TAIKHOAN JOIN NHANVIEN
    API->>API: Tao JWT (role = thungan)
    API-->>FE: Token va user info
    FE-->>TN: Redirect toi /cashier/payment

    Note over TN,DB: BUOC 2 - CHON BAN VA DON HANG
    FE->>API: GET /api/tables
    API->>DB: SELECT FROM BAN
    API-->>FE: Danh sach ban
    FE->>FE: Loc ban TrangThai = DangCoKhach
    FE-->>TN: Hien thi grid cac ban co khach
    TN->>FE: Bam chon Ban 01
    FE->>API: GET /api/orders?table=B01
    API->>DB: SELECT DONHANG + CHITIETDONHANG
    API-->>FE: DS don hang cua ban
    FE->>FE: Loc don chua co MaHD
    FE-->>TN: Hien thi DS don (DaGiao cho tick - khac mo di)

    Note over TN,DB: BUOC 3 - TAO HOA DON VA THANH TOAN
    TN->>FE: Tick chon don DaGiao va chon phuong thuc TT
    TN->>FE: Bam Xac nhan thanh toan
    FE->>API: POST /api/invoices (orderIds + MaNV)
    API->>DB: SELECT SoLuong DonGia FROM CHITIETDONHANG
    API->>API: Tinh TongTien = SUM(SoLuong x DonGia)
    API->>DB: INSERT HOADON (MaHD TongTien MaNV)
    API->>DB: UPDATE DONHANG SET MaHD
    API-->>FE: MaHD va TongTien

    Note over TN,DB: BUOC 4 - XAC NHAN THANH TOAN VA GIAI PHONG BAN
    FE->>API: POST /api/payments (MaHD SoTien PhuongThuc)
    API->>DB: INSERT THANHTOAN
    API->>DB: SELECT MaBan FROM DONHANG WHERE MaHD
    API->>DB: SELECT DONHANG WHERE MaBan AND MaHD IS NULL
    alt Khong con don chua thanh toan
        API->>DB: UPDATE BAN SET TrangThai = Trong
    end
    API-->>FE: Xac nhan thanh cong
    FE-->>TN: Toast Thanh toan thanh cong
```

---

## 6. Sequence Diagram — Luồng Thêm Nhân Viên

```mermaid
sequenceDiagram
    participant QL as Quan ly
    participant FE as Frontend
    participant MW as Auth Middleware
    participant API as API Server
    participant DB as Database

    Note over QL,DB: BUOC 1 - XAC THUC QUYEN QUAN LY
    QL->>FE: Dang nhap tai khoan admin
    FE->>API: POST /api/auth/login
    API->>DB: SELECT TAIKHOAN JOIN NHANVIEN
    API->>API: JWT.sign (role = admin)
    API-->>FE: Token va user info
    FE-->>QL: Redirect toi /manager/menu
    QL->>FE: Click Nhan vien tren sidebar

    Note over QL,DB: BUOC 2 - TAI DANH SACH NHAN VIEN
    FE->>MW: GET /api/staff (Authorization Bearer JWT)
    MW->>MW: Verify JWT va kiem tra role = admin
    MW->>API: Cho phep truy cap
    API->>DB: SELECT NHANVIEN JOIN TAIKHOAN
    DB-->>API: Danh sach nhan vien
    API-->>FE: JSON nhan vien
    FE-->>QL: Hien thi bang nhan vien DataTable

    Note over QL,DB: BUOC 3 - NHAP THONG TIN MOI
    QL->>FE: Bam nut Them NV
    FE->>FE: Mo Modal form - Tu sinh ma NV
    QL->>FE: Dien HoTen SoDienThoai ViTri TenDangNhap MatKhau QuyenHan
    QL->>FE: Bam Them moi

    Note over QL,DB: BUOC 4 - LUU VAO DATABASE
    FE->>MW: POST /api/staff (Authorization Bearer JWT)
    MW->>MW: Verify JWT role = admin OK
    MW->>API: Chuyen tiep request
    API->>DB: INSERT INTO NHANVIEN (MaNV HoTen SoDienThoai ViTri)
    DB-->>API: OK Nhan vien da tao
    alt Co ten dang nhap
        API->>DB: INSERT INTO TAIKHOAN (TenDangNhap MatKhau QuyenHan MaNV)
        DB-->>API: OK Tai khoan da tao
    end
    API-->>FE: MaNV va message Da them
    FE-->>QL: Toast Da them nhan vien
    FE->>FE: Dong Modal va refresh danh sach
```

---

## 7. Ma trận Phân quyền

```mermaid
graph LR
    subgraph "Luong trang thai don hang"
        A["Cho"] -->|"Barista"| B["Dang lam"]
        B -->|"Barista"| C["Hoan thanh"]
        C -->|"Phuc vu"| D["Da giao"]
        D -->|"Thu ngan"| E["Thanh toan"]
    end

    style A fill:#FEF5E7,stroke:#F39C12,color:#F39C12
    style B fill:#EBF5FB,stroke:#3498DB,color:#3498DB
    style C fill:#E8F8EF,stroke:#27AE60,color:#27AE60
    style D fill:#F0EBE5,stroke:#8C7B6B,color:#8C7B6B
    style E fill:#FDEDEC,stroke:#E74C3C,color:#E74C3C
```

| Vai trò | Chờ -> Đang làm | Đang làm -> Hoàn thành | Hoàn thành -> Đã giao | Thanh toán |
|---------|:-:|:-:|:-:|:-:|
| **Barista** | ✅ | ✅ | ❌ | ❌ |
| **Phục vụ** | ❌ | ❌ | ✅ | ❌ |
| **Thu ngân** | ❌ | ❌ | ❌ | ✅ |
| **Quản lý** | ✅ | ✅ | ✅ | ✅ |

---

## 8. Kho dữ liệu (Data Store)

| Mã | Tên | Bảng CSDL | Mô tả |
|----|-----|-----------|-------|
| D1 | Menu và Món | MENU, MON | Danh mục thực đơn và các món |
| D2 | Giỏ hàng | GIOHANG, CHITIETGIOHANG | Giỏ hàng tạm gắn với từng bàn |
| D3 | Đơn hàng | DONHANG, CHITIETDONHANG | Đơn hàng chính thức và chi tiết |
| D4 | Hóa đơn | HOADON, THANHTOAN | Hóa đơn và giao dịch thanh toán |
| D5 | Nhân viên | NHANVIEN, TAIKHOAN | Thông tin NV và tài khoản |
| D6 | Bàn | BAN | Danh sách bàn và trạng thái |
