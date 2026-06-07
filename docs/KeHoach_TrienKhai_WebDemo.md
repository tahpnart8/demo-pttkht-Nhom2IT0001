# Kế Hoạch Triển Khai Demo Web — Quán Cafe "Nhà Bà Teria"

---

## 1. Tổng quan dự án

Xây dựng demo web fullstack cho hệ thống quản lý quán cafe giải khát **"Nhà Bà Teria"**, bao gồm 4 nhóm giao diện:

- **Khách hàng** — Quét QR → Menu → Giỏ hàng → Gửi order → Theo dõi trạng thái
- **Nhân viên / Barista** — Đăng nhập → Order Board → Cập nhật trạng thái
- **Thu ngân** — Thanh toán → Xuất/In hóa đơn → Quản lý hóa đơn
- **Quản lý** — CRUD Menu, Bàn, Nhân viên, Hóa đơn

---

## 2. Luồng quy trình vận hành quán (End-to-End)

Mô tả chi tiết quy trình từ lúc khách bước vào quán cho đến khi ra về:

### Giai đoạn 1: Khách đến quán & Gọi món

1. **Khách vào quán**, chọn bàn trống, ngồi xuống.
2. Trên mỗi bàn có **mã QR** dán sẵn. Khách dùng điện thoại **quét mã QR**.
3. Trình duyệt mở ra **giao diện menu** (mobile web) — hiển thị danh sách món theo nhóm (Cà phê, Trà, Sinh tố...).
4. Khách **chọn món**, điều chỉnh số lượng, thêm ghi chú (ít đường, nhiều đá...) → Món được đưa vào **giỏ hàng**.
5. Khách xem lại giỏ hàng, có thể **thêm/sửa/xóa** trước khi bấm **"Gửi order"**.
6. Hệ thống tạo **Đơn hàng** (trạng thái "Chờ"), đồng thời cập nhật bàn thành "Đang có khách".

### Giai đoạn 2: Nhân viên tiếp nhận & Barista pha chế

7. **NV Phục vụ & Barista** nhìn thấy order mới trên **Order Board** (giao diện Kanban trên điện thoại).
8. Barista bắt đầu pha chế → cập nhật trạng thái order từ **"Chờ" → "Đang làm"**.
9. Barista pha chế xong → cập nhật **"Đang làm" → "Hoàn thành"**.
10. NV Phục vụ mang đồ ra bàn → cập nhật **"Hoàn thành" → "Đã giao"**.
11. Khách nhìn thấy trạng thái order cập nhật realtime trên điện thoại.

### Giai đoạn 3: Khách dùng xong & Thanh toán

12. Khách dùng xong, gọi **thu ngân** để thanh toán (hoặc tự đến quầy).
13. Thu ngân mở **màn hình thanh toán** (desktop), xem danh sách order chưa thanh toán của bàn đó.
14. Nếu bàn có **nhiều order chưa thanh toán**, thu ngân có thể **gộp thành 1 hóa đơn**.
15. Thu ngân xác nhận hóa đơn → chọn **phương thức thanh toán** (Tiền mặt / Chuyển khoản / Visa).
16. Hệ thống tạo **Hóa đơn + bản ghi Thanh toán**, lưu lịch sử.
17. Thu ngân **in hóa đơn** cho khách (nếu cần).

### Giai đoạn 4: Khách ra về

18. Hệ thống tự động cập nhật bàn về trạng thái **"Trống"**, sẵn sàng cho khách mới.
19. Hóa đơn được lưu trữ → Quản lý có thể tra cứu sau.

```text
  KHÁCH HÀNG (Mobile)         NV / BARISTA (Mobile)         THU NGÂN (Desktop)
  ┌─────────────────┐         ┌─────────────────┐          ┌─────────────────┐
  │  Quét QR bàn    │         │                 │          │                 │
  │       ↓         │         │                 │          │                 │
  │  Xem menu       │         │                 │          │                 │
  │       ↓         │         │                 │          │                 │
  │  Chọn món       │         │                 │          │                 │
  │       ↓         │         │                 │          │                 │
  │  Giỏ hàng       │         │                 │          │                 │
  │       ↓         │         │                 │          │                 │
  │  GỬI ORDER ─────┼────────→│  Nhận order mới │          │                 │
  │                 │         │  [Chờ]          │          │                 │
  │  Theo dõi  ←────┼─────────│  → [Đang làm]  │          │                 │
  │  trạng thái     │         │  → [Hoàn thành] │          │                 │
  │                 │         │  → [Đã giao]    │          │                 │
  │                 │         │       ↓         │          │                 │
  │  Gọi thanh toán─┼─────────┼─────────────────┼────────→ │  Xem order bàn  │
  │                 │         │                 │          │  Gộp HĐ (nếu)  │
  │                 │         │                 │          │  Chọn PTTT      │
  │  Nhận bill ←────┼─────────┼─────────────────┼──────────│  In hóa đơn     │
  │                 │         │                 │          │  Bàn → Trống    │
  │  RA VỀ          │         │                 │          │                 │
  └─────────────────┘         └─────────────────┘          └─────────────────┘
```

---

## 3. Tech Stack

| Layer              | Công nghệ                               | Lý do                            |
| ------------------ | ----------------------------------------- | --------------------------------- |
| **Frontend** | Vite + React 18                           | Nhẹ, nhanh, deploy Vercel dễ    |
| **Icons**    | React Icons (Lucide)                      | SVG chuyên nghiệp, không emoji |
| **Styling**  | Vanilla CSS (Variables)                   | Tone nâu đỏ "Nhà Bà Teria"   |
| **Routing**  | React Router v6                           | SPA chuẩn                        |
| **Backend**  | Node.js + Express                         | Nhẹ, deploy Render               |
| **Database** | Supabase (PostgreSQL)                     | Free, realtime, REST sẵn         |
| **Auth**     | JWT tự viết                             | Phân quyền 4 vai trò           |
| **Deploy**   | Vercel (FE) + Render (BE) + Supabase (DB) | Theo yêu cầu                    |

---

## 4. Chiến lược Responsive theo vai trò

| Vai trò               | Thiết bị chính | Chiến lược UI                                                                                                                                     |
| ---------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Khách hàng** | Điện thoại     | Mobile-first. Full-screen cards, bottom navigation, large touch targets (44px+), scroll dọc. Menu dạng grid 2 cột. Giỏ hàng dạng bottom sheet. |
| **NV Phục vụ** | Điện thoại     | Mobile-first. Order Board dạng danh sách dọc (swipe trạng thái), thông báo push-style, nút bấm lớn.                                        |
| **Barista**      | Điện thoại     | Mobile-first. Danh sách order dạng card, nút cập nhật trạng thái nổi bật, hiển thị chi tiết món rõ ràng.                              |
| **Thu ngân**    | Desktop/Laptop    | Desktop-first. Layout 2 panel (danh sách order trái + chi tiết/thanh toán phải). Bảng dữ liệu rộng.                                         |
| **Quản lý**    | Desktop/Laptop    | Desktop-first. Sidebar navigation, bảng CRUD rộng, modal form, dashboard tổng quan.                                                               |

### Breakpoints

```css
/* Mobile-first */
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

---

## 5. Thiết kế CSDL (11 bảng — theo ERD mới)

### 5.1. Phân hệ Quản trị & Nhân sự

| Bảng              | PK          | Thuộc tính                         | FK   |
| ------------------ | ----------- | ------------------------------------ | ---- |
| **NHANVIEN** | MaNV        | HoTen, SoDienThoai, ViTri, TrangThai | —   |
| **TAIKHOAN** | TenDangNhap | MatKhau, QuyenHan                    | MaNV |

### 5.2. Phân hệ Danh mục

| Bảng          | PK     | Thuộc tính                       | FK     |
| -------------- | ------ | ---------------------------------- | ------ |
| **MENU** | MaMenu | TenMenu, MoTa                      | —     |
| **MON**  | MaMon  | TenMon, DonGia, HinhAnh, TrangThai | MaMenu |
| **BAN**  | MaBan  | TenBan, TrangThai, QRCode          | —     |

### 5.3. Phân hệ Giao dịch

| Bảng                    | PK             | Thuộc tính                | FK                |
| ------------------------ | -------------- | --------------------------- | ----------------- |
| **GIOHANG**        | MaGio          | ThoiGianTao                 | MaBan             |
| **CHITIETGIOHANG** | (MaGio, MaMon) | SoLuong, GhiChu             | MaGio, MaMon      |
| **DONHANG**        | MaDH           | ThoiGianDat, TrangThaiOrder | MaBan, MaNV, MaHD |
| **CHITIETDONHANG** | (MaDH, MaMon)  | SoLuong, DonGia, GhiChu     | MaDH, MaMon       |

### 5.4. Phân hệ Tài chính

| Bảng               | PK          | Thuộc tính                          | FK         |
| ------------------- | ----------- | ------------------------------------- | ---------- |
| **HOADON**    | MaHD        | ThoiGianXuat, TongTien                | MaNV       |
| **THANHTOAN** | MaThanhToan | ThoiGianThanhToan, SoTien, PhuongThuc | MaHD, MaNV |

### Ràng buộc

- `BAN.TrangThai`: "Trống" | "Đang có khách"
- `MON.TrangThai`: "Còn món" | "Hết món"
- `DONHANG.TrangThaiOrder`: "Chờ" | "Đang làm" | "Hoàn thành" | "Đã giao"
- `THANHTOAN.PhuongThuc`: "TienMat" | "CK" | "Visa"
- **1-1**: NHANVIEN↔TAIKHOAN, HOADON↔THANHTOAN, BAN↔GIOHANG
- **1-N**: MENU→MON, BAN→DONHANG, HOADON→DONHANG (gộp HĐ)

---

## 6. Kiến trúc hệ thống

```text
┌──────────────────────────────────────────────────┐
│                    VERCEL                         │
│  ┌────────────────────────────────────────────┐  │
│  │           React SPA (Vite)                 │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐  │  │
│  │  │ Customer │ │  Staff   │ │  Manager  │  │  │
│  │  │ (Mobile) │ │ (Mobile) │ │ (Desktop) │  │  │
│  │  └──────────┘ └──────────┘ └───────────┘  │  │
│  └──────────────────┬─────────────────────────┘  │
└─────────────────────┼────────────────────────────┘
                      │ HTTPS (REST API)
┌─────────────────────┼────────────────────────────┐
│                   RENDER                          │
│  ┌──────────────────┴─────────────────────────┐  │
│  │         Express.js API Server              │  │
│  │  Auth │ Orders │ Payments │ Admin Routes   │  │
│  └──────────────────┬─────────────────────────┘  │
└─────────────────────┼────────────────────────────┘
                      │ PostgreSQL
┌─────────────────────┼────────────────────────────┐
│                  SUPABASE                         │
│  │            PostgreSQL — 11 Tables             ││
└──────────────────────────────────────────────────┘
```

---

## 7. Design System — Tone "Nhà Bà Teria"

```css
--primary:       #8B4513;    /* Saddle Brown — chủ đạo */
--primary-dark:  #5C2E0A;    /* Dark Brown */
--primary-light: #D2A679;    /* Tan — nhạt */
--accent:        #C0392B;    /* Đỏ nhẹ — điểm nhấn */
--bg-cream:      #FDF5E6;    /* Nền kem */
--bg-warm:       #FAF0E4;    /* Warm background */
--text-dark:     #2C1810;    /* Near black brown */
--text-muted:    #8C7B6B;    /* Muted brown */
--success:       #27AE60;    /* Trạng thái xanh */
--warning:       #F39C12;    /* Cảnh báo cam */
```

- **Font**: Google Fonts — `Nunito` (tiêu đề) + `Inter` (body)
- **Icon**: `react-icons/lu` (Lucide) — clean, chuyên nghiệp
- **Border Radius**: 8-12px
- **Shadow**: `rgba(139, 69, 19, 0.1)`

---

## 8. Danh sách màn hình (11 screens)

| #  | Màn hình    | Vai trò  | Thiết bị | Mô tả                          |
| -- | ------------- | --------- | ---------- | -------------------------------- |
| 1  | Login         | Staff     | Cả hai    | Form đăng nhập phân quyền   |
| 2  | Customer Menu | Khách    | Mobile     | Menu card grid, filter nhóm     |
| 3  | Cart          | Khách    | Mobile     | Giỏ hàng bottom sheet          |
| 4  | Order Status  | Khách    | Mobile     | Theo dõi trạng thái order     |
| 5  | Dashboard     | Staff     | Cả hai    | Tổng quan nhanh                 |
| 6  | Order Board   | NV/Bar    | Mobile     | Kanban 4 trạng thái            |
| 7  | Payment       | Thu ngân | Desktop    | 2 panel: order + thanh toán     |
| 8  | Invoice List  | TN/QL     | Desktop    | Bảng HĐ + tra cứu + chi tiết |
| 9  | Menu Mgmt     | QL        | Desktop    | CRUD thực đơn                 |
| 10 | Table Mgmt    | QL        | Desktop    | CRUD bàn + trạng thái         |
| 11 | Staff Mgmt    | QL        | Desktop    | CRUD nhân viên + tài khoản   |

---

## 9. API Endpoints (tóm tắt)

| Nhóm                 | Endpoints chính                                                               |
| --------------------- | ------------------------------------------------------------------------------ |
| **Auth**        | POST login, POST logout, GET me                                                |
| **Menu**        | GET danh sách, GET theo nhóm, POST/PUT/DELETE món, PATCH trạng thái       |
| **Bàn**        | GET danh sách, POST/PUT/DELETE bàn, PATCH trạng thái                       |
| **Giỏ hàng**  | GET theo bàn, POST thêm món, PUT sửa SL, DELETE xóa món                  |
| **Đơn hàng** | GET danh sách/chi tiết, POST tạo, PATCH trạng thái, PUT sửa, DELETE xóa |
| **Hóa đơn**  | GET danh sách/chi tiết, POST tạo, POST gộp, DELETE xóa                    |
| **Thanh toán** | POST xác nhận thanh toán                                                    |
| **Nhân viên** | GET danh sách/chi tiết, POST/PUT/DELETE                                      |

---

## 10. Phân quyền RBAC

| Chức năng             | Khách | NV PV | Barista | Thu ngân | QL |
| ----------------------- | :----: | :---: | :-----: | :-------: | :-: |
| Xem menu, gọi món     |   ✅   |  —  |   —   |    —    | — |
| Quản lý giỏ hàng    |   ✅   |  —  |   —   |    —    | — |
| Gửi order              |   ✅   |  —  |   —   |    —    | — |
| Xem order board         |   —   |  ✅  |   ✅   |    ✅    | ✅ |
| Cập nhật trạng thái |   —   |  ✅  |   ✅   |    —    | ✅ |
| Thanh toán             |   —   |  —  |   —   |    ✅    | ✅ |
| Quản lý hóa đơn    |   —   |  —  |   —   |    ✅    | ✅ |
| Xóa hóa đơn         |   —   |  —  |   —   |    —    | ✅ |
| CRUD Menu/Bàn/NV       |   —   |  —  |   —   |    —    | ✅ |

---

## 11. Cấu trúc dự án

```text
PTTKHT/cafe-app/
├── client/                   # React Frontend (Vercel)
│   └── src/
│       ├── components/       # Layout, UI, Shared
│       ├── pages/
│       │   ├── Customer/     # Menu, Cart, OrderStatus
│       │   ├── Staff/        # OrderBoard
│       │   ├── Cashier/      # Payment, InvoiceList
│       │   └── Manager/      # MenuMgmt, TableMgmt, StaffMgmt
│       ├── context/          # AuthContext, CartContext
│       ├── services/         # API calls
│       └── App.jsx
├── server/                   # Express Backend (Render)
│   ├── routes/               # auth, menu, orders, tables, invoices, payments, staff
│   ├── middleware/auth.js    # JWT + role check
│   └── server.js
└── database/schema.sql       # DDL cho Supabase
```

---

## 12. Kế hoạch Phase

| Phase                     | Nội dung                                                     | Ưu tiên   |
| ------------------------- | ------------------------------------------------------------- | ----------- |
| **1 — Foundation** | Setup projects, Design System CSS, Login + Auth               | Cao         |
| **2 — Customer**   | Menu (mobile), Giỏ hàng, Gửi order, Theo dõi trạng thái | Cao         |
| **3 — Staff**      | Order Board Kanban (mobile), Cập nhật trạng thái          | Cao         |
| **4 — Cashier**    | Thanh toán (desktop), Gộp HĐ, Quản lý HĐ                | Trung bình |
| **5 — Manager**    | CRUD Menu, Bàn, Nhân viên (desktop)                        | Trung bình |
| **6 — Deploy**     | Polish responsive, Deploy Vercel + Render + Supabase          | Cuối       |

---

## 13. Seed Data mẫu

**5 nhóm menu**: Cà phê, Trà, Sinh tố, Nước ép, Bánh & Snack
**10+ món mẫu**: CF sữa đá (29k), Bạc xỉu (32k), Americano (35k), Latte (42k), Trà đào (35k)...
**15 bàn**: Bàn 01 → 15 (mỗi bàn có QR code)
**5 nhân viên**: 

- Trần Đức Phát (BAR)
- Ngô Gia Toàn (NV)
- Lam Chí Hiển (NV)
- Nguyễn Lê Hải Long (QL)
- Nguyễn Hoàng Phúc (NV)
- Nguyễn Thúy Ngân (TN)
- Trần Anh Tú (BAR)
- Trịnh Minh Đạt (TN)

---

## Câu hỏi cần xác nhận

1. **Tên quán** chính xác là "Nhà Bà Teria"?
2. Bạn có **file logo** sẵn không? Không thì tôi tạo text logo.
3. Bạn có **ảnh thực tế** các món không? Không thì dùng placeholder.
4. Bạn đã tạo **project Supabase** chưa? (cần URL + key)
5. **Realtime** cho order board — WebSocket hay auto-refresh là đủ cho demo?
