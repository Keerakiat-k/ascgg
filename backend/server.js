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
const { verifyToken, requirePermission } = require('./middlewares/authMiddleware');

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
app.post('/api/it-support', itSupportController.createTicket);                      // พนักงาน/บุคคลทั่วไปส่งแจ้งปัญหา (Public)
app.get('/api/it-support', verifyToken, itSupportController.getAllTickets);          // Admin ดึงรายการทั้งหมด (Protected)
app.put('/api/it-support/:id', verifyToken, itSupportController.updateTicket);       // Admin อัปเดตงาน (Protected)



// Route สำหรับดึงและเพิ่มประกาศ
const announcementRoutes = require('./routes/announcements');
app.use('/api/announcements', announcementRoutes);

// Route สำหรับจัดการ Hosting
const hostingRoutes = require('./routes/hostings');
app.use('/api/hostings', verifyToken, hostingRoutes);

// Route สำหรับระบบทะเบียนทรัพย์สิน (Asset Management)
const assetRoutes = require('./routes/assets');
app.use('/api/assets', verifyToken, assetRoutes);

// Route สำหรับระบบการลา (Leave Management)
const leaveRoutes = require('./routes/leaveRoutes');
app.use('/api/leave', verifyToken, leaveRoutes);

// Route สำหรับระบบจัดการเครือข่ายและเซิร์ฟเวอร์ (Network & Infrastructure Management)
const networkRoutes = require('./routes/networkRoutes');
app.use('/api/network-devices', networkRoutes);

// ==========================================
// Routes สำหรับ System Settings
// ==========================================
app.use('/api/settings', verifyToken);
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

app.get('/api/settings/permissions', settingsController.getPermissions);
app.get('/api/settings/roles/:id/permissions', settingsController.getRolePermissions);
app.put('/api/settings/roles/:id/permissions', settingsController.updateRolePermissions);

app.get('/api/settings/positions', settingsController.getPositions);
app.post('/api/settings/positions', settingsController.createPosition);
app.put('/api/settings/positions/:id', settingsController.updatePosition);
app.delete('/api/settings/positions/:id', settingsController.deletePosition);

// ==========================================
// Routes สำหรับ Categories
// ==========================================
const categoriesRoutes = require('./routes/categoriesRoutes');
app.use('/api', categoriesRoutes);

// ==========================================
// Routes สำหรับ Email Settings และ Announcements
// ==========================================
const emailSettingsRoutes = require('./routes/emailSettingsRoutes');
app.use('/api', verifyToken, emailSettingsRoutes);

const bccGroupsRoutes = require('./routes/bccGroupsRoutes');
app.use('/api/bcc-groups', verifyToken, bccGroupsRoutes);

// Routes สำหรับ IT System Health Check
const itHealthRoutes = require('./routes/itHealthRoutes');
app.use('/api', itHealthRoutes);


// Global Error Handler (ดัก Error จาก Multer หรืออื่นๆ ให้ตอบกลับเป็น JSON)
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);
    res.status(500).json({
        status: 'error',
        message: err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port} (LAN Access Enabled)`);
});