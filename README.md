# 📚 QLNhaSach — Hệ Thống Quản Lý Nhà Sách Trực Tuyến

> Nền tảng thương mại điện tử sách hoàn chỉnh, tích hợp AI Chatbot, thanh toán MoMo và quản trị kho hàng chuyên nghiệp.

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js_20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express 5](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75B2?style=flat-square&logo=google&logoColor=white)

![License](https://img.shields.io/badge/License-ISC-green?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

</div>

---

## ✨ Điểm nổi bật

| | Tính năng |
|--|-----------|
| 🤖 | **AI Chatbot** tích hợp Google Gemini hỗ trợ tư vấn sách 24/7 |
| 💳 | **Thanh toán MoMo** tích hợp native Payment Gateway |
| ⚡ | **Redis Session Store** — session server-side cực nhanh, bảo mật |
| ☁️ | **Cloudinary CDN** — ảnh sản phẩm được tối ưu và phân phối toàn cầu |
| 📊 | **Dashboard Admin** với thống kê doanh thu & xuất báo cáo Excel |
| 🔐 | **OTP Email** xác thực qua Gmail + bcrypt mã hóa mật khẩu |

---

## 🗂️ Cấu trúc dự án

```
QLNhaSach/
│
├── 📁 src/
│   ├── 📁 configs/             # Kết nối DB, Cloudinary, MoMo, Redis
│   ├── 📁 controllers/         # Tầng xử lý request (17 controllers)
│   ├── 📁 middlewares/         # Auth, phân quyền, upload file
│   ├── 📁 models/              # MySQL models (14 bảng dữ liệu)
│   ├── 📁 routers/
│   │   ├── 📁 apiRouters/      # RESTful JSON API
│   │   └── 📁 viewRouters/     # Server-side page routes
│   ├── 📁 services/            # Business logic layer (17 services)
│   ├── 📁 utils/               # Helper functions dùng chung
│   ├── 📁 views/
│   │   ├── 📁 admin/           # Giao diện quản trị
│   │   ├── 📁 user/            # Giao diện khách hàng
│   │   └── 📁 layouts/         # EJS layout templates
│   ├── 📁 public/              # Static files (CSS, JS, images)
│   └── 📄 app.js               # Express app setup
│
├── 📁 uploads/                 # File upload tạm thời
├── 📄 server.js                # Entry point
├── 📄 .env.example             # Mẫu cấu hình
└── 📄 README.md
```

---

## 🛍️ Tính năng

### Phía Khách Hàng

<details>
<summary><strong>🏪 Cửa hàng & Sản phẩm</strong></summary>

- Duyệt sách theo **Danh mục**, **Tác giả**, **Nhà xuất bản**
- Trang chi tiết sách với hình ảnh Cloudinary chất lượng cao
- Tìm kiếm và bộ lọc thông minh

</details>

<details>
<summary><strong>🛒 Giỏ hàng & Thanh toán</strong></summary>

- Giỏ hàng persistent — lưu qua **Redis Session**, không mất khi đóng tab
- Đếm số lượng giỏ hàng real-time trên navbar
- Áp dụng **mã giảm giá (Voucher)**
- Thanh toán **COD** hoặc **MoMo** (QR Code / Deeplink)

</details>

<details>
<summary><strong>📦 Đơn hàng & Tài khoản</strong></summary>

- Xem lịch sử đơn hàng, trạng thái chi tiết từng giai đoạn
- Quản lý hồ sơ cá nhân
- Đăng ký, đăng nhập, quên mật khẩu qua **OTP Email**

</details>

<details>
<summary><strong>🤖 AI Chatbot</strong></summary>

- Tích hợp **Google Gemini AI** tư vấn chọn sách, trả lời câu hỏi 24/7
- Giao tiếp tự nhiên bằng tiếng Việt

</details>

### Phía Quản Trị (Admin)

<details>
<summary><strong>📊 Dashboard & Thống kê</strong></summary>

- Tổng quan doanh thu, số đơn hàng, tồn kho theo ngày/tháng
- Biểu đồ trực quan hóa dữ liệu kinh doanh
- Xuất báo cáo dạng **file Excel (.xlsx)**

</details>

<details>
<summary><strong>📚 Quản lý Danh mục</strong></summary>

- **Sách**: Thêm/sửa/xóa với upload ảnh Cloudinary, quản lý giá & tồn kho
- **Tác giả / Nhà xuất bản / Danh mục / Nhà cung cấp**: CRUD đầy đủ

</details>

<details>
<summary><strong>🏭 Quản lý Kho hàng</strong></summary>

- Tạo **Phiếu nhập kho** từ nhà cung cấp
- Tạo **Phiếu xuất kho**, cập nhật tồn kho tự động
- Theo dõi lịch sử nhập/xuất chi tiết

</details>

<details>
<summary><strong>📋 Đơn hàng & Hóa đơn</strong></summary>

- Xem, xác nhận và cập nhật trạng thái đơn hàng
- Tạo và xem hóa đơn bán hàng

</details>

<details>
<summary><strong>👥 Nhân viên & Voucher</strong></summary>

- Quản lý tài khoản nhân viên với phân quyền
- Tạo và quản lý mã khuyến mãi

</details>

---

## ⚙️ Công nghệ sử dụng

```
┌─────────────────────────────────────────────────────────────┐
│                        TECH STACK                           │
├──────────────────┬──────────────────────────────────────────┤
│  Runtime         │  Node.js 20+ (ES Modules)                │
│  Framework       │  Express 5                               │
│  Template Engine │  EJS + express-ejs-layouts               │
│  Database        │  MySQL 8 via mysql2 (Aiven Cloud)        │
│  Session Store   │  Redis via connect-redis                 │
│  Media Storage   │  Cloudinary (upload + CDN)               │
│  File Upload     │  Multer                                  │
│  Authentication  │  bcrypt + express-session                │
│  Email           │  Nodemailer (Gmail SMTP)                 │
│  Payment         │  MoMo Payment Gateway                    │
│  AI              │  Google Gemini AI (@google/generative-ai)│
│  Security        │  Helmet.js                               │
│  Performance     │  Compression (gzip)                      │
│  Reporting       │  XLSX (Excel export)                     │
│  Dev Tools       │  Nodemon + Morgan                        │
└──────────────────┴──────────────────────────────────────────┘
```

---

## 🚀 Cài đặt & Chạy dự án

### Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) >= 20
- MySQL server (hoặc [Aiven](https://aiven.io/) cloud)
- Redis server (hoặc [Upstash](https://upstash.com/) cloud)
- Tài khoản [Cloudinary](https://cloudinary.com/) (free tier đủ dùng)

### Bước 1 — Lấy mã nguồn

```bash
git clone <repository-url>
cd QLNhaSach
npm install
```

### Bước 2 — Cấu hình môi trường

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
# Server
PORT=3000

# MySQL Database
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_username
DB_PASS=your_password
DB_NAME=qlnhasach

# Cloudinary
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret

# Email OTP (Gmail App Password)
MAIL_USER=your_email@gmail.com
MAIL_PASS=xxxx_xxxx_xxxx_xxxx

# Redis
REDIS_URL=redis://username:password@host:port

# Session
SESSION_SECRET=your_random_secret_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

> **Lưu ý:** `MAIL_PASS` là **App Password** của Google (không phải mật khẩu Gmail thường).  
> Tạo tại: Google Account → Security → 2-Step Verification → App Passwords.

### Bước 3 — Khởi động

```bash
# Development (hot-reload)
npm run dev

# Production
npm start
```

🌐 Truy cập: **http://localhost:3000**

---

## 🔑 Hướng dẫn nhanh

| Đường dẫn | Mô tả |
|-----------|-------|
| `/` | Trang chủ cửa hàng |
| `/books` | Danh sách sách |
| `/cart` | Giỏ hàng |
| `/checkout` | Thanh toán |
| `/auth/login` | Đăng nhập |
| `/auth/register` | Đăng ký |
| `/admin` | Dashboard quản trị |

---

## 📁 Biến môi trường — Tổng hợp

| Tên biến | Bắt buộc | Mô tả |
|----------|:--------:|-------|
| `PORT` | ✅ | Cổng server (default: 3000) |
| `DB_HOST` | ✅ | MySQL host |
| `DB_PORT` | ✅ | MySQL port |
| `DB_USER` | ✅ | MySQL username |
| `DB_PASS` | ✅ | MySQL password |
| `DB_NAME` | ✅ | Tên database |
| `CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUD_API_KEY` | ✅ | Cloudinary API key |
| `CLOUD_API_SECRET` | ✅ | Cloudinary API secret |
| `MAIL_USER` | ✅ | Gmail address |
| `MAIL_PASS` | ✅ | Gmail App Password |
| `REDIS_URL` | ✅ | Redis connection URL |
| `SESSION_SECRET` | ✅ | Session secret key |
| `GEMINI_API_KEY` | ⚙️ | Google Gemini AI (tùy chọn, cần để dùng chatbot) |

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit thay đổi: `git commit -m 'feat: thêm tính năng X'`
4. Push lên branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

<div align="center">

**Được xây dựng với ❤️ bằng Node.js**

*Kiến trúc MVC rõ ràng · Bảo mật đa lớp · Tích hợp AI hiện đại*

</div>
