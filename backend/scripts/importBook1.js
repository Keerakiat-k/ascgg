const xlsx = require('xlsx');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function importData() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ascg_db'
  });

  try {
    const wb = xlsx.readFile('../Book1.xlsx');
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(ws);

    console.log(`Found ${data.length} rows to process.`);

    let insertedCount = 0;
    
    // We will find employee by first name to assign if possible
    const [employees] = await pool.query('SELECT id, first_name_en, first_name_th FROM employees');

    for (const row of data) {
      // Validate that this row actually looks like an asset (has asset code)
      const assetCode = row['__EMPTY_3'];
      if (!assetCode || !assetCode.toString().startsWith('ASCG') && assetCode !== 'Device') {
        continue;
      }

      const company = row['Computer'] ? row['Computer'].toString() : '';
      const location = row['Device'] ? row['Device'].toString() : '';
      const employeeName = row['__EMPTY_4'] ? row['__EMPTY_4'].toString() : '';
      const department = row['__EMPTY_5'] ? row['__EMPTY_5'].toString() : '';
      const category = row['__EMPTY_6'] ? row['__EMPTY_6'].toString() : '';
      const brand = row['__EMPTY_7'] ? row['__EMPTY_7'].toString() : '';
      const model = row['__EMPTY_8'] ? row['__EMPTY_8'].toString() : '';
      const serialNumber = row['__EMPTY_9'] ? row['__EMPTY_9'].toString() : '';
      const cpu = row['__EMPTY_10'] ? row['__EMPTY_10'].toString() : '';
      const ram = row['__EMPTY_11'] ? row['__EMPTY_11'].toString() : '';
      const storage = row['__EMPTY_12'] ? row['__EMPTY_12'].toString() : '';
      const displaySize = row['__EMPTY_13'] ? row['__EMPTY_13'].toString() : '';
      const osLicense = row['__EMPTY_15'] ? row['__EMPTY_15'].toString() : '';
      const officeLicense = row['__EMPTY_16'] ? row['__EMPTY_16'].toString() : '';

      // Create a logical name for the asset
      let name = `${brand} ${model}`.trim();
      if (!name) name = category;
      
      let assigned_to = null;
      if (employeeName) {
        // Simple heuristic: check if first name part matches any employee
        const firstNamePart = employeeName.split('.')[0].toLowerCase();
        const matchedEmp = employees.find(e => 
          (e.first_name_en && e.first_name_en.toLowerCase().includes(firstNamePart)) ||
          (e.first_name_th && e.first_name_th.toLowerCase().includes(firstNamePart))
        );
        if (matchedEmp) {
          assigned_to = matchedEmp.id;
        }
      }

      try {
        await pool.execute(
          `INSERT INTO assets (
            asset_code, name, category, status, assigned_to, 
            company, location, brand, model, serial_number, cpu, ram, storage, display_size, os_license, office_license
           )
           VALUES (?, ?, ?, 'In Use', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
            name=VALUES(name), category=VALUES(category), company=VALUES(company), location=VALUES(location), 
            brand=VALUES(brand), model=VALUES(model), serial_number=VALUES(serial_number), cpu=VALUES(cpu), 
            ram=VALUES(ram), storage=VALUES(storage), display_size=VALUES(display_size), os_license=VALUES(os_license), 
            office_license=VALUES(office_license)`,
          [
            assetCode.toString(), name, category, assigned_to,
            company, location, brand, model, serialNumber, cpu, ram, storage, displaySize, osLicense, officeLicense
          ]
        );
        insertedCount++;
      } catch (err) {
        console.error(`Error inserting asset ${assetCode}:`, err.message);
      }
    }

    console.log(`Successfully processed and inserted/updated ${insertedCount} assets.`);
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    pool.end();
  }
}

importData();
