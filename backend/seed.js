const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function runSeeder() {
    console.log('🌱 กำลังเริ่มกระบวนการ Seeding ข้อมูล...');
    
    try {
        // 1. เพิ่มข้อมูล Role (หากยังไม่มี)
        await db.execute(`
            INSERT IGNORE INTO roles (id, name, description) 
            VALUES 
            (1, 'Admin', 'ผู้ดูแลระบบสูงสุด'),
            (2, 'HR', 'ฝ่ายทรัพยากรบุคคล'),
            (3, 'Employee', 'พนักงานทั่วไป')
        `);
        console.log('✅ 1. เพิ่มข้อมูล Roles สำเร็จ');

        // 2. เพิ่มข้อมูลพนักงาน Admin (id = 1)
        await db.execute(`
            INSERT IGNORE INTO employees (id, employee_code, email, hire_date, role_id, status) 
            VALUES (1, 'EMP-001', 'admin@company.com', CURDATE(), 1, 'Active')
        `);
        console.log('✅ 2. เพิ่มข้อมูลพนักงาน (admin@company.com) สำเร็จ');

        // 3. สร้างรหัสผ่านที่เข้ารหัสแล้ว (Hash)
        const plainPassword = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        // 4. บันทึกลงตาราง employee_credentials
        // ใช้ INSERT ... ON DUPLICATE KEY UPDATE เพื่อให้รันซ้ำได้โดยไม่พัง
        await db.execute(`
            INSERT INTO employee_credentials (employee_id, password_hash) 
            VALUES (1, ?)
            ON DUPLICATE KEY UPDATE password_hash = ?
        `, [hashedPassword, hashedPassword]);
        console.log(`✅ 3. ตั้งค่ารหัสผ่านสำเร็จ (Password: ${plainPassword})`);

        console.log('🎉 Seeding เสร็จสมบูรณ์! พร้อมใช้งานแล้ว');
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการ Seeding:', error);
    } finally {
        process.exit(); // ปิดการทำงานของสคริปต์
    }
}

runSeeder();