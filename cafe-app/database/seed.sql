-- Xóa dữ liệu cũ (Do các bảng có khóa ngoại, nên cần xóa ngược thứ tự hoặc cascade đã lo)
TRUNCATE TABLE "THANHTOAN", "CHITIETDONHANG", "DONHANG", "HOADON", "CHITIETGIOHANG", "GIOHANG", "BAN", "MON", "MENU", "TAIKHOAN", "NHANVIEN" CASCADE;

-- 1. SEED NHÂN VIÊN
INSERT INTO "NHANVIEN" ("MaNV", "HoTen", "SoDienThoai", "ViTri", "TrangThai") VALUES
('NV01', 'Nguyễn Văn An', '0901234567', 'Quản lý', 'DangLam'),
('NV02', 'Trần Thị Bích', '0912345678', 'Thu ngân', 'DangLam'),
('NV03', 'Lê Hoàng Cường', '0923456789', 'Phục vụ', 'DangLam'),
('NV04', 'Phạm Minh Đức', '0934567890', 'Barista', 'DangLam'),
('NV05', 'Hoàng Thị Em', '0945678901', 'Phục vụ', 'DangLam');

-- 2. SEED TÀI KHOẢN (Mật khẩu mặc định là 123456. Trong thực tế cần băm mật khẩu, ở demo tạm dùng plaintext hoặc tự băm ở backend. Giả sử lưu plaintext cho demo frontend)
INSERT INTO "TAIKHOAN" ("TenDangNhap", "MatKhau", "QuyenHan", "MaNV") VALUES
('admin', '123456', 'admin', 'NV01'),
('thungan', '123456', 'thungan', 'NV02'),
('phucvu', '123456', 'phucvu', 'NV03'),
('barista', '123456', 'barista', 'NV04'),
('phucvu2', '123456', 'phucvu', 'NV05');

-- 3. SEED MENU
INSERT INTO "MENU" ("MaMenu", "TenMenu", "MoTa") VALUES
('M01', 'Cà phê', 'Các loại cà phê truyền thống và pha máy'),
('M02', 'Trà', 'Trà trái cây, trà sữa thanh mát'),
('M03', 'Sinh tố', 'Sinh tố trái cây tươi xay'),
('M04', 'Nước ép', 'Nước ép nguyên chất không đường'),
('M05', 'Bánh & Snack', 'Bánh ngọt và đồ ăn vặt');

-- 4. SEED MÓN
INSERT INTO "MON" ("MaMon", "TenMon", "DonGia", "HinhAnh", "TrangThai", "MaMenu") VALUES
('MON01', 'Cà phê sữa đá', 29000, 'MON01.jpg', 'ConMon', 'M01'),
('MON02', 'Bạc xỉu', 32000, 'MON02.jpg', 'ConMon', 'M01'),
('MON03', 'Americano', 35000, 'MON03.jpg', 'ConMon', 'M01'),
('MON04', 'Latte', 42000, 'MON04.jpg', 'ConMon', 'M01'),
('MON05', 'Trà đào cam sả', 35000, 'MON05.jpg', 'ConMon', 'M02'),
('MON06', 'Trà sữa truyền thống', 30000, 'MON06.jpg', 'ConMon', 'M02'),
('MON07', 'Sinh tố bơ', 40000, 'MON07.jpg', 'ConMon', 'M03'),
('MON08', 'Sinh tố dâu', 38000, 'MON08.jpg', 'ConMon', 'M03'),
('MON09', 'Nước ép cam', 32000, 'MON09.jpg', 'ConMon', 'M04'),
('MON10', 'Bánh flan', 20000, 'MON10.jpg', 'ConMon', 'M05');

-- 5. SEED BÀN (15 BÀN)
INSERT INTO "BAN" ("MaBan", "TenBan", "TrangThai", "QRCode") VALUES
('B01', 'Bàn 01', 'Trong', 'QR_B01'),
('B02', 'Bàn 02', 'Trong', 'QR_B02'),
('B03', 'Bàn 03', 'Trong', 'QR_B03'),
('B04', 'Bàn 04', 'Trong', 'QR_B04'),
('B05', 'Bàn 05', 'Trong', 'QR_B05'),
('B06', 'Bàn 06', 'Trong', 'QR_B06'),
('B07', 'Bàn 07', 'Trong', 'QR_B07'),
('B08', 'Bàn 08', 'Trong', 'QR_B08'),
('B09', 'Bàn 09', 'Trong', 'QR_B09'),
('B10', 'Bàn 10', 'Trong', 'QR_B10'),
('B11', 'Bàn 11', 'Trong', 'QR_B11'),
('B12', 'Bàn 12', 'Trong', 'QR_B12'),
('B13', 'Bàn 13', 'Trong', 'QR_B13'),
('B14', 'Bàn 14', 'Trong', 'QR_B14'),
('B15', 'Bàn 15', 'Trong', 'QR_B15');
