# **ROOMMATE FINDER**

# **KẾ HOẠCH PHÁT TRIỂN FRONTEND & API**

---

# **1. Công nghệ sử dụng**

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React + Vite + JavaScript |
| Backend | Node.js + Express.js |
| Database | MongoDB |
| Authentication | JWT |
| Real-time | Socket.io |
| API Testing | Postman |

---

# **2. Kế hoạch Frontend**

Frontend xây dựng bằng **React + JavaScript**, gồm các module chính:

| STT | Module | Chức năng chính |
| --- | --- | --- |
| 1 | Authentication | Đăng ký, đăng nhập, đăng xuất |
| 2 | Profile | Quản lý thông tin cá nhân, lifestyle, nhu cầu tìm roommate |
| 3 | Room | Đăng, sửa, xóa, xem phòng |
| 4 | Search | Tìm kiếm và lọc phòng |
| 5 | Roommate | Tìm kiếm người ở ghép |
| 6 | Matching | Hiển thị mức độ tương thích giữa các user |
| 7 | Favorite | Lưu phòng và roommate yêu thích |
| 8 | Request | Gửi và nhận roommate request |
| 9 | Chat | Nhắn tin real-time |
| 10 | Notification | Hiển thị thông báo |
| 11 | Admin | Quản lý hệ thống |

---

# **3. Phân chia màn hình Frontend**

## **3.1. User Interface**

Dành cho người dùng tìm phòng và tìm roommate.

### Authentication

- Login
- Register

### Home

- Trang chủ
- Hiển thị phòng đề xuất
- Hiển thị roommate phù hợp

### Profile

- Xem thông tin cá nhân
- Cập nhật profile
- Cập nhật lifestyle:
    - Smoking
    - Pets
    - Sleep schedule
    - Cleanliness
    - Hobbies

### Room Finder

- Room List
- Room Detail
- Create Room
- Edit Room
- My Rooms

Chức năng:

- Đăng phòng
- Xem phòng
- Chỉnh sửa phòng
- Xóa phòng

### Roommate Finder

- Roommate List
- Roommate Detail

Thông tin tìm kiếm:

- Location
- Budget
- Lifestyle
- Hobby
- Preference

### Matching

- Match List
- Hiển thị % tương thích

Ví dụ:

```
Lifestyle Match: 92%
Budget: 95%
Location: 90%
Habits: 95%
```

### Favorite

- Danh sách phòng đã lưu
- Danh sách roommate đã lưu

### Request

- Gửi roommate request
- Xem request nhận được
- Chấp nhận / từ chối request

### Chat

- Danh sách cuộc trò chuyện
- Nhắn tin real-time

### Notification

- Thông báo request
- Thông báo tin nhắn
- Thông báo match

---

## **3.2. Admin Interface**

Dành cho quản trị hệ thống.

### Admin Dashboard

Hiển thị:

- Số lượng user
- Số lượng phòng
- Số lượng match
- Số lượng report

### User Management

Chức năng:

- Xem danh sách user
- Khóa tài khoản
- Xóa user

### Room Management

Chức năng:

- Xem danh sách phòng
- Kiểm tra tin đăng
- Xóa phòng vi phạm

### Report Management

Chức năng:

- Xem báo cáo
- Xử lý báo cáo user/listing

---

# **4. Kế hoạch API**

Backend sử dụng **Node.js + Express.js**, xây dựng REST API.

| Module | Method | Endpoint | Chức năng |
| --- | --- | --- | --- |
| Auth | POST | /api/auth/register | Đăng ký |
| Auth | POST | /api/auth/login | Đăng nhập |
| Auth | POST | /api/auth/refresh | Làm mới access token bằng refresh cookie |
| Auth | POST | /api/auth/logout | Đăng xuất |
| User | GET | /api/users/me | Xem profile |
| User | PUT | /api/users/me | Cập nhật profile |
| Room | GET | /api/rooms | Danh sách phòng |
| Room | POST | /api/rooms | Đăng phòng |
| Room | GET | /api/rooms/:id | Chi tiết phòng |
| Room | PUT | /api/rooms/:id | Sửa phòng |
| Room | DELETE | /api/rooms/:id | Xóa phòng |
| Roommate | GET | /api/roommates | Tìm roommate |
| Match | GET | /api/matches | Lấy danh sách match |
| Request | POST | /api/roommate-requests | Gửi request (`receiverId`, tùy chọn `message` trong body) |
| Request | PUT | /api/roommate-requests/:id | Xử lý request |
| Favorite | POST | /api/favorites/rooms | Lưu phòng (`roomId` trong body) |
| Favorite | DELETE | /api/favorites/rooms/:roomId | Bỏ lưu phòng |
| Chat | GET | /api/conversations/messages/:conversationId | Lấy tin nhắn |
| Chat | POST | /api/conversations/messages | Gửi tin nhắn (`text` và `recipientId` hoặc `conversationId` trong body) |
| Notification | GET | /api/notifications | Lấy thông báo |
| Viewing | POST | /api/viewings | Yêu cầu xem phòng |
| Report | POST | /api/reports | Báo cáo user/listing |
| Block | POST/DELETE | /api/blocks | Chặn/bỏ chặn user qua `blockedUserId` |

Các endpoint danh sách `GET /api/rooms`, `GET /api/rooms/search`, `GET /api/roommates`, `GET /api/conversations/messages/:conversationId` và `GET /api/admin/users` hỗ trợ `page` (mặc định `1`) và `limit` (mặc định `20`, tối đa `100`). Response chứa `rooms`, `roommates`, `messages` hoặc `users` tương ứng, cùng thông tin phân trang (`page`, `limit`, `total`); riêng `GET /api/roommates` trả metadata phân trang trong object `pagination` (`page`, `limit`, `total`, `totalPages`). Các API hiển thị thông tin người dùng khác (roommate, favorite, viewing, chat, match, request, block, notification và phản hồi report cho user) chỉ trả username/avatar, không trả email. Email vẫn có thể được dùng nội bộ để gửi thông báo hoặc hiển thị trong luồng quản trị được bảo vệ.

Report cần đúng một target (user hoặc listing); lý do hợp lệ: `Scam`, `Fake listing`, `Harassment`, `Inappropriate content`, `Other`. Người dùng bị chặn không thể xem hồ sơ roommate, gửi hoặc phản hồi roommate request, mở lịch sử hội thoại hay gửi tin nhắn với bên còn lại.

Access token có thời hạn 15 phút và được trả trong JSON. Refresh token được lưu dạng hash phía server, gửi qua cookie `HttpOnly`, và được xoay mỗi khi gọi `/api/auth/refresh`. `/api/auth/logout` thu hồi refresh token hiện tại, tăng phiên bản token để vô hiệu hóa ngay các access token đã phát hành cho tài khoản, ngắt các kết nối Socket.IO đang hoạt động và xóa cookie.

Các route `/api/auth/*` được giới hạn 60 request mỗi IP trong 15 phút; đăng nhập/Firebase và đăng ký giới hạn 10 request, còn verify email, quên/đặt lại mật khẩu và gửi lại mã xác minh giới hạn 5 request mỗi IP trong cùng khoảng thời gian.

Tài khoản bị ban hoặc đình chỉ không thể làm mới access token hay kết nối Socket.IO; khi admin ban/đình chỉ tài khoản, refresh session bị thu hồi và các kết nối Socket.IO hiện tại bị ngắt.

CORS cho phép frontend production `https://roommate-finder-ashen.vercel.app` và các origin được liệt kê trong `FRONTEND_URL` (phân cách bằng dấu phẩy, chỉ gồm origin, không có path). Khi thay domain frontend, cập nhật `FRONTEND_URL` trên hosting backend rồi redeploy. Frontend production hiện dùng API Render `https://roommate-finder-layf.onrender.com/api`; khi chuyển backend sang host khác, cập nhật URL production trong `frontend/src/config/api.js` rồi build/deploy lại frontend. `VITE_API_URL` chỉ cấu hình API cho môi trường development. Helmet dùng COOP `same-origin-allow-popups` để tương thích đăng nhập Firebase/Google bằng popup.

---

# **Chạy test**

## Frontend

```bash
cd frontend
npm ci
npm test
npm run build
```

Frontend tests dùng Vitest và React Testing Library; đặt trong `frontend/src/__tests__/` với tên `*.test.js` hoặc `*.test.jsx`. Khi test code gọi API hoặc Socket.IO, mock các dịch vụ đó để test không gọi mạng/backend thật. Dùng Testing Library để render component và kiểm tra hành vi người dùng.

## Backend

```bash
cd backend
npm ci
npm test
```

Backend tests dùng Jest, Supertest và MongoDB Memory Server; test đặt trong `backend/tests/` với tên `*.test.js`. Database chạy giả lập trong RAM, không cần cài hoặc cấu hình MongoDB bên ngoài. Setup chung kết nối MongoDB và dọn dữ liệu giữa các test.

Ví dụ test endpoint được bảo vệ:

```js
const request = require('supertest');
const app = require('../index');
const { createUser, tokenFor } = require('./helpers');

it('returns the current resource', async () => {
  const user = await createUser();
  const response = await request(app)
    .get('/api/example')
    .set('Authorization', `Bearer ${tokenFor(user)}`);

  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({ id: expect.any(String) });
});
```

Tạo dữ liệu fixture trước request, dùng Supertest gửi request đến app Express, rồi kiểm tra status/response và dữ liệu lưu tương ứng. CI chạy backend test, frontend test và frontend build trên mỗi pull request và push lên `main`.

---

# **5. Database – MongoDB**

Các collection chính:

```
User
Profile
Room
Favorite
Match
RoommateRequest
Conversation
Message
Notification
Viewing
Report
```

Quan hệ chính:

```
User
 |
 ├── Profile
 ├── Room
 ├── Favorite
 ├── Match
 ├── RoommateRequest
 ├── Conversation
 │       |
 │       Message
 ├── Notification
 ├── Viewing
 └── Report
```

---

# **6. Matching System**

Hệ thống tính điểm tương thích giữa các roommate dựa trên:

| Tiêu chí | Trọng số |
| --- | --- |
| Budget | 20% |
| Location | 20% |
| Lifestyle | 25% |
| House habits | 20% |
| Interests | 10% |
| Other | 5% |

Ví dụ:

```
Budget          95%
Location        90%
Lifestyle       100%
House habits    95%
Interests       70%

Overall Match: 92%
```

---

# **7. Thứ tự triển khai**

```
1. Setup Frontend + Backend + MongoDB

↓

2. Authentication

↓

3. User Profile

↓

4. Room Listing

↓

5. Search & Filter

↓

6. Roommate Finder

↓

7. Matching System

↓

8. Favorite + Request

↓

9. Chat + Notification

↓

10. Admin + Report

↓

11. Testing & Deployment
```

---

# **8. Kết quả dự kiến**

Sau khi hoàn thành, hệ thống cho phép:

### User:

- Đăng ký và quản lý tài khoản.
- Tạo và tìm kiếm phòng.
- Tìm người ở ghép.
- Xem mức độ tương thích giữa roommate.
- Gửi roommate request.
- Lưu phòng/người dùng yêu thích.
- Nhắn tin real-time.
- Nhận thông báo.
- Báo cáo user hoặc tin đăng.

### Admin:

- Quản lý người dùng.
- Quản lý phòng đăng.
- Xử lý báo cáo.
- Theo dõi hoạt động hệ thống.

**Mục tiêu:**

Xây dựng nền tảng tìm phòng và roommate thông minh, trong đó **Matching System** là chức năng chính giúp người dùng tìm được người ở chung phù hợp dựa trên lifestyle, nhu cầu và điều kiện cá nhân.