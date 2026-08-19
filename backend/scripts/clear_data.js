const db = require('../config/db');
const bcrypt = require('bcryptjs');

const clearData = async () => {
    try {
        console.log('--- Starting Data Clearance ---');

        // 1. Disable Foreign Key Checks to safely truncate tables
        await db.query('SET FOREIGN_KEY_CHECKS = 0');

        // 2. Clear Announcements
        console.log('Clearing announcements...');
        await db.query('TRUNCATE TABLE announcements');

        // 3. Clear IT Supports
        console.log('Clearing it_supports...');
        await db.query('TRUNCATE TABLE it_supports');

        // 4. Clear Employee and related tables
        console.log('Clearing employees and related tables...');
        const tablesToClear = [
            'employee_credentials',
            'employee_additional_info',
            'employee_educations',
            'employee_experiences',
            'employee_families',
            'employee_trainings',
            'employees'
        ];

        for (const table of tablesToClear) {
            await db.query(`TRUNCATE TABLE ${table}`);
            console.log(`- Truncated ${table}`);
        }

        // 5. Re-enable Foreign Key Checks
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Successfully cleared all requested data.');

        // 6. Create Admin and HR users
        console.log('--- Creating Initial Users ---');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create Admin (Role 1)
        const [adminResult] = await db.query(
            `INSERT INTO employees (employee_code, email, national_id, hire_date, role_id, status) VALUES (?, ?, ?, CURDATE(), ?, 'Active')`,
            ['ADM-001', 'admin', '0000000000001', 1]
        );
        await db.query(
            `INSERT INTO employee_credentials (employee_id, password_hash) VALUES (?, ?)`,
            [adminResult.insertId, hashedPassword]
        );
        console.log('Created Admin account (Email: admin)');

        // Create HR (Role 2)
        const [hrResult] = await db.query(
            `INSERT INTO employees (employee_code, email, national_id, hire_date, role_id, status) VALUES (?, ?, ?, CURDATE(), ?, 'Active')`,
            ['HR-001', 'hr', '0000000000002', 2]
        );
        await db.query(
            `INSERT INTO employee_credentials (employee_id, password_hash) VALUES (?, ?)`,
            [hrResult.insertId, hashedPassword]
        );
        console.log('Created HR account (Email: hr)');

        console.log('--- Data Clearance & Seeding Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Error occurred:', error);
        process.exit(1);
    }
};

clearData();
