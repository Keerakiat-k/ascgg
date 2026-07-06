const express = require('express');
const cors = require('cors');
require('dotenv').config();

// นำเข้า Routes (เช็คพาธให้ตรงกับโฟลเดอร์จริง)
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
const employeeController = require('./controllers/employeeController');
const itSupportController = require('./controllers/itSupportController');
const path = require('path');
const announcementController = require('./controllers/announcementController');
const settingsController = require('./controllers/settingsController');
const upload = require('./middleware/upload');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
// สำคัญมาก: ให้ Express อ่าน JSON ได้
app.use(express.json()); 

// เสิร์ฟไฟล์ Static ให้ Frontend เข้าถึงรูปภาพได้
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// ใช้งาน Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

app.get('/api/companies', employeeController.getAllCompanies);

// 🌟 Route สำหรับเปลี่ยนสถานะพนักงาน
app.put('/api/employees/:id/status', employeeController.updateEmployeeStatus);

// ==========================================
// Routes สำหรับระบบแจ้งปัญหา IT (IT Helpdesk)
// ==========================================
app.post('/api/it-support', itSupportController.createTicket);       // พนักงานส่งแจ้งปัญหา
app.get('/api/it-support', itSupportController.getAllTickets);       // Admin ดึงรายการทั้งหมด
app.put('/api/it-support/:id', itSupportController.updateTicket);    // Admin อัปเดตงาน

// Route สำหรับดึงและเพิ่มประกาศ
app.get('/api/announcements', announcementController.getAllAnnouncements);
app.post('/api/announcements', upload.single('coverImage'), announcementController.createAnnouncement);

// ==========================================
// Routes สำหรับ System Settings
// ==========================================
app.get('/api/settings/companies', settingsController.getCompanies);
app.post('/api/settings/companies', settingsController.createCompany);
app.put('/api/settings/companies/:id', settingsController.updateCompany);
app.delete('/api/settings/companies/:id', settingsController.deleteCompany);

app.get('/api/settings/departments', settingsController.getDepartments);
app.post('/api/settings/departments', settingsController.createDepartment);
app.put('/api/settings/departments/:id', settingsController.updateDepartment);
app.delete('/api/settings/departments/:id', settingsController.deleteDepartment);

app.get('/api/settings/roles', settingsController.getRoles);
app.put('/api/settings/roles/:id', settingsController.updateRole);

app.get('/api/settings/positions', settingsController.getPositions);
app.post('/api/settings/positions', settingsController.createPosition);
app.put('/api/settings/positions/:id', settingsController.updatePosition);
app.delete('/api/settings/positions/:id', settingsController.deletePosition);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});