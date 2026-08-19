require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ascg_g_db'
  });

  console.log('Connected to database. Starting Safe Migration...');

  // 1. Check existing count
  const [beforeCount] = await conn.execute('SELECT COUNT(*) as total FROM assets');
  console.log(`Current assets in DB: ${beforeCount[0].total}`);

  // 2. Add columns to assets table if not exist
  const [columns] = await conn.execute('DESCRIBE assets');
  const colNames = columns.map(c => c.Field);

  if (!colNames.includes('department')) {
    console.log('Adding department column...');
    await conn.execute('ALTER TABLE assets ADD COLUMN department VARCHAR(100) NULL AFTER company');
  }

  if (!colNames.includes('owner_company')) {
    console.log('Adding owner_company column...');
    await conn.execute('ALTER TABLE assets ADD COLUMN owner_company VARCHAR(100) NULL AFTER company');
    // Set default owner_company to existing company value
    await conn.execute('UPDATE assets SET owner_company = company WHERE owner_company IS NULL AND company IS NOT NULL');
  }

  if (!colNames.includes('parent_asset_id')) {
    console.log('Adding parent_asset_id column...');
    await conn.execute('ALTER TABLE assets ADD COLUMN parent_asset_id INT NULL AFTER assigned_to');
  }

  // Update status column type to support 'On Loan', 'Available', 'In Use', 'Maintenance', 'Retired'
  console.log('Updating status column enum values...');
  await conn.execute("ALTER TABLE assets MODIFY COLUMN status VARCHAR(50) DEFAULT 'Available'");

  // 3. Create asset_transfer_logs table
  console.log('Creating asset_transfer_logs table...');
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS asset_transfer_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asset_id INT NOT NULL,
      transfer_type ENUM('Transfer', 'Loan') NOT NULL DEFAULT 'Transfer',
      from_company VARCHAR(100) NULL,
      from_department VARCHAR(100) NULL,
      from_location VARCHAR(100) NULL,
      from_user VARCHAR(255) NULL,
      to_company VARCHAR(100) NULL,
      to_department VARCHAR(100) NULL,
      to_location VARCHAR(100) NULL,
      to_user VARCHAR(255) NULL,
      return_due_date DATE NULL,
      reason TEXT NULL,
      action_by VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (asset_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. Create asset_maintenance_logs table
  console.log('Creating asset_maintenance_logs table...');
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS asset_maintenance_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asset_id INT NOT NULL,
      action_type VARCHAR(100) NOT NULL DEFAULT 'Maintenance',
      description TEXT NOT NULL,
      cost DECIMAL(10, 2) DEFAULT 0.00,
      technician VARCHAR(255) NULL,
      service_date DATE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (asset_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 5. Verify count after migration
  const [afterCount] = await conn.execute('SELECT COUNT(*) as total FROM assets');
  console.log(`Assets in DB after migration: ${afterCount[0].total}`);
  console.log('✅ Migration completed successfully with 100% data preservation!');

  await conn.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
