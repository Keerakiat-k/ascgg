# System Configuration Guide (ASCG_G)

เอกสารนี้สรุปสิ่งที่ควรมีในโมดูล **"การตั้งค่าระบบองค์กร" (Organization Settings)** เพื่อให้ระบบ HR และ IT Support สามารถบริหารจัดการข้อมูล Master Data ได้อย่างมีประสิทธิภาพ

## 1. โครงสร้างการตั้งค่าองค์กร
โมดูลนี้ควรถูกออกแบบมาให้ Admin หรือ HR ระดับสูงเป็นผู้จัดการ ดังนี้:

### 1.1 โครงสร้างบริษัท (Company & Dept Structure)
*   **Company Management:** จัดการข้อมูลบริษัทในเครือ (เช่น AEP, AGC) รวมถึงการกำหนด `prefix` สำหรับการรันรหัสพนักงานและเลขทิกเก็ต[cite: 3]
*   **Department Hierarchy:** เพิ่ม/แก้ไข/ลบ รายชื่อแผนก เพื่อใช้จัดกลุ่มพนักงานและแยกเคส IT Support[cite: 3, 4]
*   **Position Management:** จัดการชื่อตำแหน่งงานในองค์กร[cite: 3, 4]

### 1.2 การจัดการสิทธิ์และความปลอดภัย (Access & Security)
*   **Role Management:** กำหนดสิทธิ์การเข้าถึงระบบสำหรับ Admin, HR และ Employee[cite: 3, 4]
*   **Password Policy:** ตั้งค่าความซับซ้อนของรหัสผ่าน (Password Complexity) เพื่อเพิ่มความปลอดภัยให้กับตาราง `employee_credentials`[cite: 3, 5]

### 1.3 ระบบอัตโนมัติและหมวดหมู่ (Automation & Categories)
*   **IT Support Categories:** ตั้งค่าหมวดหมู่ปัญหาไอที (เช่น Hardware, Software, Network) เพื่อการจัดลำดับงานที่แม่นยำ[cite: 3, 4]
*   **Announcement Types:** กำหนดประเภทข่าวสารภายในองค์กร (เช่น กิจกรรม, นโยบาย, ข่าวไอที)[cite: 3, 4]
*   **Email Domain Configuration:** กำหนดโดเมนอีเมลบริษัท เพื่อใช้ในการสร้างบัญชีอีเมลพนักงาน[cite: 4]

## 2. ฟังก์ชันการทำงานที่แนะนำ (Backend Controller Logic)
*   **CRUD Operations:** ทุกโมดูลการตั้งค่าต้องมีฟังก์ชันสร้าง (Create), อ่าน (Read), แก้ไข (Update) และลบ (Delete) ข้อมูล Master Data
*   **Data Integrity Check:** การลบข้อมูลแผนกหรือตำแหน่งงาน ต้องมีการตรวจสอบความสัมพันธ์ (Foreign Key) เพื่อป้องกันข้อมูลสูญหาย (ป้องกันการลบแผนกที่มีพนักงานสังกัดอยู่)[cite: 3]

## 3. สิ่งที่ควรพัฒนาเพิ่มในอนาคต (Technical Recommendations)
*   **System Audit Logs:** เพิ่มตารางเพื่อบันทึกว่า "ใคร" ทำการ "แก้ไข" ข้อมูลส่วนใดในระบบ[cite: 5]
*   **Data Export/Import:** ฟังก์ชันสำรองข้อมูล Master Data ออกเป็นไฟล์ CSV/Excel เพื่อความสะดวกในการย้ายข้อมูล[cite: 1]