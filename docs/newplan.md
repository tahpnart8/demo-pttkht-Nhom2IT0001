**1. Đánh giá về tính logic và sự kết nối (Business Logic)

Sự kết nối giữa Kho - Công thức - Bán hàng là "xương sống" của các hệ thống quản

lý F&B chuyên nghiệp.

- Logic "Tạm ngưng phục vụ": Bạn đề xuất nếu kho không đủ nguyên liệu thì món

  ăn/đồ uống tự động chuyển trạng thái "Tạm hết". Đây là tính năng rất hay,

  giúp:

  - Tránh trải nghiệm xấu cho khách hàng khi đã đặt món trên QR nhưng nhân

    viên báo hết.
  - Giảm tải việc kiểm tra thủ công giữa Barista và Phục vụ.
- Dòng chảy dữ liệu: Khi  (Status: Done) -> Hệ thống sẽ

  tự động trừ kho dựa trên định mức công thức đã thiết lập.

đầu ngày:  lấy 1 lượng nguyên liệu nhất định

Trong lúc làm nếu hết nguyên liệu thì vào kho lấy thêm

kết ca còn gì thì đem lại kho

TỰ ĐỘNG HÓA CẬP NHẬT TRẠNG THÁI MÓN:

TĐH Cập nhật trạng thái món: Đầu ca vào nhân viên lấy ra bnhieu nguyên liệu để lên quầy => Nhập vào để hệ thống trừ vào kho => giữa ca lấy gì cũng phải nhập lên hệ thống => tới khi có 1 loại nguyên liệu hết (ví dụ sữa còn 1 hộp trong kho) thì nhân viên lấy hộp đó ra quầy dùng, cho tới khi hết hẳn hộp trên quầy + trong kho thì mới nhập lên hệ thống (-1 hộp = 0 hộp trong kho) => hệ thống sẽ k cho order món gì có sữa đặc nữa.

_ khi nguyên liệu nào đó sắp hết thì sẽ có thông báo cho quản lý (extend)

_ Khi nhập nguyên liệu nhân viên hoặc quản lý có thể tự nhập

* Có 3 nút, xuất kho, nhập kho, xem lịch sử(extend)
* Khi lấy ra hoặc nhập vào thì số lượng (giống quản lý giỏ hàng)
* Hệ thống cộng/trừ trong kho và lưu lịch sử

ACTIVITY QUẢN LÝ KHO

_ Xem, thêm, sửa, xóa nguyên liệu, thêm/xóa/sửa(vd quy định 1 thùng vinamilk là bao nhiêu bịch) đơn vị (linh động theo nhiều đơn vị - chai/thùng…)

_ Xuất/nhập

_ Kiểm kho

_ Xem báo cáo, phiếu xuất/nhập

activity nhập/ xuất kho

Báo cáo kiểm kho (thủ công):

Cuối tuần nhân viên kiểm tra lại số lượng nguyên vật liệu trong kho rồi điền vào form báo cáo sẵn. -> Báo cáo kiểm kho

ACtivity kiểm kho + qua khâu điền form

Hệ thống dò lại hóa đơn trong tuần, xuất ra số lượng món được gọi trong tuần x định lượng nl trong công thức => ra cái báo cáo riêng (hệ thống tự hiểu) ->  rồi đối chiếu số lượng vs báo cáo của nhân viên ->  nếu có chênh lệch sẽ báo cho quản lý

TỰ ĐỘNG ĐỐI CHIẾU BÁO CÁO (cuối tuần ms check):

nhân viên kiểm kho rồi báo cáo hệ thống dựa theo hóa đơn +  định mức công thức - > báo

2. Chi tiết các Phân hệ cần bổ sung

A. Phản hệ Quản lý Kho (Inventory Management)

Bạn cần bổ sung các thực thể và chức năng sau:

- Thực thể mới: NGUYEN_LIEU (Nguyên liệu), PHIEU_NHAP (Phiêu nhập), PHIEU_XUAT,

  (Phiếu xuất - dùng khi hủy hàng/hết hạn), NCC (Nhà cung cấp).
- Chức năng:

  - Nhập kho: Cập nhật số lượng, đơn giá nhập (để tính giá vốn - COGS).
  - Kiểm kê: Chốt số lượng tồn thực tế so với tồn trên máy để xử lý hao hụt.
  - Cảnh báo tồn kho tối thiểu: Tự động báo động khi một nguyên liệu sắp

    hết.

B. Phân hệ Quản lý Công thức (Recipe/BOM Management)

Đây là phần "trung gian" nối Menu với Kho.

- Thực thể mới: CONG_THUC (Bảng công thức). Một món (MON) sẽ có nhiều nguyên liệu (NGUYEN_LIEU) đi kèm với số lượng cụ thể (ví dụ: 1 ly Cafe Sữa

  cần 30g cafe bột + 20ml sữa đặc).
- Logic xử lý:

  - Check-stock: Trước khi hiển thị menu cho khách (phân hệ Customer), hệ

    thống chạy một hàm quét: Nếu (Tồn kho < Định mức) -> Hiển thị "Hết

    hàng".
  - Auto-deduct: Khi đơn hàng hoàn thành -> Trừ số lượng tồn kho tương ứng.

C. Phân hệ Quản lý Báo cáo (Reporting)

Chuyển đổi dữ liệu thô thành thông tin quản trị.

- Báo cáo doanh thu: Theo ngày, tháng, ca làm việc.
- Báo cáo chi phí giá vốn (COGS): Dựa trên định mức và giá nhập kho để biết

  thực sự lãi bao nhiêu trên từng ly nước.
- Báo cáo hàng bán chạy (Best-seller): Giúp quản lý điều chỉnh menu.
- Báo cáo hao hụt: Chênh lệch giữa tồn kho thực tế và tồn kho hệ thống.

3. Tác động đến thiết kế hệ thống (Kỹ thuật)

Nếu bạn bổ sung các chức năng này, các phần trong đồ án của bạn sẽ phải cập nhật

như sau:

- Sơ đồ Use Case: Thêm Actor "Quản lý kho" hoặc thêm quyền cho "Quản lý" thực

  hiện các Use Case: Nhập kho, Kiểm kê, Thiết lập định mức, Xem báo cáo.
- Sơ đồ ERD (Cơ sở dữ liệu): Đây là phần thay đổi nhiều nhất.

  - Cần thêm bảng Ingredient, Recipe, Supplier, StockReceipt.
  - Mối quan hệ: Mon (1) --- (n) Recipe (n) --- (1) Ingredient.
- Sơ đồ Sequence: Cần thêm luồng xử lý: Customer chọn món -> System check

  Recipe & Stock -> Trả về kết quả cho phép đặt hay không.
- Giao diện (UI/UX):

  - Desktop (Quản lý): Thêm tab "Kho hàng" và "Công thức", "Báo cáo".
  - Mobile (Khách hàng): Thêm trạng thái "Sold out" (Mờ đi) cho các món

    không đủ nguyên liệu.

4. Đánh giá chi tiết (Ưu & Nhược điểm)

Ưu điểm:

1. Tính chuyên nghiệp cực cao: Đồ án sẽ không dừng lại ở việc "gọi món" mà tiến

   tới "quản trị vận hành".
2. Giá trị thực tiễn: Giúp chủ quán kiểm soát được thất thoát (nguyên nhân lớn

   nhất gây lỗ trong ngành F&B).
3. Tự động hóa: Giảm sai sót do con người khi phải ghi nhớ món nào còn, món nào

   hết.

Thách thức (Bạn cần lưu ý):

1. Độ phức tạp dữ liệu: Việc tính toán trừ kho theo thời gian thực (real-time)

   yêu cầu thuật toán xử lý tốt để không làm chậm hệ thống khi khách đông.
2. Vấn đề nguyên liệu chung: Nhiều món dùng chung 1 nguyên liệu (ví dụ: cùng

   dùng sữa đặc). Nếu sữa đặc hết, hệ thống phải tự động đóng tất cả các món

   liên quan đến sữa đặc.
3. Hao hụt thực tế: Trong thực tế, Barista có thể tay nghề chưa đều (pha

   dư/thiếu), dẫn đến số liệu kho trên máy và thực tế luôn có sai số. Bạn

   cần thêm chức năng "Điều chỉnh kho" định kỳ.
4. Sơ đồ Trạng thái (State Machine Diagram)

Trong một hệ thống F&B, các đối tượng thay đổi trạng thái liên tục. Giảng viên

rất thích sơ đồ này vì nó thể hiện tư duy logic chặt chẽ.

- Ứng dụng:

  - Trạng thái Đơn hàng (Order State): Đang chờ -> Đang pha chế -> Đã xong

    -> Đã giao -> Đã thanh toán -> Đã hủy.
  - Trạng thái Món ăn (Dish/Recipe State): Đang phục vụ -> Tạm hết hàng (do

    kho thiếu) -> Ngừng kinh doanh.
  - Trạng thái Bàn: Trống -> Có khách -> Chờ thanh toán -> Đang dọn dẹp.

2. Sơ đồ Thành phần (Component Diagram)

Hệ thống của bạn có sự kết hợp giữa React (Frontend), Node.js (Backend) và

Supabase (Database). Sơ đồ này giúp mô tả cách các module phần mềm tương tác với

nhau.

- Ứng dụng: Chia hệ thống thành các khối: Auth Component, POS Component,

  Inventory Component, Reporting Engine, Notification Service.
- Nó cho thấy cách bạn tổ chức code theo module, giúp hệ thống dễ bảo trì và

  mở rộng.

3. Nâng cấp Sơ đồ Sequence (Sequence Diagram với Alt, Loop, Fragment)

Các sơ đồ Sequence hiện tại của bạn có vẻ là "luồng chuẩn" (Happy Path). Để

chuyên sâu hơn, bạn cần thể hiện các trường hợp lỗi.

- Ứng dụng cho Quản lý Kho/Công thức:

  - Sử dụng khung alt (Alternative): Nếu CheckStock == false -> Trả về lỗi

    "Nguyên liệu không đủ" và gửi thông báo cho Quản lý.
  - Sử dụng khung loop: Duyệt qua danh sách nguyên liệu trong công thức để

    trừ kho.

4. Sơ đồ Hoạt động (Activity Diagram) dạng Swimlane (Phân làn)

Thay vì sơ đồ hoạt động đơn thuần, hãy chia làn (Swimlanes) theo các Actor

(Khách hàng, Nhân viên, Hệ thống, Kho).

- Ứng dụng cho quy trình Nhập kho & Kiểm kê:

  - Làn Quản lý: Nhập số liệu thực tế.
  - Làn Hệ thống: So sánh với tồn kho sổ sách, tính toán hao hụt.
  - Làn Kho: Cập nhật lại số dư mới.

5. Sơ đồ Luồng dữ liệu (DFD) Mức 2 cho các phân hệ mới

Bạn đã có DFD mức 0 và 1. Giảng viên sẽ yêu cầu chi tiết hơn ở mức 2 cho:

- Tiến trình Quản lý Kho: Luồng dữ liệu từ Phiếu nhập kho chảy vào Bảng tồn

  kho và cập nhật giá vốn.
- Tiến trình Tổng hợp Báo cáo: Cách hệ thống quét dữ liệu từ bảng HoaDon và

  ChiTietDonHang để tính toán doanh thu và lợi nhuận.

6. Tính lương nhân viên

**


**[PTTTHT - CK - CLASS/ERD](https://drive.google.com/drive/folders/12ndT1-o_J3C34O0Z6zM5L0IeXXbODTfv?usp=sharing)

![]()
TAIKHOAN: Các thuộc tính (đều kiểu String, Not Null): TenDangNhap (PK), MatKhau, QuyenHan, và MaNV (FK, Unique). Phương thức: DangNhap(), DangXuat().

NHANVIEN: Các thuộc tính (đều kiểu String, Not Null): MaNV (PK), HoTen, SoDienThoai, ViTri, và TrangThai. Phương thức: TraCuuThongTin(), XemThongTin(), ThemNhanVien(), SuaThongTin(), XoaNhanVien().

BAN: Các thuộc tính (đều kiểu String, Not Null): MaBan (PK), TenBan, TrangThai, và QRCode (Unique). Phương thức: TraCuu(), XemThongTin(), ThemBan(), SuaThongTinBan(), XoaBan(), CapNhatTrangThai().

MENU: Các thuộc tính (đều kiểu String): MaMenu (PK, Not Null), TenMenu (Not Null), và MoTa (Nullable). Phương thức: TraCuu(), Xem().

MON: Các thuộc tính (Not Null): Nhóm String gồm MaMon (PK), TenMon, TrangThai, MaMenu (FK); và DonGia (decimal, > 0). Riêng HinhAnh (String, Nullable). Phương thức: ThemMon(), SuaThongTinMon(), XoaMon(), CapNhatTrangThaiMon(), KiemTraTonKho() .

GIOHANG: Các thuộc tính (Not Null): MaGio (String, PK), ThoiGianTao (DateTime), và MaBan (String, FK, Unique). Phương thức: XemGioHang(), ThemMonVaoGio(), XoaMonKhoiGio(), TaoDonHang().

CHITIETGIOHANG: Các thuộc tính: Nhóm Not Null gồm MaGio, MaMon (đều String, PK/FK) và SoLuong (int, > 0). Riêng GhiChu (String, Nullable). Phương thức: ChinhSoLuongMon().

DONHANG: Các thuộc tính: Nhóm Not Null gồm MaDH (String, PK), TrangThaiOrder (String), MaBan (String, FK) và ThoiGianDat (DateTime). Nhóm Nullable (kiểu String, FK) gồm MaNV và MaHD. Phương thức: XemThongTinDonHang(), GuiDonHang(), SuaThongTinDonHang(), XoaDonHang(), CapNhatTrangThaiDonHang(), TruTonKhoTuDong() .

CHITIETDONHANG: Các thuộc tính: Nhóm Not Null gồm MaDH, MaMon (đều String, FK), SoLuong (int, > 0) và DonGia (decimal, > 0). Riêng GhiChu (String, Nullable). (Lớp chi tiết phụ thuộc toàn phần nên không có phương thức độc lập).

HOADON: Các thuộc tính (Not Null): MaHD (String, PK), MaNV (String, FK), ThoiGianXuat (DateTime), và TongTien (decimal, >= 0). Phương thức: TraCuuHoaDon(), XemHoaDon(), TaoHoaDon(), XoaHoaDon(), XuatHoaDon(), InHoaDon().

THANHTOAN: Các thuộc tính (Not Null): Nhóm String gồm MaThanhToan (PK), PhuongThuc (Enum), MaHD (FK, Unique), MaNV (FK); ThoiGianThanhToan (DateTime); và SoTien (decimal, > 0). Phương thức: XacNhanHoaDon(), ChonPhuongThucThanhToan(), XuLyThanhToan().\

NGUYENLIEU: Các thuộc tính (Not Null): Nhóm String gồm MaNL (PK), TenNL, DonViTinh; và nhóm decimal gồm SoLuongTon (>= 0), MucToiThieu (> 0). Phương thức: XemThongTin(), ThemNguyenLieu(), SuaNguyenLieu(), XoaNguyenLieu(), CapNhatTonKho(), KiemTraCanhBaoHet().

CONGTHUC: Các thuộc tính (Not Null): Nhóm String gồm MaMon (PK/FK), MaNL (PK/FK); và DinhLuong (decimal, > 0). Phương thức: ThemCongThuc(), SuaDinhLuong().

NCC: Các thuộc tính: Nhóm String, Not Null gồm MaNCC (PK), TenNCC, SoDienThoai. Riêng DiaChi (String, Nullable). Phương thức: TraCuuNCC(), ThemNCC(), SuaNCC().

PHIEUNHAP: Các thuộc tính (Not Null): Nhóm String gồm MaPN (PK), MaNV (FK), MaNCC (FK); NgayNhap (DateTime); và TongTienNhap (decimal, >= 0). Phương thức: TaoPhieuNhap(), XemPhieuNhap().

CHITIETPHIEUNHAP: Các thuộc tính (Not Null): Nhóm String gồm MaPN (PK/FK), MaNL (PK/FK); và nhóm decimal (> 0) gồm SoLuong, DonGiaNhap. (Lớp chi tiết phụ thuộc toàn phần nên không có phương thức độc lập).

PHIEUXUAT: Các thuộc tính (Not Null): Nhóm String gồm MaPX (PK), LyDo, MaNV (FK); và NgayXuat (DateTime). Phương thức: TaoPhieuXuat(), XemPhieuXuat().

CHITIETPHIEUXUAT: Các thuộc tính (Not Null): Nhóm String gồm MaPX (PK/FK), MaNL (PK/FK); và SoLuong (decimal, > 0). (Lớp chi tiết phụ thuộc toàn phần nên không có phương thức độc lập).

PHIEUKIEMKHO: Các thuộc tính (Not Null): Nhóm String gồm MaPKK (PK), TrangThai, MaNV (FK); và NgayKiem (DateTime). Phương thức: TaoBaoCaoKiemKho(), DoiChieuHeThong(), XuatBaoCaoChenhLech().

CHITIETKIEMKHO: Các thuộc tính: Nhóm Not Null gồm MaPKK, MaNL (đều String, PK/FK); nhóm decimal gồm SLThucTe (>= 0), SLLyThuyet (>= 0), ChenhLech. Riêng GhiChu (String, Nullable). (Lớp chi tiết phụ thuộc toàn phần nên không có phương thức độc lập).

### 4.1. Thiết kế Cơ sở dữ liệu

4.1.1 Sơ đồ thực thể mối quan hệ (ERD)

![]()

### Hệ thống bao gồm 20 thực thể, cụ thể như sau:

1. Phân hệ Nhân sự & Phân quyền

* NHANVIEN: Lưu trữ thông tin cá nhân và vai trò của nhân viên. PK: MaNV.
* TAIKHOAN: Dữ liệu đăng nhập và phân quyền hệ thống. PK: TenDangNhap. FK: MaNV.

2. Phân hệ Bán hàng & Order

* MENU: Danh mục phân loại các nhóm món. PK: MaMenu.
* MON: Danh sách sản phẩm kinh doanh chi tiết. PK: MaMon. FK: MaMenu.
* BAN: Định danh và trạng thái vị trí ngồi của khách. PK: MaBan.
* GIOHANG: Ghi nhận phiên gọi món tạm thời của khách qua mã QR. PK: MaGio. FK: MaBan.
* CHITIETGIOHANG: Chi tiết các món khách đang chọn tạm thời. PK tổ hợp: MaGio, MaMon. FK: MaGio, MaMon.
* DONHANG: Đơn hàng chính thức được ghi nhận để tiến hành pha chế/phục vụ. PK: MaDH. FK: MaBan, MaNV, MaHD.
* CHITIETDONHANG: Chi tiết danh sách món trong đơn hàng đang xử lý. PK tổ hợp: MaDH, MaMon. FK: MaDH, MaMon.

3. Phân hệ Thanh toán & Thu ngân

* HOADON: Chứng từ tổng hợp doanh thu cuối cùng của một hoặc nhiều đơn hàng. PK: MaHD. FK: MaNV.
* THANHTOAN: Ghi nhận dữ liệu đối soát giao dịch tài chính. PK: MaThanhToan. FK: MaHD, MaNV.

4. Phân hệ Quản lý Kho & Định mức (Mới)

* NGUYENLIEU: Lưu trữ danh mục, số lượng tồn kho và ngưỡng cảnh báo của vật tư. PK: MaNL.
* CONGTHUC: Bảng định mức tiêu hao nguyên liệu cho từng món (BOM). PK tổ hợp: MaMon, MaNL. FK: MaMon, MaNL.
* NCC: Quản lý thông tin nhà cung cấp hàng hóa. PK: MaNCC.
* PHIEUNHAP: Chứng từ ghi nhận luồng nhập hàng vào kho để cộng tồn. PK: MaPN. FK: MaNV, MaNCC.
* CHITIETPHIEUNHAP: Chi tiết số lượng và đơn giá vật tư trong một lần nhập. PK tổ hợp: MaPN, MaNL. FK: MaPN, MaNL.
* PHIEUXUAT: Chứng từ xuất kho (xuất ra quầy pha chế hoặc xuất hủy). PK: MaPX. FK: MaNV.
* CHITIETPHIEUXUAT: Chi tiết số lượng vật tư xuất khỏi kho. PK tổ hợp: MaPX, MaNL. FK: MaPX, MaNL.
* PHIEUKIEMKHO: Chứng từ chốt số lượng thực tế cuối tuần/tháng. PK: MaPKK. FK: MaNV.
* CHITIETKIEMKHO: Chi tiết ghi nhận độ lệch giữa số đếm thực tế và số liệu lý thuyết trên máy. PK tổ hợp: MaPKK, MaNL. FK: MaPKK, MaNL.

### 4.1.2. Ràng buộc Toàn vẹn (Integrity Constraints)

a) Miền giá trị (Domain Constraints) Quy định tập giá trị cho phép của các thuộc tính trạng thái và phân loại:

* BAN.TrangThai: "Trống", "Đang có khách".
* MON.TrangThai: "Còn món", "Hết món".
* DONHANG.TrangThaiOrder: "Chờ", "Đang làm", "Hoàn thành", "Đã giao".
* THANHTOAN.PhuongThuc (Enum): "TienMat", "CK", "Visa".
* PHIEUXUAT.LyDo: "Xuất quầy", "Xuất hủy".
* PHIEUKIEMKHO.TrangThai: "Khớp", "Lệch".
* Các trường số lượng, đơn giá, tổng tiền (SoLuong, DonGia, SoLuongTon,...): Bắt buộc >= 0.

b) Khóa chính tổ hợp (Composite Primary Keys) Các bảng chi tiết và trung gian sử dụng khóa chính tổ hợp để đảm bảo tính duy nhất của một hạng mục trên một chứng từ/món:

* CHITIETGIOHANG (MaGio, MaMon) & CHITIETDONHANG (MaDH, MaMon): Một món chỉ xuất hiện một dòng duy nhất trên cùng một giỏ hàng/đơn hàng (nếu khách gọi thêm, hệ thống chỉ cộng dồn thuộc tính SoLuong).
* CONGTHUC (MaMon, MaNL): Một nguyên liệu chỉ được cấu hình định lượng một lần trên một công thức món.
* CHITIETPHIEUNHAP (MaPN, MaNL), CHITIETPHIEUXUAT (MaPX, MaNL), CHITIETKIEMKHO (MaPKK, MaNL): Đảm bảo không nhập/xuất/kiểm trùng lặp một mã nguyên liệu trên cùng một mã phiếu.

c) Khóa ngoại (Foreign Keys) Mọi giá trị khóa ngoại (FK) xuất hiện trong bảng phụ thuộc phải tồn tại tương ứng ở dạng khóa chính (PK) trong bảng tham chiếu gốc.

d) Ràng buộc Bản số (Cardinality Constraints)Bảng tổng hợp các mối quan hệ thực thể trong hệ thống:

| Loại quan hệ                                | Các cặp thực thể / Lớp tham gia                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 - 1(Một - Một / Một - Không hoặc Một) | NHANVIEN1 - 1TAIKHOAN<br />BAN1 - 0..1GIOHANG<br />HOADON1 - 0..1THANHTOAN                                                                                                                                                                                                                                                                                                                                                                                                     |
| 1 - N(Một - Nhiều)                          | NHANVIEN1 - NHOADON<br />NHANVIEN1 - NDONHANG<br />NHANVIEN1 - NTHANHTOAN<br />NHANVIEN1 - NPHIEUNHAP<br />NHANVIEN1 - NPHIEUXUAT<br />NHANVIEN1 - NPHIEUKIEM<br />KHOBAN1 - NDONHANG<br />HOADON1 - NDONHANG<br />MENU1 - NMON<br />MON1 - NCHITIETGIOHANG<br />MON1 - NCHITIETDONHANG<br />MON1 - NCONGTHUC<br />NGUYENLIEU1 - NCONGTHUC<br />NGUYENLIEU1 - NCHITIETPHIEU<br />NHAPNGUYENLIEU1 - NCHITIETPHIEUXUAT<br />NGUYENLIEU1 - NCHITIETKIEMKHO<br />NCC1 - NPHIEUNHAP |
| Composition                                   | CHITIETDONHANG phụ thuộc DONHANG<br />CHITIETGIOHANG phụ thuộc GIOHANGCHITIET<br />PHIEUNHAP phụ thuộc PHIEUNHAP<br />CHITIETPHIEUXUAT phụ thuộc PHIEUXUAT<br />CHITIETKIEMKHO phụ thuộc PHIEUKIEMKHO                                                                                                                                                                                                                                                                |

**
