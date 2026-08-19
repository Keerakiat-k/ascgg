const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS hostings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        domain_name VARCHAR(255) NOT NULL,
        website_url VARCHAR(255) NULL,
        website_username VARCHAR(255) NULL,
        website_password VARCHAR(255) NULL,
        email_provider VARCHAR(255) NULL,
        email_username VARCHAR(255) NULL,
        email_password VARCHAR(255) NULL,
        registration_date DATE NULL,
        expiration_date DATE NULL,
        status VARCHAR(50) DEFAULT 'Active',
        note TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Table hostings created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
