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
| Auth | POST | /api/auth/logout | Đăng xuất |
| User | GET/PATCH | /api/users/me | Xem/cập nhật profile |
| Room | GET | /api/rooms | Danh sách phòng |
| Room | POST | /api/rooms | Đăng phòng |
| Room | GET | /api/rooms/:id | Chi tiết phòng |
| Room | PATCH/DELETE | /api/rooms/:id | Sửa/xóa phòng |
| Roommate | GET | /api/roommates | Tìm roommate |
| Match | GET | /api/matches | Lấy danh sách match |
| Request | POST | /api/roommate-requests/:userId | Gửi request |
| Request | PATCH | /api/roommate-requests/:id | Xử lý request |
| Favorite | POST/DELETE | /api/favorites/rooms/:id | Lưu/bỏ lưu phòng |
| Chat | GET/POST | /api/conversations/:id/messages | Lấy/gửi tin nhắn |
| Notification | GET | /api/notifications | Lấy thông báo |
| Viewing | POST | /api/viewings | Yêu cầu xem phòng |
| Report | POST | /api/reports | Báo cáo user/listing |

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