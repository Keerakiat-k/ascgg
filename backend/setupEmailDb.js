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
      CREATE TABLE IF NOT EXISTS email_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        smtp_host VARCHAR(255),
        smtp_port INT,
        smtp_user VARCHAR(255),
        smtp_pass VARCHAR(255),
        smtp_secure BOOLEAN DEFAULT false,
        from_email VARCHAR(255),
        from_name VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    const [rows] = await pool.query('SELECT * FROM email_settings');
    if(rows.length === 0) {
      await pool.query(`
        INSERT INTO email_settings 
        (smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, from_email, from_name) 
        VALUES ('mail.company.com', 587, 'info@company.com', '', false, 'info@company.com', 'Admin ASCG')
      `);
      console.log('Seeded email_settings');
    } else {
      console.log('email_settings already exists');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
