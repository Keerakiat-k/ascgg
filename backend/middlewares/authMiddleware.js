const jwt = require('jsonwebtoken');
require('dotenv').config();

// 1. ตรวจสอบว่าผู้ใช้ Login หรือยัง (มี Token ที่ถูกต้องไหม)
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];

    if (!bearerHeader) {
        return res.status(401).json({ status: 'error', message: 'Access Denied. No token provided.' });
    }

    const token = bearerHeader.split(' ')[1]; // แยกคำว่า "Bearer " ออกจาก Token

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // นำข้อมูล user (id, role) ที่ถอดรหัสได้ แปะไว้ใน Request
        next(); // ส่งต่อให้ Controller ทำงาน
    } catch (error) {
        return res.status(403).json({ status: 'error', message: 'Invalid or Expired Token.' });
    }
};

// 2. ตรวจสอบสิทธิ์ (Role-Based Access Control)
// ใช้เทคนิค Closure รับค่า Array ของ Roles ที่อนุญาต
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ status: 'error', message: 'Access Denied. Role not found.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'Forbidden. You do not have permission to perform this action.' 
            });
        }
        
        next();
    };
};

module.exports = { verifyToken, requireRole };