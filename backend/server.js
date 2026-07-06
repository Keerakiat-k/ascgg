const express = require('express');
const cors = require('cors');
require('dotenv').config();

// นำเข้า Routes (เช็คพาธให้ตรงกับโฟลเดอร์จริง)
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
const employeeController = require('./controllers/employeeController');
const itSupportController = require('./controllers/itSupportController');
const announcementController = require('./controllers/announcementController');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
// สำคัญมาก: ให้ Express อ่าน JSON ได้
app.use(express.json()); 

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

// Route สำหรับดึงประกาศ
app.get('/api/announcements', announcementController.getAllAnnouncements);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});