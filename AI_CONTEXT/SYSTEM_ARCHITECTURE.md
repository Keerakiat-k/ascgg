# System Architecture: ASCG_G Project

## 1. High-Level Architecture
โปรเจกต์นี้ทำงานในรูปแบบ **Client-Server Architecture** โดยแยกส่วน Frontend และ Backend ออกจากกันอย่างชัดเจน และใช้ **RESTful API** ในการสื่อสารผ่านโปรโตคอล HTTP/HTTPS ด้วยรูปแบบข้อมูล JSON

- **Frontend (Client):** รับผิดชอบส่วนติดต่อผู้ใช้งาน (UI) นำเสนอข้อมูล และรับ Input จากผู้ใช้
- **Backend (Server):** รับผิดชอบตรรกะทางธุรกิจ (Business Logic) การประมวลผล การตรวจสอบสิทธิ์ (Authentication/Authorization) และจัดการฐานข้อมูล
- **Database:** ใช้สำหรับจัดเก็บข้อมูลแบบถาวร (Persistent Storage) เป็นฐานข้อมูลเชิงสัมพันธ์ (Relational Database)

## 2. Technology Stack

### Frontend (Client-side)
- **Framework:** React.js (v19)
- **Build Tool:** Vite (เพื่อความรวดเร็วในการ Build และ Hot Module Replacement)
- **Routing:** React Router DOM (v7) สำหรับจัดการเส้นทางหน้าเว็บ (SPA)
- **Styling:** TailwindCSS (v4) สำหรับจัด Layout และตกแต่ง UI
- **Icons:** Lucide React
- **Notifications/Alerts:** SweetAlert2
- **Data Export:** ExcelJS, FileSaver (สำหรับออกรายงาน Excel)

### Backend (Server-side)
- **Runtime:** Node.js
- **Framework:** Express.js (v5)
- **Database Driver:** `mysql2` (รองรับ Promise และ Connection Pool)
- **Authentication:** `jsonwebtoken` (JWT) สำหรับทำ Stateless Authentication
- **Security:** `bcryptjs` สำหรับ Hashing รหัสผ่าน
- **Environment Management:** `dotenv` สำหรับจัดการตัวแปรระบบ (Environment Variables)
- **CORS:** `cors` สำหรับอนุญาตการเรียก API ข้ามโดเมน

### Database
- **System:** MySQL / MariaDB

## 3. System Flow (ตัวอย่าง: การ Login)
1. ผู้ใช้กรอก Email และ Password ที่หน้า Frontend (`LoginPage.jsx`)
2. Frontend ส่ง HTTP POST Request ไปที่ Backend (`/api/auth/login`) พร้อมข้อมูล Credentials
3. Backend (`authController.js`) รับข้อมูล ค้นหาผู้ใช้จาก Database
4. Backend ใช้ `bcrypt` ตรวจสอบความถูกต้องของ Password Hash
5. หากถูกต้อง Backend จะสร้าง JWT Token และส่งกลับไปให้ Frontend
6. Frontend รับ Token มาเก็บไว้ (เช่น ใน LocalStorage หรือ Cookie) และเปลี่ยนหน้าไปยัง Dashboard
7. การเรียก API ครั้งต่อไป Frontend จะแนบ Token นี้ไปใน Header (`Authorization: Bearer <token>`)
8. Backend ตรวจสอบ Token ผ่าน Middleware ก่อนอนุญาตให้เข้าถึงข้อมูล (Protected Routes)
