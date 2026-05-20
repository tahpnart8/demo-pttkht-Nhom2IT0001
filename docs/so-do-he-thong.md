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

### 3.4. Phân rã tiến trình 4.0 — Quản trị Hệ thống

```mermaid
graph TB
    QL["fa:fa-user-tie Quản lý"]

    D1[("D1 MENU / MON")]
    D5[("D5 NHANVIEN / TAIKHOAN")]
    D6[("D6 BAN")]

    P41(("4.1\nQuản lý\nMenu & Món"))
    P42(("4.2\nQuản lý\nBàn"))
    P43(("4.3\nQuản lý\nNhân viên"))

    QL -->|"Thêm/sửa/xóa món, đổi trạng thái"| P41
    P41 -->|"DS menu và món"| QL
    P41 <-->|"INSERT/UPDATE/DELETE MON"| D1

    QL -->|"Thêm/sửa/xóa bàn"| P42
    P42 -->|"DS bàn và trạng thái"| QL
    P42 <-->|"INSERT/UPDATE/DELETE BAN"| D6

    QL -->|"Thêm/sửa/xóa NV + tài khoản"| P43
    P43 -->|"DS nhân viên"| QL
    P43 <-->|"INSERT/UPDATE/DELETE NHANVIEN"| D5
    P43 <-->|"INSERT/UPDATE/DELETE TAIKHOAN"| D5
```

### 3.5. Phân rã tiến trình 5.0 — Xác thực & Phân quyền

```mermaid
graph TB
    NV["fa:fa-users Nhân viên / Quản lý"]

    D5[("D5 NHANVIEN / TAIKHOAN")]

    P51(("5.1\nĐăng nhập"))
    P52(("5.2\nTạo\nJWT Token"))
    P53(("5.3\nXác thực\nToken"))
    P54(("5.4\nKiểm tra\nPhân quyền"))

    NV -->|"TenDangNhap + MatKhau"| P51
    P51 <-->|"SELECT TAIKHOAN WHERE TenDangNhap"| D5
    P51 -->|"Xác thực thành công"| P52
    P52 -->|"JWT.sign (username, role, maNV)"| P52
    P52 -->|"Token JWT hết hạn 24h"| NV

    NV -->|"Request kèm Bearer Token"| P53
    P53 -->|"JWT.verify(token) OK"| P54
    P53 -->|"Token không hợp lệ: 401"| NV
    P54 -->|"Kiểm tra role vs route"| P54
    P54 -->|"Cho phép truy cập"| NV
```

## 4. Sequence Diagram — Luồng Gọi Món

> **Kịch bản:** Khách hàng quét mã QR trên bàn, xem menu, thêm món vào giỏ hàng và gửi đơn hàng.

```mermaid
sequenceDiagram
    participant KH as Khách hàng
    participant UI as Giao diện UI
    participant MC as MenuController
    participant CC as CartController
    participant OC as OrderController
    participant TC as TableController
    participant DB as Database

    Note over KH,DB: 1. Khách hàng quét QR và xem menu
    KH->>UI: 1. scanQR()
    UI->>MC: 2. getMenuData()
    MC->>DB: 3. getAllCategories()
    DB-->>MC: 4. categoryList
    MC->>DB: 5. getItemsByCategory()
    DB-->>MC: 6. itemList
    MC-->>UI: 7. menuData
    UI-->>KH: 8. displayMenu()

    Note over KH,DB: 2. Khách hàng thêm món vào giỏ hàng
    KH->>UI: 9. addToCart(itemId, quantity)
    UI->>CC: 10. processAddToCart(tableId, itemId, quantity)
    CC->>DB: 11. checkCartExists(tableId)
    alt Giỏ hàng chưa tồn tại
        CC->>DB: 12. createCart(tableId)
        DB-->>CC: 13. cartId
    end
    CC->>DB: 14. addCartItem(cartId, itemId, quantity)
    DB-->>CC: 15. success
    CC-->>UI: 16. confirmItemAdded()
    UI-->>KH: 17. updateCartIcon()

    Note over KH,DB: 3. Khách hàng gửi đơn hàng
    KH->>UI: 18. submitOrder()
    UI->>OC: 19. createOrder(tableId)
    OC->>CC: 20. getCartDetails(tableId)
    CC->>DB: 21. fetchCartItems(tableId)
    DB-->>CC: 22. dbCartItems
    CC-->>OC: 23. cartItemList
    OC->>MC: 24. getItemPrices(itemIds)
    MC->>DB: 25. fetchPrices(itemIds)
    DB-->>MC: 26. dbPrices
    MC-->>OC: 27. priceList
    OC->>DB: 28. createOrderRecord(tableId, "Cho", cartItemList)
    DB-->>OC: 29. orderId
    OC->>CC: 30. clearCart(tableId)
    CC->>DB: 31. deleteCart(tableId)
    DB-->>CC: 32. success
    CC-->>OC: 33. cartCleared
    
    par Trả kết quả cho khách hàng
        OC-->>UI: 34a. orderSuccess(orderId)
        UI-->>KH: 35a. displayOrderTracking()
    and Cập nhật trạng thái bàn
        OC->>TC: 34b. updateTableStatus(tableId, "DangCoKhach")
        TC->>DB: 35b. saveTableStatus(tableId, "DangCoKhach")
        DB-->>TC: 36b. success
    end
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
    participant PV as Phục vụ
    participant KH as Khách hàng
    participant UI as Giao diện UI
    participant AC as AuthController
    participant OC as OrderController
    participant DB as Database

    Note over BA,DB: 1. Barista đăng nhập hệ thống
    BA->>UI: 1. login(username, password)
    UI->>AC: 2. authenticateUser(username, password)
    AC->>DB: 3. getAccountInfo(username)
    DB-->>AC: 4. accountInfo (role = barista)
    AC-->>UI: 5. authSuccess(token)
    UI-->>BA: 6. displayOrderManagement()

    Note over BA,DB: 2. Barista xem danh sách đơn chờ xử lý
    UI->>OC: 7. getPendingOrders(token)
    OC->>OC: 8. verifyTokenAndRole()
    OC->>DB: 9. getOrdersByStatus("Cho")
    DB-->>OC: 10. pendingOrderList
    OC-->>UI: 11. orderList
    UI-->>BA: 12. displayPendingOrders()

    Note over BA,DB: 3. Barista bắt đầu pha chế
    BA->>UI: 13. startOrder(orderId)
    UI->>OC: 14. updateOrderStatus(orderId, "DangLam")
    OC->>DB: 15. getOrderStatus(orderId)
    DB-->>OC: 16. currentStatus ("Cho")
    OC->>OC: 17. validateStatusTransition()
    OC->>DB: 18. updateStatus(orderId, "DangLam")
    DB-->>OC: 19. success
    OC-->>UI: 20. statusUpdated
    UI-->>BA: 21. moveOrderToProcessingTab()

    Note over BA,DB: 4. Barista hoàn thành pha chế
    BA->>UI: 22. completeOrder(orderId)
    UI->>OC: 23. updateOrderStatus(orderId, "HoanThanh")
    OC->>DB: 24. updateStatus(orderId, "HoanThanh")
    DB-->>OC: 25. success
    OC-->>UI: 26. statusUpdated
    UI-->>BA: 27. moveOrderToCompletedTab()

    Note over PV,DB: 5. Phục vụ giao món cho khách
    PV->>UI: 28. login(username, password)
    UI->>AC: 29. authenticateUser(username, password)
    AC-->>UI: 30. authSuccess(token)
    UI->>OC: 31. getCompletedOrders(token)
    OC->>DB: 32. getOrdersByStatus("HoanThanh")
    DB-->>OC: 33. completedOrderList
    OC-->>UI: 34. orderList
    UI-->>PV: 35. displayCompletedOrders()
    PV->>UI: 36. markAsDelivered(orderId)
    UI->>OC: 37. updateOrderStatus(orderId, "DaGiao")
    OC->>DB: 38. updateStatus(orderId, "DaGiao")
    DB-->>OC: 39. success
    OC-->>UI: 40. statusUpdated
    UI-->>PV: 41. moveOrderToDeliveredTab()

    Note over KH,DB: 6. Khách hàng nhận trạng thái đã giao
    KH->>UI: 42. pollOrderStatus(tableId)
    UI->>OC: 43. getLatestOrderStatus(tableId)
    OC->>DB: 44. getOrderStatus(orderId)
    DB-->>OC: 45. currentStatus ("DaGiao")
    OC-->>UI: 46. statusData
    UI-->>KH: 47. displayOrderStatus("DaGiao")
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
    participant TN as Thu ngân
    participant UI as Giao diện UI
    participant AC as AuthController
    participant TC as TableController
    participant OC as OrderController
    participant PC as PaymentController
    participant DB as Database

    Note over TN,DB: BƯỚC 1 - ĐĂNG NHẬP
    TN->>UI: 1. login(username, password)
    UI->>AC: 2. authenticateUser(username, password)
    AC->>DB: 3. getAccountInfo(username)
    DB-->>AC: 4. accountInfo
    AC-->>UI: 5. authSuccess(token)
    UI-->>TN: 6. redirect(/cashier/payment)

    Note over TN,DB: BƯỚC 2 - CHỌN BÀN VÀ ĐƠN HÀNG
    UI->>TC: 7. getActiveTables()
    TC->>DB: 8. fetchTablesByStatus("DangCoKhach")
    DB-->>TC: 9. tableList
    TC-->>UI: 10. tableData
    UI-->>TN: 11. displayActiveTables()
    TN->>UI: 12. selectTable(tableId)
    UI->>OC: 13. getUnpaidOrders(tableId)
    OC->>DB: 14. fetchOrdersAndDetails(tableId)
    DB-->>OC: 15. dbOrderList
    OC-->>UI: 16. unpaidOrdersData
    UI-->>TN: 17. displayUnpaidOrders()

    Note over TN,DB: BƯỚC 3 - TẠO HÓA ĐƠN
    TN->>UI: 18. selectOrdersForPayment(orderIds)
    TN->>UI: 19. confirmPayment(method)
    UI->>PC: 20. createInvoice(orderIds, employeeId)
    PC->>OC: 21. getOrderDetails(orderIds)
    OC->>DB: 22. fetchOrderDetails(orderIds)
    DB-->>OC: 23. dbOrderItems
    OC-->>PC: 24. orderItems
    PC->>PC: 25. calculateTotalAmount()
    PC->>DB: 26. createInvoiceRecord(totalAmount, employeeId)
    DB-->>PC: 27. invoiceId
    PC->>OC: 28. markOrdersAsPaid(orderIds, invoiceId)
    OC->>DB: 29. updateOrdersWithInvoice(invoiceId)
    DB-->>OC: 30. success
    OC-->>PC: 31. ordersUpdated
    PC-->>UI: 32. invoiceCreated(invoiceId, totalAmount)

    Note over TN,DB: BƯỚC 4 - XÁC NHẬN THANH TOÁN & GIẢI PHÓNG BÀN
    UI->>PC: 33. processPayment(invoiceId, amount, method)
    PC->>DB: 34. createPaymentRecord(invoiceId, method)
    DB-->>PC: 35. success
    PC->>OC: 36. checkRemainingUnpaidOrders(tableId)
    OC->>DB: 37. countUnpaidOrders(tableId)
    DB-->>OC: 38. count = 0
    OC-->>PC: 39. allPaid
    alt Không còn đơn chưa thanh toán
        PC->>TC: 40. releaseTable(tableId)
        TC->>DB: 41. updateTableStatus(tableId, "Trong")
        DB-->>TC: 42. success
        TC-->>PC: 43. tableReleased
    end
    PC-->>UI: 44. paymentSuccess()
    UI-->>TN: 45. showSuccessMessage()
```

---

## 6. Sequence Diagram — Luồng Thêm Nhân Viên

```mermaid
sequenceDiagram
    participant QL as Quản lý
    participant UI as Giao diện UI
    participant AC as AuthController
    participant SC as StaffController
    participant DB as Database

    Note over QL,DB: BƯỚC 1 - XÁC THỰC QUYỀN QUẢN LÝ
    QL->>UI: 1. login(username, password)
    UI->>AC: 2. authenticateUser(username, password)
    AC->>DB: 3. getAccountInfo(username)
    DB-->>AC: 4. accountInfo (role = admin)
    AC-->>UI: 5. authSuccess(token)
    UI-->>QL: 6. redirect(/manager/staff)

    Note over QL,DB: BƯỚC 2 - TẢI DANH SÁCH NHÂN VIÊN
    UI->>SC: 7. getAllStaff(token)
    SC->>SC: 8. verifyTokenAndRole()
    SC->>DB: 9. fetchAllStaffRecords()
    DB-->>SC: 10. staffList
    SC-->>UI: 11. staffData
    UI-->>QL: 12. displayStaffTable()

    Note over QL,DB: BƯỚC 3 - NHẬP THÔNG TIN MỚI
    QL->>UI: 13. clickAddStaff()
    UI->>UI: 14. openAddStaffModal()
    QL->>UI: 15. inputStaffDetails(data)
    QL->>UI: 16. submitNewStaff()

    Note over QL,DB: BƯỚC 4 - LƯU VÀO DATABASE
    UI->>SC: 17. addStaff(data, token)
    SC->>SC: 18. verifyTokenAndRole()
    SC->>DB: 19. createStaffRecord(data)
    DB-->>SC: 20. success
    alt Có tên đăng nhập
        SC->>DB: 21. createAccountRecord(accountData)
        DB-->>SC: 22. success
    end
    SC-->>UI: 23. addStaffSuccess(staffId)
    UI-->>QL: 24. showSuccessMessage()
    UI->>UI: 25. closeModalAndRefresh()
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
