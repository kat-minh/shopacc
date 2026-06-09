# Tài Liệu Đặc Tả API Hệ Thống - Hainagaming.com

Tài liệu này đặc tả tất cả các API cần thiết để vận hành hệ thống shop bán nick và nạp tiền tự động, thay thế cho toàn bộ dữ liệu demo (`localStorage` / Mock Data) hiện tại trên frontend.

---

## 1. Authentication & Membership (Xác thực & Thành viên)

### 1.1 Đăng ký tài khoản
* **Endpoint**: `POST /api/auth/register`
* **Mô tả**: Tạo tài khoản người dùng mới.
* **Request Body**:
```json
{
  "username": "hoang_gamer99",
  "password": "secretpassword"
}
```
* **Response (Success - 201)**:
```json
{
  "message": "Đăng ký tài khoản thành công!",
  "user": {
    "username": "hoang_gamer99",
    "balance": 0,
    "isAdmin": false
  }
}
```

### 1.2 Đăng nhập tài khoản
* **Endpoint**: `POST /api/auth/login`
* **Mô tả**: Đăng nhập hệ thống và trả về JWT token cùng thông tin người dùng.
* **Request Body**:
```json
{
  "username": "hoang_gamer99",
  "password": "secretpassword"
}
```
* **Response (Success - 200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "hoang_gamer99",
    "balance": 500000,
    "isAdmin": false
  }
}
```

### 1.3 Lấy thông tin tài khoản hiện tại
* **Endpoint**: `GET /api/auth/me`
* **Headers**: `Authorization: Bearer <token>`
* **Mô tả**: Lấy thông tin cá nhân và số dư khả dụng mới nhất của user.
* **Response (Success - 200)**:
```json
{
  "username": "hoang_gamer99",
  "balance": 500000,
  "isAdmin": false
}
```

### 1.4 Thay đổi mật khẩu
* **Endpoint**: `POST /api/auth/change-password`
* **Headers**: `Authorization: Bearer <token>`
* **Mô tả**: Đổi mật khẩu tài khoản hiện tại.
* **Request Body**:
```json
{
  "currentPassword": "secretpassword",
  "newPassword": "newsecretpassword"
}
```
* **Response (Success - 200)**:
```json
{
  "message": "Đổi mật khẩu thành công!"
}
```

---

## 2. Product Catalog (Quản lý Nick Game)

### 2.1 Lấy danh sách Nick đang bán
* **Endpoint**: `GET /api/accounts`
* **Query Parameters**:
  - `category` (Optional): Bộ lọc theo danh mục (e.g. `DANH MỤC ACC SIÊU VIP`).
  - `search` (Optional): Từ khóa tìm kiếm (Mã số nick, nhân vật, tiêu đề).
* **Mô tả**: Trả về danh sách tài khoản game ở trạng thái `"Available"` (Chưa bán).
* **Response (Success - 200)**:
```json
[
  {
    "id": "DBL-001",
    "game": "Dragon Ball Legends",
    "category": "DANH MỤC ACC SIÊU VIP",
    "title": "ACC SIÊU VIP 50K CRYSTALS + UL VEGITO BLUE RED 3",
    "price": 150000,
    "originalPrice": 300000,
    "imageUrl": "https://...",
    "avatarUrl": "https://...",
    "stats": {
      "chronoCrystals": 50000,
      "vipCharacters": ["UL Vegito Blue", "LL Super Goku"],
      "starsCount": 14,
      "server": "Global (Android & iOS)"
    },
    "details": [
      "Acc sạch 100%, bảo hành 30 ngày",
      "Đầy đủ email liên kết gốc"
    ],
    "status": "Available"
  }
]
```

### 2.2 Xem chi tiết tài khoản
* **Endpoint**: `GET /api/accounts/{id}`
* **Mô tả**: Lấy thông tin chi tiết của một tài khoản game cụ thể (Không bao gồm mật khẩu đăng nhập).
* **Response (Success - 200)**:
```json
{
  "id": "DBL-001",
  "game": "Dragon Ball Legends",
  "category": "DANH MỤC ACC SIÊU VIP",
  "title": "ACC SIÊU VIP 50K CRYSTALS + UL VEGITO BLUE RED 3",
  "price": 150000,
  "originalPrice": 300000,
  "imageUrl": "https://...",
  "avatarUrl": "https://...",
  "stats": {
    "chronoCrystals": 50000,
    "vipCharacters": ["UL Vegito Blue", "LL Super Goku"],
    "starsCount": 14,
    "server": "Global (Android & iOS)"
  },
  "details": [
    "Acc sạch 100%, bảo hành 30 ngày"
  ],
  "status": "Available"
}
```

### 2.3 Mua tài khoản game
* **Endpoint**: `POST /api/accounts/{id}/buy`
* **Headers**: `Authorization: Bearer <token>`
* **Mô tả**: Tiến hành trừ tiền trong số dư tài khoản của user, đổi trạng thái nick sang `"Sold"`, lưu biên lai và trả về tài khoản đăng nhập + mật khẩu mật.
* **Response (Success - 200)**:
```json
{
  "message": "Thanh toán mua nick thành công!",
  "account": {
    "id": "DBL-001",
    "title": "ACC SIÊU VIP 50K CRYSTALS + UL VEGITO BLUE RED 3",
    "price": 150000,
    "credentials": {
      "username": "dragonball_login_gmail@gmail.com",
      "pass": "dblegendssecret123",
      "transferCode": "TC-XYZ123ABC456"
    }
  }
}
```

---

## 3. Top-Up & Recharge (Hệ thống Nạp tiền)

### 3.1 Nạp thẻ cào tự động
* **Endpoint**: `POST /api/recharge/card`
* **Headers**: `Authorization: Bearer <token>`
* **Mô tả**: Gửi thông tin thẻ cào lên hệ thống để tích hợp với API gạch thẻ trung gian (như doithe1s, trumthe,...).
* **Request Body**:
```json
{
  "provider": "VIETTEL",
  "amount": 50000,
  "serial": "1000847391029",
  "pin": "4810294729103"
}
```
* **Response (Success - 200)**:
```json
{
  "message": "Thẻ cào đã được gửi lên hệ thống và đang chờ xử lý tự động!",
  "status": "Processing"
}
```

### 3.2 Nạp tiền qua ATM / MoMo
* **Endpoint**: `GET /api/recharge/atm-momo`
* **Mô tả**: Trả về thông tin số tài khoản ngân hàng và Momo của shop để người dùng chuyển khoản và quét QR.
* **Response (Success - 200)**:
```json
{
  "bankInfo": {
    "bankName": "ACB",
    "accountNumber": "17506391",
    "accountOwner": "DOAN KHAC Y",
    "qrCodeUrl": "https://api.vietqr.io/image/acb-17506391-compact2.jpg"
  },
  "momoInfo": {
    "phoneNumber": "0383186256",
    "accountOwner": "DOAN KHAC Y",
    "qrCodeUrl": "https://..."
  }
}

### 3.3 Lấy danh sách Top Nạp Thẻ / Quỹ
* **Endpoint**: `GET /api/recharge/top`
* **Query Parameters**:
  - `month` (Optional): Bộ lọc theo tháng (e.g. `june`, `may`). Mặc định trả về tháng hiện tại.
* **Mô tả**: Trả về danh sách TOP các tài khoản có tổng tiền nạp cao nhất trong tháng để hiển thị vinh danh xếp hạng trên trang chủ.
* **Response (Success - 200)**:
```json
[
  {
    "username": "hoang_gamer99",
    "amount": 5000000
  },
  {
    "username": "katsumila_99",
    "amount": 2500000
  }
]
```

---

## 4. User Profile & Settings (Lịch sử giao dịch & Kho đồ)

### 4.1 Lấy danh sách nick game đã mua (Kho đồ)
* **Endpoint**: `GET /api/user/bought-accounts`
* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters**:
  - `search` (Optional): Lọc theo tiêu đề sản phẩm (không phân biệt hoa thường).
  - `page` (Default: 1), `limit` (Default: 5)
* **Mô tả**: Trả về danh sách các tài khoản mà user hiện tại đã mua thành công kèm tài khoản mật khẩu.
* **Response (Success - 200)**:
```json
{
  "data": [
    {
      "itemId": "8f3a...-guid",
      "accountId": "DBL-001",
      "title": "ACC SIÊU VIP 50K CRYSTALS",
      "game": "Dragon Ball Legends",
      "avatarUrl": "https://...",
      "credentials": {
        "username": "dragonball_login_gmail@gmail.com",
        "pass": "dblegendssecret123",
        "transferCode": "TC-XYZ123ABC456"
      },
      "soldAt": "2026-06-04T07:45:00+00:00"
    }
  ],
  "totalItems": 1,
  "totalPages": 1,
  "currentPage": 1
}
```

### 4.2 Lấy lịch sử giao dịch cá nhân
* **Endpoint**: `GET /api/user/transactions`
* **Headers**: `Authorization: Bearer <token>`
* **Query Parameters**:
  - `type` (Optional): Bộ lọc loại giao dịch (`all`, `recharge` [nạp card/atm], `purchase` [mua nick], `wheel` [quay gacha])
  - `page` (Default: 1), `limit` (Default: 5)
* **Mô tả**: Xem lịch sử biến động số dư tài khoản của người dùng.
* **Response (Success - 200)**:
```json
{
  "data": [
    {
      "id": "BUY-DBL-001-9238",
      "type": "buy_account",
      "amount": 150000,
      "description": "Mua Tài Khoản mã số DBL-001...",
      "status": "Success",
      "time": "14:45:00 04/06/2026"
    }
  ],
  "totalItems": 1,
  "totalPages": 1,
  "currentPage": 1
}
```

---

## 5. Leaderboard (Đua top nạp tiền — Public)

### 5.1 Top người nạp tiền theo tháng
* **Endpoint**: `GET /api/leaderboard/recharge`
* **Headers**: Không yêu cầu đăng nhập (hiển thị công khai ở trang chủ).
* **Query Parameters**:
  - `period` (Optional): `current` (mặc định — tháng hiện tại) | `previous` (tháng trước). Mốc tháng tính theo giờ Việt Nam (UTC+7).
  - `limit` (Default: 5, tối đa 100)
* **Mô tả**: Tổng tiền nạp **thành công** (thẻ cào + ATM/MoMo) theo từng người dùng trong tháng, xếp giảm dần.
* **Response (Success - 200)**:
```json
{
  "year": 2026,
  "month": 6,
  "items": [
    { "rank": 1, "username": "hoang_legends", "amount": 418000 },
    { "rank": 2, "username": "Kien_Rerol", "amount": 374000 }
  ]
}
```

---

## 6. Admin Panel Dashboard (Hệ thống Quản trị - Quyền Admin)

> **Lưu ý**: Tất cả các API trong mục này yêu cầu Headers `Authorization: Bearer <token>` và tài khoản phải có quyền `isAdmin: true` kiểm tra trên backend.

### 6.1 Đăng bán tài khoản game mới
* **Endpoint**: `POST /api/admin/accounts`
* **Request Body**:
```json
{
  "id": "DBL-999",
  "category": "DANH MỤC ACC SIÊU VIP",
  "title": "ACC DRAGON BALL LEGENDS MỚI LÊN SÀN",
  "price": 90000,
  "originalPrice": 185000,
  "stats": {
    "chronoCrystals": 25000,
    "vipCharacters": ["UL Vegito Blue", "LL Super Goku"],
    "starsCount": 8,
    "server": "Global (Android & iOS)"
  },
  "details": ["Giao dịch tự động siêu tốc", "Cam kết sạch sẽ"],
  "credentials": {
    "username": "admin_uploaded_gmail@gmail.com",
    "pass": "secretadminpass123",
    "transferCode": "TC-ADMIN999"
  }
}
```
* **Response (Success - 201)**:
```json
{
  "message": "Đăng bán nick thành công!",
  "account": { ... }
}
```

### 6.2 Chỉnh sửa thông tin Nick đang có
* **Endpoint**: `PUT /api/admin/accounts/{id}`
* **Request Body**:
```json
{
  "category": "DANH MỤC ACC SIÊU VIP",
  "title": "TIÊU ĐỀ ĐÃ ĐƯỢC CHỈNH SỬA",
  "price": 85000,
  "originalPrice": 180000,
  "stats": {
    "chronoCrystals": 25000,
    "vipCharacters": ["UL Vegito Blue"],
    "starsCount": 9,
    "server": "Global (Android & iOS)"
  },
  "details": ["Giao dịch tự động"],
  "status": "Available",
  "credentials": {
    "username": "admin_uploaded_gmail@gmail.com",
    "pass": "changedpass12345",
    "transferCode": "TC-ADMIN999"
  }
}
```
* **Response (Success - 200)**:
```json
{
  "message": "Cập nhật tài khoản thành công!",
  "account": { ... }
}
```

### 6.3 Xóa tài khoản game
* **Endpoint**: `DELETE /api/admin/accounts/{id}`
* **Response (Success - 200)**:
```json
{
  "message": "Đã xóa tài khoản khỏi cửa hàng thành công!"
}
```

### 6.3b Lấy danh sách sản phẩm cho trang quản trị (phân trang)
* **Endpoint**: `GET /api/admin/accounts`
* **Headers**: `Authorization: Bearer <token>` (Role Admin)
* **Query Parameters**:
  - `search` (Optional): Tìm theo Mã nick / Tiêu đề / Game.
  - `category` (Optional): Lọc theo tên danh mục.
  - `status` (Optional): `Available` (còn hàng) | `Sold` (hết hàng).
  - `minPrice`, `maxPrice` (Optional): Khoảng giá bán.
  - `page` (Default: 1), `limit` (Default: 8)
* **Mô tả**: Danh sách toàn bộ nick (kể cả đã hết hàng / tạm ẩn) cho bảng quản trị, kèm tồn kho. Khác `/api/accounts` (storefront trả full-list nick đang bán).
* **Response (Success - 200)**: `PagedResult<AccountDto>` — `{ data: [{ id, game, category, title, price, originalPrice, imageUrl, avatarUrl, stats, details, isActive, stock, soldCount }], totalItems, totalPages, currentPage }`

### 6.4 Lấy lịch sử tất cả giao dịch hệ thống (Star log)
* **Endpoint**: `GET /api/admin/transactions`
* **Query Parameters**:
  - `search` (Optional): Tìm theo Mã GD / Mô tả / Email người dùng.
  - `username` (Optional): Lọc đúng theo email người dùng.
  - `minAmount`, `maxAmount` (Optional): Khoảng giá trị biến động.
  - `page` (Default: 1), `limit` (Default: 8)
* **Response (Success - 200)**:
```json
{
  "data": [
    {
      "id": "BUY-DBL-001-9238",
      "type": "buy_account",
      "username": "hoang_gamer99",
      "amount": 150000,
      "description": "Mua Tài Khoản mã số DBL-001...",
      "status": "Success",
      "time": "14:45:00 04/06/2026"
    }
  ],
  "totalItems": 1,
  "totalPages": 1,
  "currentPage": 1
}

```
