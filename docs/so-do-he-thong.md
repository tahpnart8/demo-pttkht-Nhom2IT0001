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
    KH->>FE: 1. scanQR()
    FE->>API: 2. getMenuData()
    API->>MENU: 3. getAllCategories()
    MENU-->>API: 4. categoryList
    API->>MON: 5. getItemsByCategory()
    MON-->>API: 6. itemList
    API-->>FE: 7. menuData
    FE-->>KH: 8. displayMenu()

    Note over KH,BAN: 2. Khach hang them mon vao gio hang
    KH->>FE: 9. addToCart(itemId, quantity)
    FE->>API: 10. addItemToCart(tableId, itemId, quantity)
    API->>GH: 11. checkCartExists(tableId)
    alt Gio hang chua ton tai
        API->>GH: 12a. createCart(tableId)
        GH-->>API: 13a. cartId
    end
    API->>CTGH: 14. addCartItem(cartId, itemId, quantity)
    CTGH-->>API: 15. success
    API-->>FE: 16. confirmItemAdded()
    FE-->>KH: 17. updateCartIcon()

    Note over KH,BAN: 3. Khach hang gui don hang
    KH->>FE: 18. submitOrder()
    FE->>API: 19. createOrder(tableId)
    API->>GH: 20. getCartByTable(tableId)
    API->>CTGH: 21. getCartItems(cartId)
    CTGH-->>API: 22. cartItemList
    API->>MON: 23. getItemPrices(itemIds)
    MON-->>API: 24. priceList
    API->>DH: 25. createOrderRecord(tableId, "Cho")
    DH-->>API: 26. orderId
    API->>CTDH: 27. createOrderDetails(orderId, cartItemList)
    CTDH-->>API: 28. success
    API->>BAN: 29. updateTableStatus(tableId, "DangCoKhach")
    BAN-->>API: 30. success
    API->>CTGH: 31. clearCartItems(cartId)
    API->>GH: 32. deleteCart(cartId)
    GH-->>API: 33. success
    API-->>FE: 34. orderSuccess(orderId)
    FE-->>KH: 35. displayOrderTracking()
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
    BA->>FE: 1. login(username, password)
    FE->>API: 2. authenticateUser(username, password)
    API->>TK: 3. getAccountByUsername(username)
    TK-->>API: 4. accountInfo (role = barista)
    API->>NV: 5. getEmployeeInfo(employeeId)
    NV-->>API: 6. employeeInfo
    API-->>FE: 7. authSuccess(token, userInfo)
    FE-->>BA: 8. displayOrderManagement()

    Note over BA,KH: 2. Barista xem danh sach don cho xu ly
    FE->>MW: 9. getPendingOrders(token)
    MW->>MW: 10. verifyToken(token)
    MW->>API: 11. authorize()
    API->>DH: 12. getOrdersByStatus("Cho")
    DH-->>API: 13. pendingOrderList
    API-->>FE: 14. orderList
    FE-->>BA: 15. displayPendingOrders()

    Note over BA,KH: 3. Barista bat dau pha che
    BA->>FE: 16. startOrder(orderId)
    FE->>MW: 17. updateOrderStatus(orderId, "DangLam")
    MW->>MW: 18. verifyTokenAndRole()
    MW->>API: 19. authorize()
    API->>DH: 20. getOrderStatus(orderId)
    DH-->>API: 21. currentStatus ("Cho")
    API->>API: 22. validateStatusTransition()
    API->>DH: 23. updateStatus(orderId, "DangLam")
    DH-->>API: 24. success
    API-->>FE: 25. statusUpdated
    FE-->>BA: 26. moveOrderToProcessingTab()

    Note over BA,KH: 4. Barista hoan thanh pha che
    BA->>FE: 27. completeOrder(orderId)
    FE->>MW: 28. updateOrderStatus(orderId, "HoanThanh")
    MW->>API: 29. authorize()
    API->>DH: 30. updateStatus(orderId, "HoanThanh")
    DH-->>API: 31. success
    API-->>FE: 32. statusUpdated
    FE-->>BA: 33. moveOrderToCompletedTab()

    Note over BA,KH: 5. Phuc vu giao mon cho khach
    PV->>FE: 34. login(username, password)
    FE->>MW: 35. getCompletedOrders(token)
    MW->>API: 36. authorize()
    API->>DH: 37. getOrdersByStatus("HoanThanh")
    DH-->>API: 38. completedOrderList
    API-->>FE: 39. orderList
    FE-->>PV: 40. displayCompletedOrders()
    PV->>FE: 41. markAsDelivered(orderId)
    FE->>MW: 42. updateOrderStatus(orderId, "DaGiao")
    MW->>API: 43. authorize()
    API->>API: 44. validateStatusTransition()
    API->>DH: 45. updateStatus(orderId, "DaGiao")
    DH-->>API: 46. success
    API-->>FE: 47. statusUpdated
    FE-->>PV: 48. moveOrderToDeliveredTab()

    Note over BA,KH: 6. Khach hang nhan trang thai da giao
    KH->>FE: 49. pollOrderStatus(tableId)
    FE->>API: 50. getLatestOrderStatus(tableId)
    API->>DH: 51. getOrderStatus(orderId)
    DH-->>API: 52. currentStatus ("DaGiao")
    API-->>FE: 53. statusData
    FE-->>KH: 54. displayOrderStatus("DaGiao")
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
    TN->>FE: login(username, password)
    FE->>API: authenticateUser(username, password)
    API->>DB: getAccountInfo(username)
    API->>API: generateToken(role)
    API-->>FE: authSuccess(token, userInfo)
    FE-->>TN: redirect(/cashier/payment)

    Note over TN,DB: BUOC 2 - CHON BAN VA DON HANG
    FE->>API: getAllTables()
    API->>DB: fetchTables()
    API-->>FE: tableList
    FE->>FE: filterTables("DangCoKhach")
    FE-->>TN: displayActiveTables()
    TN->>FE: selectTable(tableId)
    FE->>API: getOrdersByTable(tableId)
    API->>DB: fetchOrdersAndDetails(tableId)
    API-->>FE: orderList
    FE->>FE: filterUnpaidOrders()
    FE-->>TN: displayUnpaidOrders()

    Note over TN,DB: BUOC 3 - TAO HOA DON VA THANH TOAN
    TN->>FE: selectOrdersForPayment(orderIds)
    TN->>FE: confirmPayment(method)
    FE->>API: createInvoice(orderIds, employeeId)
    API->>DB: getOrderDetails(orderIds)
    API->>API: calculateTotalAmount()
    API->>DB: createInvoiceRecord(totalAmount, employeeId)
    API->>DB: updateOrdersWithInvoice(invoiceId)
    API-->>FE: invoiceCreated(invoiceId, totalAmount)

    Note over TN,DB: BUOC 4 - XAC NHAN THANH TOAN VA GIAI PHONG BAN
    FE->>API: processPayment(invoiceId, amount, method)
    API->>DB: createPaymentRecord(invoiceId, method)
    API->>DB: getTableByInvoice(invoiceId)
    API->>DB: checkUnpaidOrders(tableId)
    alt Khong con don chua thanh toan
        API->>DB: updateTableStatus(tableId, "Trong")
    end
    API-->>FE: paymentSuccess()
    FE-->>TN: showSuccessMessage()
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
    QL->>FE: login(username, password)
    FE->>API: authenticateUser(username, password)
    API->>DB: getAccountInfo(username)
    API->>API: generateToken(role)
    API-->>FE: authSuccess(token, userInfo)
    FE-->>QL: redirect(/manager/menu)
    QL->>FE: navigateToStaffManagement()

    Note over QL,DB: BUOC 2 - TAI DANH SACH NHAN VIEN
    FE->>MW: getStaffList(token)
    MW->>MW: verifyTokenAndRole()
    MW->>API: authorize()
    API->>DB: fetchAllStaff()
    DB-->>API: staffList
    API-->>FE: staffData
    FE-->>QL: displayStaffTable()

    Note over QL,DB: BUOC 3 - NHAP THONG TIN MOI
    QL->>FE: clickAddStaff()
    FE->>FE: openAddStaffModal()
    QL->>FE: inputStaffDetails(data)
    QL->>FE: submitNewStaff()

    Note over QL,DB: BUOC 4 - LUU VAO DATABASE
    FE->>MW: addStaff(data, token)
    MW->>MW: verifyTokenAndRole()
    MW->>API: authorize()
    API->>DB: createStaffRecord(data)
    DB-->>API: success
    alt Co ten dang nhap
        API->>DB: createAccountRecord(accountData)
        DB-->>API: success
    end
    API-->>FE: addStaffSuccess(staffId)
    FE-->>QL: showSuccessMessage()
    FE->>FE: closeModalAndRefresh()
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
