const express = require('express');
const router = express.Router();

// นำเข้า Controller (ตรงนี้สำคัญมาก ถ้าหาไฟล์ไม่เจอ เซิร์ฟเวอร์จะ Crash ทันที)
const employeeController = require('../controllers/employeeController');
const { verifyToken, requirePermission } = require('../middlewares/authMiddleware');

// บังคับว่าทุก Route ในนี้ต้องมี Token ที่ถูกต้อง
router.use(verifyToken);

// API สำหรับดึงรหัสพนักงาน (GET)
router.get('/next-code', employeeController.getNextEmployeeCode);

// API สำหรับรับข้อมูลพนักงานใหม่
router.post('/', employeeController.createEmployee);
router.get('/', employeeController.getAllEmployees);

// API สำหรับดึงแผนกทั้งหมด
router.get('/departments', employeeController.getAllDepartments);

// API สำหรับดึงพนักงานที่ลาออกในเดือนนี้
router.get('/resigned/current-month', employeeController.getResignedEmployeesThisMonth);

// API สำหรับดึงพนักงานใหม่ในเดือนนี้
router.get('/new/current-month', employeeController.getNewEmployeesThisMonth);

// API สำหรับดึงสถิติ
router.get('/stats/turnover', employeeController.getTurnoverStats);
router.get('/stats/recent-activity', employeeController.getRecentActivity);

// API สำหรับบัญชีระบบ
router.get('/system-accounts', employeeController.getSystemAccounts);
router.put('/:id/role', employeeController.updateEmployeeRole);
router.put('/:id/reset-password', employeeController.resetEmployeePassword);

// API สำหรับแก้ไขข้อมูลพนักงาน
router.get('/:id', employeeController.getEmployeeById);
router.put('/:id', employeeController.updateEmployee);
router.put('/:id/status', employeeController.updateEmployeeStatus);
router.put('/:id/revoke-access', employeeController.revokeEmployeeAccess);
router.put('/:id/grant-access', employeeController.grantEmployeeAccess);
router.post('/:id/send-welcome-email', employeeController.sendWelcomeEmail);

// API สำหรับอัปโหลดรูปโปรไฟล์พนักงาน
const uploadProfile = require('../middleware/uploadProfile');
router.post('/:id/profile-image', uploadProfile.single('profile_image'), employeeController.uploadProfileImage);

module.exports = router;