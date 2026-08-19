const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ascg_g_db'
  });

  try {
    console.log('Starting DB Migration for Dynamic Permissions...');

    // 1. Create permissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(50) NOT NULL UNIQUE,
        label VARCHAR(100) NOT NULL,
        module VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created permissions table');

    // 2. Create role_permissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      )
    `);
    console.log('Created role_permissions table');

    // 3. Insert Baseline Permissions
    const baselinePermissions = [
      { key: 'view_dashboard', label: 'ดูหน้าแดชบอร์ด', module: 'General' },
      { key: 'manage_employees', label: 'จัดการข้อมูลพนักงาน', module: 'HR' },
      { key: 'manage_announcements', label: 'จัดการประกาศข่าวสาร', module: 'HR' },
      { key: 'manage_assets', label: 'จัดการทะเบียนทรัพย์สิน', module: 'IT' },
      { key: 'manage_it_support', label: 'จัดการตั๋วแจ้งซ่อม IT', module: 'IT' },
      { key: 'manage_settings', label: 'ตั้งค่าระบบหลัก', module: 'System' }
    ];

    for (const p of baselinePermissions) {
      await connection.execute(
        'INSERT IGNORE INTO permissions (key_name, label, module) VALUES (?, ?, ?)',
        [p.key, p.label, p.module]
      );
    }
    console.log('Inserted baseline permissions');

    // Fetch all permission IDs to dynamically map them
    const [perms] = await connection.execute('SELECT id, key_name FROM permissions');
    const permMap = perms.reduce((acc, p) => ({ ...acc, [p.key_name]: p.id }), {});

    // 4. Baseline Role-Permission Mapping
    // Note: We use INSERT IGNORE to prevent duplicate errors
    const mappings = [
      // Admin (Role ID 1) - Gets EVERYTHING
      { role: 1, keys: Object.keys(permMap) },
      
      // HR (Role ID 2)
      { role: 2, keys: ['view_dashboard', 'manage_employees', 'manage_announcements'] },
      
      // Employee (Role ID 3)
      { role: 3, keys: ['view_dashboard'] },

      // IT Support (Role ID 4)
      { role: 4, keys: ['view_dashboard', 'manage_assets', 'manage_it_support'] },

      // Manager (Role ID 5)
      { role: 5, keys: ['view_dashboard'] }
    ];

    for (const m of mappings) {
      for (const k of m.keys) {
        if (permMap[k]) {
          await connection.execute(
            'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
            [m.role, permMap[k]]
          );
        }
      }
    }
    console.log('Inserted baseline role_permissions mappings');
    console.log('Migration Completed Successfully!');

  } catch (error) {
    console.error('Migration Failed:', error);
  } finally {
    await connection.end();
  }
}

runMigration();
