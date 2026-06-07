-- Xóa dữ liệu cũ (Do các bảng có khóa ngoại, nên cần xóa ngược thứ tự hoặc cascade đã lo)
TRUNCATE TABLE "CHITIETKIEMKHO", "PHIEUKIEMKHO", "CHITIETPHIEUXUAT", "PHIEUXUAT", "CHITIETPHIEUNHAP", "PHIEUNHAP", "NCC", "CONGTHUC", "NGUYENLIEU", "THANHTOAN", "CHITIETDONHANG", "DONHANG", "HOADON", "CHITIETGIOHANG", "GIOHANG", "BAN", "MON", "MENU", "TAIKHOAN", "NHANVIEN" CASCADE;

-- 1. SEED NHÂN VIÊN
INSERT INTO "NHANVIEN" ("MaNV", "HoTen", "SoDienThoai", "ViTri", "TrangThai") VALUES
('NV01', 'Nguyễn Lê Hải Long', '0901234561', 'Quản lý', 'DangLam'),
('NV02', 'Nguyễn Thúy Ngân', '0901234562', 'Thu ngân', 'DangLam'),
('NV03', 'Trịnh Minh Đạt', '0901234563', 'Barista', 'DangLam'),
('NV04', 'Ngô Gia Toàn', '0901234564', 'Barista', 'DangLam'),
('NV05', 'Trần Đức Phát', '0901234565', 'Phục vụ', 'DangLam'),
('NV06', 'Lam Chí Hiển', '0901234566', 'Phục vụ', 'DangLam'),
('NV07', 'Trần Anh Tú', '0901234567', 'Phục vụ', 'DangLam'),
('NV08', 'Nguyễn Hoàng Phúc', '0901234568', 'Phục vụ', 'DangLam');

-- 2. SEED TÀI KHOẢN (Mật khẩu mặc định là 123456. Trong thực tế cần băm mật khẩu, ở demo tạm dùng plaintext hoặc tự băm ở backend. Giả sử lưu plaintext cho demo frontend)
INSERT INTO "TAIKHOAN" ("TenDangNhap", "MatKhau", "QuyenHan", "MaNV") VALUES
('admin', '123456', 'admin', 'NV01'),
('thungan', '123456', 'thungan', 'NV02'),
('barista1', '123456', 'barista', 'NV03'),
('barista2', '123456', 'barista', 'NV04'),
('phucvu1', '123456', 'phucvu', 'NV05'),
('phucvu2', '123456', 'phucvu', 'NV06'),
('phucvu3', '123456', 'phucvu', 'NV07'),
('phucvu4', '123456', 'phucvu', 'NV08');

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

-- 6. SEED NGUYÊN LIỆU
INSERT INTO "NGUYENLIEU" ("MaNL", "TenNL", "DonViTinh", "SoLuongTon", "MucToiThieu") VALUES
('NL01', 'Cà phê bột', 'Gram', 5000, 1000),
('NL02', 'Sữa đặc', 'Lon', 20, 5),
('NL03', 'Sữa tươi', 'Hộp', 15, 5),
('NL04', 'Trà đen', 'Gram', 3000, 500),
('NL05', 'Cam tươi', 'Kg', 10, 2),
('NL06', 'Đào ngâm', 'Lon', 5, 2);

-- 7. SEED NHÀ CUNG CẤP
INSERT INTO "NCC" ("MaNCC", "TenNCC", "SoDienThoai", "DiaChi") VALUES
('NCC01', 'Đại lý Cà Phê Trung Nguyên', '0909123456', 'Quận 1, TP.HCM'),
('NCC02', 'Công ty Sữa Vinamilk', '0918123456', 'Quận 7, TP.HCM'),
('NCC03', 'Chợ đầu mối trái cây', '0927123456', 'Quận Thủ Đức, TP.HCM');

-- 8. SEED CÔNG THỨC (Mapping)
INSERT INTO "CONGTHUC" ("MaMon", "MaNL", "DinhLuong") VALUES
('MON01', 'NL01', 25),
('MON01', 'NL02', 20),
('MON02', 'NL01', 15),
('MON02', 'NL02', 20),
('MON02', 'NL03', 30),
('MON05', 'NL04', 10),
('MON05', 'NL05', 50),
('MON05', 'NL06', 20);

-- 9. SEED HÓA ĐƠN VÀ ĐƠN HÀNG TRONG 6 THÁNG QUA (Tháng 1 -> Tháng 6 năm 2026)
INSERT INTO "HOADON" ("MaHD", "ThoiGianXuat", "TongTien", "MaNV") VALUES
('HD_JAN', '2026-01-15 10:00:00+07', 500000, 'NV02'),
('HD_FEB', '2026-02-15 11:00:00+07', 750000, 'NV02'),
('HD_MAR', '2026-03-20 14:00:00+07', 1200000, 'NV02'),
('HD_APR', '2026-04-10 09:00:00+07', 900000, 'NV02'),
('HD_MAY', '2026-05-05 16:00:00+07', 1500000, 'NV02'),
('HD_JUN', '2026-06-01 12:00:00+07', 2000000, 'NV02');

INSERT INTO "DONHANG" ("MaDH", "ThoiGianDat", "TrangThaiOrder", "MaBan", "MaNV", "MaHD") VALUES
('DH_JAN', '2026-01-15 09:30:00+07', 'DaGiao', 'B01', 'NV05', 'HD_JAN'),
('DH_FEB', '2026-02-15 10:30:00+07', 'DaGiao', 'B02', 'NV05', 'HD_FEB'),
('DH_MAR', '2026-03-20 13:30:00+07', 'DaGiao', 'B03', 'NV06', 'HD_MAR'),
('DH_APR', '2026-04-10 08:30:00+07', 'DaGiao', 'B04', 'NV06', 'HD_APR'),
('DH_MAY', '2026-05-05 15:30:00+07', 'DaGiao', 'B05', 'NV07', 'HD_MAY'),
('DH_JUN', '2026-06-01 11:30:00+07', 'DaGiao', 'B06', 'NV07', 'HD_JUN');

INSERT INTO "CHITIETDONHANG" ("MaDH", "MaMon", "SoLuong", "DonGia") VALUES
('DH_JAN', 'MON01', 10, 29000), ('DH_JAN', 'MON02', 5, 32000),
('DH_FEB', 'MON03', 15, 35000), ('DH_FEB', 'MON04', 5, 42000),
('DH_MAR', 'MON05', 20, 35000), ('DH_MAR', 'MON06', 10, 30000),
('DH_APR', 'MON07', 15, 40000), ('DH_APR', 'MON08', 5, 38000),
('DH_MAY', 'MON09', 30, 32000), ('DH_MAY', 'MON10', 10, 20000),
('DH_JUN', 'MON01', 40, 29000), ('DH_JUN', 'MON02', 20, 32000);

INSERT INTO "THANHTOAN" ("MaThanhToan", "ThoiGianThanhToan", "SoTien", "PhuongThuc", "MaHD", "MaNV") VALUES
('TT_JAN', '2026-01-15 10:05:00+07', 500000, 'CK', 'HD_JAN', 'NV02'),
('TT_FEB', '2026-02-15 11:05:00+07', 750000, 'TienMat', 'HD_FEB', 'NV02'),
('TT_MAR', '2026-03-20 14:05:00+07', 1200000, 'Visa', 'HD_MAR', 'NV02'),
('TT_APR', '2026-04-10 09:05:00+07', 900000, 'CK', 'HD_APR', 'NV02'),
('TT_MAY', '2026-05-05 16:05:00+07', 1500000, 'CK', 'HD_MAY', 'NV02'),
('TT_JUN', '2026-06-01 12:05:00+07', 2000000, 'TienMat', 'HD_JUN', 'NV02');

-- 10. SEED PHIẾU NHẬP (CHI PHÍ)
INSERT INTO "PHIEUNHAP" ("MaPN", "NgayNhap", "TongTienNhap", "MaNV", "MaNCC") VALUES
('PN_JAN', '2026-01-05 08:00:00+07', 200000, 'NV01', 'NCC01'),
('PN_FEB', '2026-02-05 08:00:00+07', 300000, 'NV01', 'NCC02'),
('PN_MAR', '2026-03-05 08:00:00+07', 500000, 'NV01', 'NCC03'),
('PN_APR', '2026-04-05 08:00:00+07', 400000, 'NV01', 'NCC01'),
('PN_MAY', '2026-05-05 08:00:00+07', 600000, 'NV01', 'NCC02'),
('PN_JUN', '2026-06-05 08:00:00+07', 800000, 'NV01', 'NCC03');

INSERT INTO "CHITIETPHIEUNHAP" ("MaPN", "MaNL", "SoLuong", "DonGiaNhap") VALUES
('PN_JAN', 'NL01', 1000, 100), ('PN_JAN', 'NL02', 10, 10000),
('PN_FEB', 'NL03', 20, 15000),
('PN_MAR', 'NL04', 500, 1000),
('PN_APR', 'NL05', 20, 20000),
('PN_MAY', 'NL06', 30, 20000),
('PN_JUN', 'NL01', 2000, 100), ('PN_JUN', 'NL02', 60, 10000);

-- 11. SEED PHIẾU KIỂM KHO (HAO HỤT)
INSERT INTO "PHIEUKIEMKHO" ("MaPKK", "NgayKiem", "TrangThai", "MaNV") VALUES
('PKK_MAY', '2026-05-31 22:00:00+07', 'Lech', 'NV01'),
('PKK_JUN', '2026-06-06 22:00:00+07', 'Lech', 'NV01');

INSERT INTO "CHITIETKIEMKHO" ("MaPKK", "MaNL", "SLThucTe", "SLLyThuyet", "ChenhLech", "GhiChu") VALUES
('PKK_MAY', 'NL01', 4900, 5000, -100, 'Nhân viên đánh đổ'),
('PKK_MAY', 'NL02', 20, 20, 0, 'Khớp'),
('PKK_JUN', 'NL03', 13, 15, -2, 'Sữa hết hạn bị bỏ'),
('PKK_JUN', 'NL04', 3100, 3000, 100, 'Đếm nhầm kỳ trước');
