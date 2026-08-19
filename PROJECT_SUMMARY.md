# ASCG Group — HR & Enterprise Portal Handover Document
> **เอกสารสรุปภาพรวมโปรเจกต์และการอัปเดตระบบล่าสุด (อัปเดต ณ วันที่ 6 สิงหาคม 2026)**

---

## 📌 1. ภาพรวมโปรเจกต์ (Project Overview)
**ASCG HR & Enterprise Portal** เป็นระบบบริหารจัดการองค์กรแบบรวมศูนย์ของ **ASCG Group** รองรับการทำงานของพนักงานทุกระดับ (Admin, HR, Manager, Employee, IT Support) 

### ฟีเจอร์หลักในระบบ:
1. **หน้าข่าวสารและประกาศองค์กร (Public Announcement Page)**: อ่านประกาศสำคัญ กิจกรรม ค้นหาข่าวสาร และยื่นแจ้งซ่อม IT
2. **ระบบจัดการผู้ใช้งานระบบและถือครองทรัพย์สิน (System Users Management)**: จัดการรายชื่อผู้ใช้งานระบบ (`System Users`), เชื่อมโยงข้อมูลสังกัดบริษัท/แผนก/ตำแหน่ง/อีเมลองค์กร และโชว์จำนวนเครื่องคอมพิวเตอร์ที่ถือครองอยู่ (`💻 X เครื่อง`)
3. **ระบบสลับสิทธิ์การใช้งาน (Role Simulation)**: ผู้ดูแลระบบ (Admin) สามารถทดลองสลับมุมมองสิทธิ์เป็น HR หรือ IT Support ได้จากแถบด้านบน Navbar
4. **ระบบจัดการการลา (Leave Management)**: ยื่นขอลางาน, ตรวจสอบโควต้า, อนุมัติคำขอตามลำดับขั้นสำหรับ Manager/HR, ส่งออกรายงาน CSV, ดูเอกสารแนบแบบ Fullscreen
5. **ระบบแจ้งซ่อม IT (IT Helpdesk)**: เปิดทิกเก็ตแจ้งซ่อม, ติดตามสถานะ, บันทึกหมายเหตุงานซ่อม, ส่งออกรายงาน Excel (xlsx) และ PDF
6. **ระบบรายงานตรวจเช็คไอทีประจำวัน (IT System Health Check)**: ตรวจเช็คสถานะคอมพิวเตอร์และอุปกรณ์ประจำวันตามสาขา พร้อมส่งออกไฟล์ Excel ดีไซน์ Executive Modern Report (พอร์ต ExcelJS)
7. **ระบบรองรับการใช้งานวง LAN / Wi-Fi เดียวกัน**: สามารถเข้าใช้งานจากมือถือ แท็บเล็ต หรือ PC เครื่องอื่นในวง LAN ได้ผ่าน IP `http://192.168.99.147:5173`

---

## 🏗️ 2. เทคโนโลยีที่ใช้ (Tech Stack)

### **Frontend** (`c:\Users\keerakiat.k\Desktop\ascg_g\frontend`)
- **Core**: React 18 + Vite (`--host 0.0.0.0`)
- **Styling**: Tailwind CSS v4 (Custom Design Tokens)
- **Icons**: `lucide-react`
- **Charts**: `recharts`
- **UI & Alerts**: `sweetalert2`
- **Select Inputs**: `react-select` (SearchableSelectField)
- **Print Utility**: `react-to-print`
- **Excel Export**: `exceljs` + `file-saver`

### **Backend** (`c:\Users\keerakiat.k\Desktop\ascg_g\backend`)
- **Runtime**: Node.js + Express.js (`host: 0.0.0.0`)
- **Database**: MySQL / MariaDB (`ascg_g_db`)
- **File Uploads**: Multer (จัดเก็บไว้ใน `/uploads/...` เช่น `/uploads/leaves/`, `/uploads/announcements/`, `/uploads/profiles/`)
- **Dev Server**: Nodemon (`npx nodemon server.js`)
- **Launcher Scripts**: `start_app.bat` และ `stop_app.bat` (ดับเบิลคลิกรันได้ทันที)

---

## 🚀 3. สรุปการปรับปรุงระบบสำคัญ (อัปเดตล่าสุด 6 สิงหาคม 2026)

### 3.1 การรองรับการใช้งานผ่านวง LAN (Local Network & Wi-Fi Access)
- ปรับตั้งค่า Vite (`vite.config.js`) และ Express (`server.js`) ให้จับการเชื่อมต่อบน IP `0.0.0.0`
- เพิ่มฟังก์ชัน `getApiBaseUrl()` ใน `src/config/api.js` และ `AdminLayout.jsx` ให้ตรวจจับ IP เครื่องโฮสต์แบบ Dynamic (`http://${window.location.hostname}:5000`) อัตโนมัติ ป้องกันปัญหา `Failed to fetch` บนเครื่องอื่น
- สร้างไฟล์ **`start_app.bat`** สำหรับเปิดรัน Backend & Frontend พร้อมกันใน 1 คลิก
- เพิ่มกฎ Windows Firewall: `New-NetFirewallRule -DisplayName "ASCG Portal LAN Access" -Direction Inbound -LocalPort 5000,5173 -Protocol TCP -Action Allow`

### 3.2 ปรับเปลี่ยนเป็นระบบจัดการผู้ใช้งานระบบ (System Users & Asset Holding)
- เปลี่ยนหน้า *"รายชื่อพนักงานทั้งหมด"* เป็น **"รายการผู้ใช้งานระบบ (System Users)"** (`/employee-list`)
- ถอดแบบฟอร์มประวัติพนักงาน HR เดิมออก คงไว้เฉพาะข้อมูลที่จำเป็นต่อการถือครองทรัพย์สินบริษัท (รหัสผู้ใช้, ชื่อ-นามสกุล, สังกัดบริษัท/แผนก/ตำแหน่ง, อีเมลองค์กร, เบอร์ติดต่อ, สิทธิ์ระบบ, และจำนวนทรัพย์สินคอมพิวเตอร์ที่ถือครองอยู่)
- ปรับหน้าลงทะเบียนผู้ใช้ใหม่ (`AddEmployeePage.jsx`) และหน้าแก้ไข (`EditEmployeePage.jsx`) เป็นฟอร์มเดี่ยว กระชับ กรอกข้อมูลเสร็จในหน้าเดียว

### 3.3 เคลียร์ตารางฐานข้อมูลที่ไม่ได้ใช้งาน (Database Optimization)
- ลบตารางประวัติพนักงานเดิมออก 5 ตาราง:
  1. `employee_additional_info`
  2. `employee_educations`
  3. `employee_experiences`
  4. `employee_families`
  5. `employee_trainings`
- โครงสร้างฐานข้อมูลปัจจุบันสะอาดและสมบูรณ์อยู่ที่ **22 ตาราง** ประสิทธิภาพการบันทึกข้อมูลเร็วขึ้น 100%

### 3.4 ปรับปรุงกระดิ่งแจ้งเตือน 🔔 (Bell Notification Cleanup)
- ถอดการแจ้งเตือนพนักงานเข้าใหม่/พ้นสภาพออกจากการแจ้งเตือนกระดิ่ง 🔔 เพื่อลดการเตือนซ้ำซ้อน (Admin สามารถจัดการผู้ใช้ได้ตรงที่หน้าผู้ใช้งานระบบ)
- ไอคอนกระดิ่ง 🔔 ปรับให้แสดงเฉพาะ **รายการแจ้งซ่อม IT (Helpdesk Support Tickets)** ที่ค้างอยู่แบบ Real-time

### 3.5 ปรับการสลับสิทธิ์การใช้งาน (Role Simulation & Sidebar Access)
- แถบจำลองสิทธิ์ด้านบน (`[🎭 จำลองสิทธิ์:]`) ปรับให้แสดงเฉพาะ 3 สิทธิ์หลักสำหรับทดสอบ: **`Admin`**, **`HR`**, **`IT Support`** (ซ่อน `Employee` และ `Manager`)
- ปรับสิทธิ์การมองเห็นเมนูด้านข้างสำหรับสิทธิ์ **`Employee`** (เห็นเฉพาะ หน้าหลัก, แจ้งซ่อม IT, ลางาน) และ **`Manager`** (เห็นเฉพาะ หน้าหลัก, แจ้งซ่อม IT, ลางาน, อนุมัติการลา) เพื่อป้องกันการเข้าถึงหน้าบริหารจัดการส่วนกลาง

---

## 🎨 4. ระบบธีมและการออกแบบ (Design System Tokens)
ระบบใช้ธีม **Hybrid Comfort Theme** ออกแบบเพื่อการใช้งานประจำวันลื่นไหล สบายตา คอนทราสต์สูง อ่านข้อมูลตารางได้ยาวนานตลอดวัน

| โทนสี | รหัสสี (Hex) | วัตถุประสงค์การใช้งาน |
|---|---|---|
| **Background (Canvas)** | `#f8fafc` (`slate-50`) | พื้นหลังหลัก สบายตา ลดแสงสะท้อน |
| **Primary Accent (Brand)** | `#f89919` (Orange) | ปุ่มกดหลัก (Primary Button), Active Navigation, Focus Rings, Highlight Badges, Loading Spinners |
| **Primary Hover** | `#d97c08` | Hover state สำหรับปุ่มส้ม |
| **Secondary Accent** | `#ae8a68` (Warm Brown) | ปุ่มรอง, Subtext, Icon accents |
| **Borders & Dividers** | `#e2e8f0` (`slate-200`) | เส้นขอบการ์ด, เส้นตาราง |
| **Text Primary** | `#0f172a` (`slate-900`) | หัวข้อข่าวสาร, ข้อความตาราง คอนทราสต์สูง |
| **Text Secondary** | `#475569` (`slate-600`) | ข้อความอธิบายรอง |

---

## 📁 5. โครงสร้างไฟล์และหน้าจอหลัก (Directory Structure & Routes)

### **Frontend Routes Mapping** (`src/App.jsx`)

| Path | Component | คำอธิบายหน้าจอ | สิทธิ์การเข้าถึง |
|---|---|---|---|
| `/` | `AnnouncementPage.jsx` | หน้าข่าวสารและประกาศองค์กร (มี Hero, Filter pills, Modal ดูรายละเอียด) | Public (ทุกคน) |
| `/login` | `LoginPage.jsx` | หน้าเข้าสู่ระบบ | Public |
| `/report-it` | `ITSupportPage.jsx` | หน้าเปิดทิกเก็ตแจ้งปัญหา IT | Public / Authenticated |
| `/dashboard` | `DashboardPage.jsx` | หน้า Dashboard รวม (แสดง UI แยกตาม Role) | Authenticated |
| `/employee-list` | `EmployeeListPage.jsx` | รายการผู้ใช้งานระบบ (System Users) และสิทธิ์การถือครองทรัพย์สินบริษัท | Admin, HR |
| `/employees/new` | `AddEmployeePage.jsx` | ฟอร์มเพิ่มผู้ใช้งานระบบใหม่ | Admin, HR |
| `/edit-employee/:id` | `EditEmployeePage.jsx` | ฟอร์มแก้ไขข้อมูลผู้ใช้งานระบบ | Admin, HR |
| `/leave` | `LeaveRequestPage.jsx` | สรุปโควต้าวันลาพนักงาน + ฟอร์มยื่นคำขอลางาน | Authenticated |
| `/leave/approvals` | `LeaveManagementPage.jsx` | อนุมัติคำขอลางาน (Approve / Reject พร้อมระบุเหตุผล) | Admin, HR, Manager |
| `/leave/history` | `LeaveHistoryPage.jsx` | ประวัติการลาทั้งหมด (ค้นหา, กรองวันที่, ดูเอกสารแนบ, Export CSV) | Admin, HR |
| `/admin/announcements` | `AnnouncementListPage.jsx` | รายการจัดการประกาศองค์กร | Admin, HR |
| `/admin/it-health-check` | `ITHealthCheckPage.jsx` | สถานะระบบ IT ประจำวัน + Export Excel Executive Report | Admin, IT Support |
| `/admin/it-support` | `ITSupportAdminPage.jsx` | ระบบจัดการทิกเก็ตแจ้งซ่อม IT (เปลี่ยนสถานะ, Export Excel/PDF) | Admin, IT Support |
| `/admin/assets` | `AssetAdminPage.jsx` | ทะเบียนทรัพย์สินบริษัท (ผูกสิทธิ์ถือครองกับผู้ใช้งาน) | Admin, IT Support |
| `/admin/hostings` | `HostingAdminPage.jsx` | จัดการ Hosting & Domains | Admin, IT Support |
| `/settings` | `SystemSettingsPage.jsx` | ตั้งค่า Roles, Permissions และสิทธิ์ผู้ใช้งาน | Admin |
| `/settings/leave` | `LeaveSettingsPage.jsx` | ตั้งค่าโควต้าและประเภทการลา | Admin |
| `/settings/email-templates` | `EmailTemplatesPage.jsx` | จัดการเทมเพลตอีเมลแจ้งเตือน | Admin |
| `/profile` | `ProfilePage.jsx` | ข้อมูลส่วนตัวของผู้ใช้งานที่ล็อคอินอยู่ | Authenticated |

---

## 🔌 6. สรุป API Endpoints สำคัญ Backend (`backend/server.js`)

### Auth & System Settings
- `POST /api/auth/login`: เข้าสู่ระบบ
- `GET /api/settings/roles`: ดึงรายชื่อ Role ทั้งหมด
- `GET /api/settings/roles/:id/permissions`: ดึงสิทธิ์ของแต่ละ Role
- `GET /api/settings/permissions`: ดึงรายการสิทธิ์ทั้งหมด

### User & Employee Management
- `GET /api/employees`: ดึงรายการผู้ใช้งานระบบพร้อมจำนวนทรัพย์สินที่ถือครอง (`asset_count`)
- `GET /api/employees/:id`: ดึงข้อมูลผู้ใช้งานรายบุคคล
- `POST /api/employees`: เพิ่มผู้ใช้งานระบบใหม่
- `PUT /api/employees/:id`: แก้ไขข้อมูลผู้ใช้งานระบบ
- `POST /api/employees/:id/send-welcome-email`: ส่งอีเมลต้อนรับผู้ใช้ใหม่

### Leave Management
- `GET /api/leave/my-balances`: ดึงโควต้าวันลาของผู้ใช้ปัจจุบัน
- `GET /api/leave/my-requests`: ดึงประวัติคำขอลาของผู้ใช้ปัจจุบัน
- `POST /api/leave/requests`: ยื่นขอลางาน (รองรับ `multipart/form-data`)
- `GET /api/leave/approvals`: ดึงรายการคำขอลางานสำหรับผู้อนุมัติ/HR
- `PUT /api/leave/requests/:id/status`: ปรับสถานะคำขอลา (Approved / Rejected)

### IT Support & Health Checks
- `GET /api/it-categories`: ดึงหมวดหมู่การแจ้งซ่อม
- `GET /api/it-support`: ดึงทิกเก็ตแจ้งซ่อมทั้งหมด
- `POST /api/it-support`: สร้างทิกเก็ตแจ้งซ่อมใหม่
- `PUT /api/it-support/:id`: อัปเดตสถานะ/หมายเหตุงานซ่อม
- `GET /api/it-health-check/download-excel`: ส่งออกรายงาน IT Operations Report (ExcelJS Sheet 1-7)

---

## 🚨 7. ข้อควรระวังและเทคนิคสำคัญสำหรับนักพัฒนา (Developer Notes)

1. **การเปิดรันระบบและใช้งานในวง LAN**:
   - **รันด้วยไฟล์เดียว**: ดับเบิลคลิก `start_app.bat` ที่โฟลเดอร์หลัก เพื่อเปิดทั้ง Backend (5000) และ Frontend (5173)
   - **LAN IP**: เครื่องอื่นในวง Wi-Fi เข้าใช้งานผ่าน `http://192.168.99.147:5173`

2. **CSS fixed position vs animation transform bug**:
   - **ข้อระวัง**: เมื่อใช้ `position: fixed` ทำ Modal Overlay ห้ามนำตัว Modal ไปวางไว้ใน Container `<div>` ที่มี CSS class `animate-in` หรือ `transform` เด็ดขาด
   - **วิธีแก้**: ใช้ React Fragment (`<> ... </>`) วาง Modal ไว้นอกสุดของโครงสร้าง Component

3. **โครงสร้างฐานข้อมูล 22 ตาราง**:
   - ตารางประวัติพนักงานเดิม (HR Resume) ได้แก่ `employee_families`, `employee_educations`, `employee_experiences`, `employee_additional_info`, `employee_trainings` ถูกลบออกจาก MySQL แล้ว ห้ามเขียนคำสั่ง Query อ้างอิงถึงอีก

---

เอกสารนี้รวมบริบททั้งหมดของโปรเจกต์และรายการอัปเดตล่าสุด ณ วันที่ 6 สิงหาคม 2026 สมบูรณ์แล้ว สามารถให้ AI / นักพัฒนาทำงานต่อได้ทันทีครับ!
