const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    try {
      await pool.query('ALTER TABLE email_settings ADD COLUMN type VARCHAR(10) DEFAULT "IT"');
      console.log('Added type column');
    } catch(e) {
      if (e.code !== 'ER_DUP_FIELDNAME') {
        throw e;
      }
    }
    
    await pool.query('UPDATE email_settings SET type = "IT" WHERE type IS NULL OR type = ""');
    
    const [rows] = await pool.query('SELECT id FROM email_settings WHERE type = "HR"');
    if (rows.length === 0) {
      await pool.query('INSERT INTO email_settings (type, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, from_email, from_name) VALUES ("HR", "", 587, "", "", false, "", "HR Department")');
      console.log('Inserted HR settings row');
    }
    console.log('Database updated successfully');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
