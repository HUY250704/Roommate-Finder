# Project: Roommate Finder

## 1. Concept

**Roommate Finder** là nền tảng giúp những người đang tìm phòng hoặc tìm người ở ghép **tìm được roommate phù hợp dựa trên vị trí, ngân sách và lối sống**.

Thay vì chỉ:

> “Phòng 3 triệu, 20m², gần trường.”

Website tập trung thêm vào:

> “Người này có phù hợp để sống chung với mình không?”

Ví dụ:

**Nguyễn Văn A**

- 📍 Hải Châu, Đà Nẵng
- 💰 Budget: 2.5–3.5 triệu/tháng
- 🏠 Đang tìm roommate
- 🚭 Không hút thuốc
- 🐶 Thích thú cưng
- 🕐 Thường ngủ: 23:00
- 🎮 Thích gaming
- 🧹 Muốn nhà sạch sẽ
- 👥 Muốn ở cùng 1 người

Người dùng B có profile tương tự → hệ thống đưa ra:

> **92% Lifestyle Match**

Sau đó B có thể gửi request:

> “Mình thấy chúng ta khá hợp, muốn tìm hiểu thêm về căn phòng.”

---

## 2. Core Concept

Mình sẽ chia hệ thống thành **3 phần chính**:

```text
              ROOMMATE FINDER
                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓
    Room Finder   Roommate      Matching
                  Finder
        │            │            │
        └────────────┼────────────┘
                     ↓
                 Messaging
```

### 🏠 Room Finder

Tìm phòng:

- Location
- Giá
- Diện tích
- Số người
- Tiện ích
- Loại phòng
- Ngày available

### 👤 Roommate Finder

Tìm người ở cùng:

- Age
- Gender
- Budget
- Location
- Lifestyle
- Hobbies
- Pets
- Smoking
- Sleeping schedule
- Cleanliness
- Personality

### 🧠 Matching

Backend tính điểm tương thích giữa hai người.

Ví dụ:

```text
Budget          95%
Location        90%
Smoking         100%
Pets            80%
Sleep schedule  85%
Cleanliness     95%
Interests       70%

--------------------
Overall         89%
```

Đây sẽ là **feature signature** của project.

---

## 3. Các tính năng

### 🔐 Authentication

- Register
- Login
- Logout
- Forgot password
- Reset password
- Email verification
- JWT
- Google OAuth *(optional)*

Role:

```text
USER
ADMIN
```

---

## 4. User Profile

Mỗi user có profile:

### Basic information

- Avatar
- Name
- Age
- Gender
- Job / University
- Bio
- Location

### Lifestyle

- Smoking
- Drinking
- Pets
- Cleanliness
- Cooking
- Guest frequency
- Noise tolerance
- Sleep schedule

### Preferences

```text
Looking for:
☑ Room
☑ Roommate

Preferred location:
Hải Châu

Budget:
2M - 4M

Gender preference:
Any

Move-in:
September 2026
```

---

## 5. Room Listing

User có thể đăng phòng.

Ví dụ:

```text
2.8M/month
📍 Hải Châu, Đà Nẵng

25m²
1 bedroom
2 bathrooms

✓ WiFi
✓ AC
✓ Parking
✓ Washing machine
✓ Kitchen
```

Features:

- Create listing
- Edit listing
- Delete listing
- Upload images
- Price
- Location
- Description
- Amenities
- Available date
- Number of roommates
- House rules

---

## 6. Search & Filter

Đây sẽ là một phần frontend khá hay.

Search:

```text
┌─────────────────────────────────────────┐
│ Search location...                      │
└─────────────────────────────────────────┘

Price
○───────●────────○

☑ Air conditioning
☑ Parking
☐ Pet friendly

Gender
○ Male
○ Female
○ Any

Move-in date
[ September 2026 ]
```

Filter theo:

- Location
- Distance
- Price
- Room type
- Gender
- Age
- Amenities
- Pet
- Smoking
- Move-in date

Có thể thêm **Map View**.

---

## 7. Map

Đây là feature giúp website trông professional hơn.

Ví dụ:

```text
             MAP

      ● Room A
             \\
              ● Room B

   ● Room C

                    ● Room D
```

Click marker → hiện preview listing.

Có thể dùng:

- Mapbox
- Google Maps

---

## 8. Favorite / Bookmark

User có thể:

- Save room
- Save roommate
- Xem danh sách đã lưu
- Remove bookmark

Ví dụ:

```text
My Saved

❤️ Room in Hải Châu
❤️ Nguyễn Văn A
❤️ Room near Duy Tân University
```

---

## 9. Matching System

Đây là phần mình khuyên bạn đầu tư nhiều nhất.

Thay vì user phải tự tìm tất cả, hệ thống đưa ra:

### Recommended Roommates

> **🔥 94% Match**

**Minh**

> Budget: phù hợp ✓
>
> Không hút thuốc ✓
>
> Cùng khu vực ✓
>
> Sleep schedule: khá giống ✓
>
> Pets: phù hợp ✓

---

### Matching Algorithm

Bạn có thể bắt đầu bằng weighted scoring:

```text
Match Score =

Budget          × 20%
Location        × 20%
Lifestyle       × 25%
House habits    × 20%
Interests       × 10%
Other           × 5%
```

Sau này có thể nâng cấp thành recommendation system.

Đây là điểm rất tốt để bạn nói trong phỏng vấn:

> “I implemented a weighted roommate compatibility algorithm based on lifestyle and housing preferences.”

---

## 10. Real-time Chat

Khi hai người quan tâm nhau:

```text
User A
   ↓
Send Request
   ↓
User B accepts
   ↓
Chat unlocked
```

Chat:

- Text
- Image
- Online status
- Typing indicator
- Read status
- Message timestamp

Dùng **[Socket.io](http://Socket.io)**.

---

## 11. Notification

Notification khi:

- Có người like profile
- Có roommate request
- Request được accept
- Có tin nhắn mới
- Listing phù hợp mới
- Listing được cập nhật
- Có người contact bạn

Ví dụ:

> 🔔 Minh accepted your roommate request.

---

## 12. Viewing / Meeting

Có thể thêm một feature khá hay:

User muốn xem phòng:

> **Request a viewing**

Chọn:

```text
Date: 28/08/2026
Time: 18:30
```

Owner accept/reject.

Sau đó hệ thống tạo appointment.

---

## 13. Report & Safety

Vì đây là nền tảng kết nối người lạ, **Safety** rất quan trọng.

User có thể:

- Report profile
- Report listing
- Block user

Report reason:

```text
○ Scam
○ Fake listing
○ Harassment
○ Inappropriate content
○ Other
```

Admin xử lý report.

---

## 14. Admin Dashboard

Admin dashboard:

```text
Users          12,482
Listings        3,821
Active users    1,294
Reports           42
Matches         8,921
```

Các module:

### User Management

- View users
- Ban/unban
- Verify
- Delete

### Listing Management

- Approve
- Reject
- Remove

### Reports

- Review report
- Resolve
- Warn user
- Ban user

### Analytics

- User growth
- Listing growth
- Most popular locations
- Average rent
- Match success rate

---

## 15. Tech Stack

### Frontend

#### React

```text
React
TypeScript
Vite
```

#### UI

Một trong hai:

```text
Tailwind CSS
+
shadcn/ui
```

hoặc:

```text
MUI
```

#### State Management

```text
TanStack Query
Zustand
```

Không nhất thiết phải dùng Redux.

- **TanStack Query** → server state
- **Zustand** → client state

### Backend

```text
Node.js
Express.js
TypeScript
```

Architecture:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Repositories
   ↓
MongoDB
```

### Database

#### MongoDB

ODM:

```text
Mongoose
```

Các collection chính:

```text
User
Profile
Room
RoommatePreference
Favorite
Match
Conversation
Message
Notification
Viewing
Report
```

Quan hệ đại khái:

```text
User
 │
 ├── Profile
 ├── Room
 ├── Favorite
 ├── Match
 ├── Conversation
 ├── Notification
 └── Report
```

### Real-time

```text
Socket.io
```

Dùng cho:

- Chat
- Online status
- Typing indicator
- Message notification

### Map

#### Mapbox

hoặc

#### Google Maps Platform

MVP có thể chỉ lưu:

```text
latitude
longitude
```

Sau đó nâng cấp thành:

- Distance search
- Nearby rooms
- Map marker
- Radius filtering

MongoDB có **geospatial index**, rất hợp cho bài toán này.

Ví dụ:

> Tìm tất cả phòng trong bán kính 5 km.

### File Storage

Upload:

- Avatar
- Room images
- Verification documents

Có thể dùng:

```text
Cloudinary
```

### Email

```text
Nodemailer
```

Dùng cho:

- Verify email
- Reset password
- Viewing confirmation
- Important notifications

### Authentication

```text
JWT
+
Refresh Token
+
HTTP-only Cookie
```

Có thể thêm:

```text
Google OAuth
```

---

# 🚀 Deployment

```text
Frontend
    ↓
Vercel

Backend
    ↓
Railway

Database
    ↓
MongoDB Atlas

Images
    ↓
Cloudinary
```
