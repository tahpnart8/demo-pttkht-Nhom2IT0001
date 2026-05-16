# Kế Hoạch Triển Khai — Hệ Thống Quản Lý Quán Cafe "Nhà Ba Teria"

> Tài liệu này chia kế hoạch triển khai thành **6 giai đoạn** cụ thể, mỗi giai đoạn có checklist rõ ràng.

---

## Xác nhận yêu cầu

| # | Yêu cầu | Xác nhận |
|---|---------|----------|
| 1 | Tên quán | **Nhà Ba Teria** |
| 2 | Logo | Text logo + icon cà phê (Lucide `Coffee` icon) |
| 3 | Ảnh món | Placeholder + hỗ trợ thay ảnh dễ dàng qua folder `public/images/menu/` |
| 4 | Database | Supabase — hướng dẫn tạo kèm theo, key lưu `.env` + `.gitignore` |
| 5 | Realtime | **Polling** (auto-refresh 5s) — nhẹ nhất cho demo |

---

## Giai đoạn 1: Khởi tạo dự án & Database

### 1.1. Tạo project Supabase (hướng dẫn)
1. Truy cập [https://supabase.com](https://supabase.com) → **Sign up** (dùng GitHub)
2. Bấm **"New Project"** → đặt tên: `nha-ba-teria`
3. Chọn Region: **Southeast Asia (Singapore)**
4. Đặt **Database Password** → ghi nhớ lại
5. Sau khi tạo xong, vào **Settings → API** → copy:
   - `Project URL` (ví dụ: `https://xxxxx.supabase.co`)
   - `anon public key`
   - `service_role key`
6. Vào **SQL Editor** → paste file `database/schema.sql` và chạy

### 1.2. Khởi tạo cấu trúc dự án
```text
PTTKHT/cafe-app/
├── client/          # Vite + React (deploy Vercel)
├── server/          # Express.js (deploy Render)
├── database/        # schema.sql + seed.sql
├── docs/            # Tài liệu
└── .gitignore
```

### 1.3. Checklist
- [ ] Tạo project Supabase + copy API keys
- [ ] Khởi tạo Vite + React (`npx create-vite client --template react`)
- [ ] Khởi tạo Express server (`npm init` trong folder server)
- [ ] Cài dependencies (react-router, react-icons, cors, dotenv, pg)
- [ ] Tạo `.env` cho cả client và server + `.gitignore`
- [ ] Viết `schema.sql` (11 bảng) + `seed.sql` (data mẫu)
- [ ] Chạy DDL trên Supabase SQL Editor
- [ ] Test kết nối DB từ Express

---

## Giai đoạn 2: Design System & Auth

### 2.1. Design System CSS
- Tạo file `index.css` với CSS Variables (tone nâu đỏ warm)
- Palette: `#8B4513` (primary), `#FDF5E6` (bg-cream), `#C0392B` (accent)
- Font: Google Fonts — Nunito (tiêu đề) + Inter (body)
- Component base: Button, Input, Card, Modal, Badge, Table

### 2.2. Logo "Nhà Ba Teria"
- Text logo kết hợp Lucide `Coffee` icon
- Hiển thị trên header/sidebar

### 2.3. Layout Components
- `MobileLayout` — bottom navigation (Khách, NV, Barista)
- `DesktopLayout` — sidebar + header (Thu ngân, Quản lý)
- `ProtectedRoute` — kiểm tra JWT + vai trò

### 2.4. Auth Flow
- Trang Login (responsive cả mobile lẫn desktop)
- API: `POST /api/auth/login` → trả JWT
- Lưu token vào localStorage
- AuthContext quản lý user state

### Checklist
- [ ] Tạo Design System CSS (variables, base styles, typography)
- [ ] Tạo Logo component
- [ ] Tạo MobileLayout + DesktopLayout
- [ ] Tạo UI components (Button, Input, Card, Modal, Badge)
- [ ] Backend: route `/api/auth/login` + middleware JWT
- [ ] Frontend: trang Login + AuthContext + ProtectedRoute
- [ ] Test: login với 4 vai trò (admin/thungan/phucvu/barista)

---

## Giai đoạn 3: Luồng khách hàng (Mobile-first)

### 3.1. Màn hình Menu
- Truy cập qua URL `/order/:tableId` (giả lập quét QR)
- Header hiển thị tên quán + số bàn
- Tab filter theo nhóm menu (Cà phê, Trà, Sinh tố...)
- Card grid 2 cột: ảnh + tên + giá + nút "Thêm"
- Ảnh placeholder từ `public/images/menu/` → dễ thay thế

### 3.2. Giỏ hàng
- Bottom sheet hoặc trang riêng
- Danh sách món đã chọn + SL + ghi chú
- Nút +/- số lượng, nút xóa
- Tổng tiền tạm tính
- Nút "Gửi Order"

### 3.3. Theo dõi Order
- Sau khi gửi → chuyển sang màn hình trạng thái
- Hiển thị: danh sách món + trạng thái hiện tại
- Auto-refresh mỗi 5 giây

### 3.4. Backend cần thiết
- `GET /api/menu` — danh sách nhóm
- `GET /api/items?menu=:id` — món theo nhóm
- `POST /api/cart/:tableId/items` — thêm vào giỏ
- `GET /api/cart/:tableId` — xem giỏ
- `POST /api/orders` — tạo đơn hàng
- `GET /api/orders/:id` — xem trạng thái

### Checklist
- [ ] Backend: CRUD giỏ hàng + tạo order
- [ ] Frontend: trang CustomerMenu (card grid, filter)
- [ ] Frontend: trang Cart (thêm/sửa/xóa, tổng tiền)
- [ ] Frontend: trang OrderStatus (auto-refresh)
- [ ] Tạo folder `public/images/menu/` + ảnh placeholder
- [ ] Test luồng: quét QR → chọn món → gửi order

---

## Giai đoạn 4: Luồng nhân viên & Barista (Mobile-first)

### 4.1. Order Board
- Dạng danh sách card theo 4 nhóm trạng thái
- Mobile: tab hoặc scroll ngang giữa các nhóm
- Mỗi card: mã order, bàn, danh sách món, thời gian
- Nút bấm chuyển trạng thái: Chờ → Đang làm → Hoàn thành → Đã giao

### 4.2. Backend
- `GET /api/orders?status=:status` — filter theo trạng thái
- `PATCH /api/orders/:id/status` — cập nhật trạng thái

### Checklist
- [ ] Backend: API lấy orders + cập nhật trạng thái
- [ ] Frontend: trang OrderBoard (card list, trạng thái tabs)
- [ ] Nút chuyển trạng thái với xác nhận
- [ ] Auto-refresh 5s cho order board
- [ ] Test: tạo order từ khách → nhìn thấy trên board → cập nhật

---

## Giai đoạn 5: Luồng thu ngân & Quản lý (Desktop-first)

### 5.1. Thanh toán (Thu ngân)
- Layout 2 cột: trái = danh sách order theo bàn, phải = chi tiết + form TT
- Chọn order → xem chi tiết → chỉnh sửa nếu cần
- Gộp nhiều order cùng bàn → 1 hóa đơn
- Chọn phương thức (Tiền mặt / CK / Visa)
- Xác nhận → tạo hóa đơn + thanh toán
- In hóa đơn (print CSS)

### 5.2. Quản lý hóa đơn
- Bảng danh sách hóa đơn + bộ lọc (ngày, mã HĐ)
- Xem chi tiết hóa đơn (modal)
- Xóa hóa đơn (chỉ QL)

### 5.3. Quản lý Menu
- Bảng CRUD món: thêm/sửa/xóa
- Upload ảnh (lưu vào `public/images/menu/`)
- Toggle trạng thái còn/hết

### 5.4. Quản lý Bàn
- Grid card bàn + trạng thái (Trống/Đang có khách)
- Thêm/Sửa/Xóa bàn
- Cập nhật trạng thái

### 5.5. Quản lý Nhân viên
- Bảng CRUD nhân viên
- Tạo/sửa tài khoản đăng nhập
- Phân quyền

### 5.6. Backend cần thiết
- CRUD đầy đủ cho: invoices, payments, items, tables, staff
- API gộp hóa đơn: `POST /api/invoices/merge`

### Checklist
- [ ] Backend: CRUD invoices + payments + merge
- [ ] Backend: CRUD items + tables + staff
- [ ] Frontend: trang Payment (2 panel layout)
- [ ] Frontend: trang InvoiceList (bảng + filter + modal chi tiết)
- [ ] Frontend: trang MenuMgmt (bảng CRUD + upload ảnh)
- [ ] Frontend: trang TableMgmt (grid card + CRUD)
- [ ] Frontend: trang StaffMgmt (bảng CRUD + tài khoản)
- [ ] Test: luồng thanh toán end-to-end
- [ ] Test: CRUD menu/bàn/nhân viên

---

## Giai đoạn 6: Polish & Deploy

### 6.1. Hoàn thiện
- Responsive tuning cho tất cả màn hình
- Loading states (skeleton, spinner)
- Error handling + Toast notifications
- Empty states (khi chưa có data)
- Seed data hoàn chỉnh (10+ món, 15 bàn, 5 NV)

### 6.2. Deploy
- **Vercel**: deploy folder `client/` — cấu hình env vars
- **Render**: deploy folder `server/` — cấu hình env vars
- **Supabase**: đã có sẵn từ giai đoạn 1

### 6.3. Hướng dẫn thay ảnh món
Đặt ảnh vào `client/public/images/menu/` với tên file = MaMon:
```
images/menu/MON01.jpg   → Cà phê sữa đá
images/menu/MON02.jpg   → Bạc xỉu
...
```
Hệ thống tự load ảnh theo mã món. Nếu không có ảnh → hiển thị placeholder mặc định.

### Checklist
- [ ] Responsive test (Chrome DevTools: iPhone SE, iPad, Desktop)
- [ ] Loading + Error states
- [ ] Seed data đầy đủ
- [ ] Deploy Vercel (client)
- [ ] Deploy Render (server)
- [ ] Test end-to-end trên production URL
- [ ] Viết file README.md hướng dẫn chạy local

---

## Tổng kết tiến độ

| Giai đoạn | Mô tả | Trạng thái |
|-----------|-------|-----------|
| 1 | Khởi tạo + Database | ⬜ Chưa bắt đầu |
| 2 | Design System + Auth | ⬜ Chưa bắt đầu |
| 3 | Luồng khách hàng | ⬜ Chưa bắt đầu |
| 4 | Luồng NV/Barista | ⬜ Chưa bắt đầu |
| 5 | Luồng TN/QL | ⬜ Chưa bắt đầu |
| 6 | Polish + Deploy | ⬜ Chưa bắt đầu |
