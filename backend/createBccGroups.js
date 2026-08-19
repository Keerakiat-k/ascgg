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
    console.log('Creating bcc_groups table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bcc_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Check if empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM bcc_groups');
    if (rows[0].count === 0) {
      console.log('Inserting initial data...');
      const initialData = [
        ['AIC', 'pannakorn.s@ascggroup.com'],
        ['AIC_ALL', 'ascggroup_all@ascggroup.com'],
        ['AIA_ALL', 'interprocorp_all@interprocorp.com'],
        ['SynergQ_ALL', 'synergyqthai_all@synergyqthai.com'],
        ['QPM_ALL', 'qpm_all@qpmprevention.com'],
        ['AEP_ALL', 'aep_all@ascgengineering.com']
      ];

      for (const [label, email] of initialData) {
        await pool.query('INSERT INTO bcc_groups (label, email) VALUES (?, ?)', [label, email]);
      }
      console.log('Inserted initial BCC groups.');
    } else {
      console.log('Table bcc_groups already has data.');
    }

    console.log('Database updated successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

run();
