# API Documentation

Base URL: `http://localhost:5000/api` (อ้างอิงตามค่า Default Port)

## 1. Authentication (การยืนยันตัวตน)

### 1.1 Login
- **Endpoint:** `/auth/login`
- **Method:** `POST`
- **Description:** ใช้สำหรับเข้าสู่ระบบและรับ JWT Token
- **Request Body:**
  ```json
  {
    "email": "admin@company.com",
    "password": "yourpassword"
  }
  ```
- **Response (Success):** `200 OK` (คืนค่า Token และข้อมูล User)

## 2. Employee Management (การจัดการพนักงาน)
*หมายเหตุ: Route เหล่านี้ควรต้องมีการแนบ JWT Token ใน Header (Authorization: Bearer <token>)*

### 2.1 Get All Employees
- **Endpoint:** `/employees`
- **Method:** `GET`
- **Description:** ดึงรายชื่อพนักงานทั้งหมด (ข้อมูลพื้นฐานสำหรับแสดงในตาราง)

### 2.2 Create Employee
- **Endpoint:** `/employees`
- **Method:** `POST`
- **Description:** สร้างข้อมูลพนักงานใหม่ รวมถึงข้อมูลตารางที่เกี่ยวข้อง (ครอบครัว, การศึกษา, ประสบการณ์) ผ่าน Transaction
- **Request Body:** JSON Object ขนาดใหญ่ที่รวมข้อมูลทุกส่วน

### 2.3 Get Employee by ID
- **Endpoint:** `/employees/:id`
- **Method:** `GET`
- **Description:** ดึงข้อมูลพนักงานตาม ID ที่ระบุ

### 2.4 Update Employee
- **Endpoint:** `/employees/:id`
- **Method:** `PUT`
- **Description:** อัปเดตข้อมูลส่วนตัวพนักงาน

### 2.5 Update Employee Status
- **Endpoint:** `/employees/:id/status`
- **Method:** `PUT`
- **Description:** อัปเดตสถานะการทำงาน (เช่น 'Active', 'Inactive')
- **Request Body:**
  ```json
  {
    "status": "Inactive"
  }
  ```

### 2.6 Get Next Employee Code
- **Endpoint:** `/employees/next-code?prefix=...`
- **Method:** `GET`
- **Description:** Gen รหัสพนักงานถัดไปอัตโนมัติตาม Prefix ของบริษัทและปีปัจจุบัน

## 3. Master Data

### 3.1 Get All Companies
- **Endpoint:** `/companies`
- **Method:** `GET`
- **Description:** ดึงรายชื่อบริษัททั้งหมดที่มีสถานะ Active

## 4. IT Support (ระบบแจ้งปัญหาไอที)

### 4.1 Create Ticket
- **Endpoint:** `/it-support`
- **Method:** `POST`
- **Access:** Public
- **Description:** พนักงานหรือบุคคลทั่วไปเปิด Ticket แจ้งปัญหา

### 4.2 Get All Tickets
- **Endpoint:** `/it-support`
- **Method:** `GET`
- **Access:** Protected (verifyToken)
- **Description:** ดึงรายการ Ticket ทั้งหมด (สำหรับ Admin)

### 4.3 Update Ticket
- **Endpoint:** `/it-support/:id`
- **Method:** `PUT`
- **Access:** Protected (verifyToken)
- **Description:** อัปเดตสถานะ หรือมอบหมายงานโดย Admin

## 5. Announcements (ประกาศข่าวสาร)

### 5.1 Get All Announcements
- **Endpoint:** `/announcements`
- **Method:** `GET`
- **Description:** ดึงรายการประกาศ ข่าวสาร และกิจกรรม

## 6. System

### 6.1 Health Check
- **Endpoint:** `/health`
- **Method:** `GET`
- **Description:** ตรวจสอบสถานะการทำงานของ Backend API
