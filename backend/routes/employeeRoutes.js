const express = require('express');
const router = express.Router();

// นำเข้า Controller (ตรงนี้สำคัญมาก ถ้าหาไฟล์ไม่เจอ เซิร์ฟเวอร์จะ Crash ทันที)
const employeeController = require('../controllers/employeeController');

// API สำหรับดึงรหัสพนักงาน (GET)
router.get('/next-code', employeeController.getNextEmployeeCode);

// API สำหรับรับข้อมูลพนักงานใหม่
router.post('/', employeeController.createEmployee);
router.get('/', employeeController.getAllEmployees);

// API สำหรับแก้ไขข้อมูลพนักงาน
router.get('/:id', employeeController.getEmployeeById);
router.put('/:id', employeeController.updateEmployee);

module.exports = router;