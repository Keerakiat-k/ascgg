require('dotenv').config();
const mysql = require('mysql2/promise');

async function createCategoryTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ascg_g_system'
  });

  try {
    console.log('สร้างตาราง it_categories...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS it_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('เพิ่มข้อมูลเริ่มต้น (it_categories)...');
    const itCats = [
      'อุปกรณ์คอมพิวเตอร์ (Hardware)',
      'โปรแกรมและซอฟต์แวร์ (Software)',
      'อินเทอร์เน็ตและเครือข่าย (Network)',
      'ระบบฐานข้อมูล (Database/ERP)',
      'อื่นๆ (Others)'
    ];
    for (const cat of itCats) {
      await connection.execute('INSERT IGNORE INTO it_categories (name) VALUES (?)', [cat]);
    }

    console.log('สร้างตาราง announcement_types...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS announcement_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('เพิ่มข้อมูลเริ่มต้น (announcement_types)...');
    const annTypes = [
      'ประกาศสำคัญ',
      'กิจกรรม',
      'ทั่วไป'
    ];
    for (const type of annTypes) {
      await connection.execute('INSERT IGNORE INTO announcement_types (name) VALUES (?)', [type]);
    }

    console.log('สำเร็จ! สร้างตารางหมวดหมู่เรียบร้อยแล้ว');
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  } finally {
    await connection.end();
  }
}

createCategoryTables();
