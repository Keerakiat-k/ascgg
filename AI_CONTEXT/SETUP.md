# Setup Guide (คู่มือการติดตั้งและการรันโปรเจกต์)

เอกสารนี้อธิบายขั้นตอนการรันโปรเจกต์ ASCG_G ในสภาพแวดล้อม Local (เครื่องของนักพัฒนา)

## 1. Prerequisites (สิ่งที่ต้องมี)
- **Node.js**: เวอร์ชัน 18.x หรือ 20.x ขึ้นไป
- **MySQL / MariaDB**: แนะนำให้ติดตั้งผ่าน XAMPP หรือ Docker
- **Git**: สำหรับดึงโค้ดและจัดการเวอร์ชัน

## 2. Database Setup (การตั้งค่าฐานข้อมูล)
1. เปิด MySQL Server (เช่น กด Start ใน XAMPP)
2. สร้างฐานข้อมูลชื่อ `ascg_g_db` ด้วยคำสั่ง:
   ```sql
   CREATE DATABASE IF NOT EXISTS ascg_g_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Import ข้อมูลเริ่มต้นจากไฟล์ `ascg_g_db.sql` ที่อยู่ในโฟลเดอร์หลักของโปรเจกต์

## 3. Backend Setup (การรัน API Server)
1. เปิด Terminal ชี้ไปที่โฟลเดอร์ `backend`
   ```bash
   cd backend
   ```
2. ติดตั้ง Dependencies
   ```bash
   npm install
   ```
3. คัดลอกไฟล์ `.env.example` เป็น `.env` และตั้งค่า Database / JWT Secret ให้ตรงกับเครื่องของคุณ
   ```bash
   cp .env.example .env
   ```
4. รันเซิร์ฟเวอร์
   ```bash
   # สำหรับการพัฒนา (ใช้ Nodemon)
   npm run dev
   
   # สำหรับรันปกติ
   node server.js
   ```
5. หากสำเร็จ จะเห็นข้อความ `Server is running on port 5000`

## 4. Frontend Setup (การรัน Web App)
1. เปิด Terminal ใหม่ ชี้ไปที่โฟลเดอร์ `frontend`
   ```bash
   cd frontend
   ```
2. ติดตั้ง Dependencies
   ```bash
   npm install
   ```
3. รันแอปพลิเคชันด้วย Vite
   ```bash
   npm run dev
   ```
4. เปิดเบราว์เซอร์และเข้าไปที่ URL ที่ Vite แสดง (ปกติจะเป็น `http://localhost:5173`)

## 5. การเข้าใช้งานระบบครั้งแรก (Default Logins)
อ้างอิงจากข้อมูลใน Database `employee_credentials` (พนักงาน ID=1)
- **Email:** `admin@company.com`
- **Password:** `123456` (สมมติ หากเข้าไม่ได้ต้องตรวจสอบรหัสที่ Hash ไว้ หรือรันคำสั่ง Update รหัสผ่านใหม่ผ่าน Bcrypt)
