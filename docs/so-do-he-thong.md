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

## 4. Sequence Diagram — Luồng Gọi Món và Xử Lý Đơn Hàng

```mermaid
sequenceDiagram
    participant KH as Khach hang
    participant FE as Frontend
    participant API as API Server
    participant DB as Database
    participant BA as Barista
    participant PV as Phuc vu

    Note over KH,PV: GIAI DOAN 1 - QUET QR VA XEM MENU
    KH->>FE: Quet ma QR tren ban
    FE->>API: GET /api/menu
    API->>DB: SELECT MENU JOIN MON
    DB-->>API: Danh sach menu va mon
    API-->>FE: JSON menu data
    FE-->>KH: Hien thi giao dien Menu

    Note over KH,PV: GIAI DOAN 2 - THEM MON VAO GIO
    KH->>FE: Bam nut Them mon
    FE->>API: POST /api/cart/B01/items
    API->>DB: Tim hoac tao GIOHANG
    API->>DB: INSERT CHITIETGIOHANG
    DB-->>API: OK
    API-->>FE: Item da them
    FE-->>KH: Cap nhat badge gio hang

    Note over KH,PV: GIAI DOAN 3 - GUI DON HANG
    KH->>FE: Bam Gui order
    FE->>API: POST /api/orders
    API->>DB: SELECT GIOHANG + CHITIETGIOHANG
    API->>DB: INSERT DONHANG (TrangThai = Cho)
    API->>DB: INSERT CHITIETDONHANG
    API->>DB: UPDATE BAN SET TrangThai = DangCoKhach
    API->>DB: DELETE CHITIETGIOHANG va GIOHANG
    DB-->>API: OK
    API-->>FE: MaDH + Dat hang thanh cong
    FE-->>KH: Chuyen toi trang theo doi

    Note over KH,PV: GIAI DOAN 4 - BARISTA PHA CHE
    BA->>FE: Dang nhap tai khoan barista
    FE->>API: POST /api/auth/login
    API-->>FE: JWT Token role = barista
    BA->>FE: Bam Bat dau lam
    FE->>API: PATCH /api/orders/id/status DangLam
    API->>API: Kiem tra role barista Cho to DangLam = OK
    API->>DB: UPDATE DONHANG SET TrangThaiOrder = DangLam
    API-->>FE: Don da cap nhat
    BA->>FE: Bam Hoan thanh
    FE->>API: PATCH /api/orders/id/status HoanThanh
    API->>DB: UPDATE TrangThaiOrder = HoanThanh
    API-->>FE: Don da cap nhat

    Note over KH,PV: GIAI DOAN 5 - PHUC VU GIAO MON
    PV->>FE: Dang nhap tai khoan phucvu
    FE->>API: POST /api/auth/login
    API-->>FE: JWT Token role = phucvu
    PV->>FE: Bam Da giao
    FE->>API: PATCH /api/orders/id/status DaGiao
    API->>API: Kiem tra role phucvu HoanThanh to DaGiao = OK
    API->>DB: UPDATE TrangThaiOrder = DaGiao
    API-->>FE: Don da cap nhat
    FE-->>KH: Polling nhan trang thai Da giao
```

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
