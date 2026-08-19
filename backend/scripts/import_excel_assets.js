const xlsx = require('xlsx');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const excelDateToJSDate = (excelDate) => {
  if (!excelDate) return null;
  if (typeof excelDate === 'number') {
    // Excel dates are number of days since 1899-12-31
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
  }
  // Try to parse string dates
  const dateStr = String(excelDate);
  const parts = dateStr.split(/[/-]/);
  if (parts.length === 3) {
    // Assuming DD/MM/YYYY or YYYY-MM-DD
    if (parts[0].length === 4) {
      return dateStr;
    }
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return null;
};

const runImport = async () => {
  let connection;
  try {
    const filePath = path.join(__dirname, '../../Server& Device Soi-10.xlsx');
    console.log(`Reading Excel file: ${filePath}`);
    const workbook = xlsx.readFile(filePath);
    
    // The data is in the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Read raw array data
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    // The first 2 rows are headers
    const rows = data.slice(2);
    
    // DB Connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ascg_g_db'
    });
    
    console.log('Connected to database. Starting import...');
    let successCount = 0;
    
    for (const row of rows) {
      // Avoid empty rows (where Asset No and Name are missing)
      if (!row[1] && !row[7]) continue; 
      
      const assetCode = row[1] || `IT-UNK-${Date.now()}`;
      const name = row[7] || `${row[11] || ''} ${row[12] || ''}`.trim() || 'Unknown Asset';
      const category = row[10] || 'Others';
      const brand = row[11] || null;
      const model = row[12] || null;
      const serialNumber = row[13] || null;
      
      // Specs
      const cpu = row[14] || null;
      const ram = row[15] || null;
      const storage = row[16] || null;
      const displaySize = row[17] || null;
      
      // Other Details
      const purchaseDate = excelDateToJSDate(row[3]);
      const price = parseFloat(row[4]) || null;
      
      let location = row[6] || 'Soi-10'; // Default to Soi-10 if not provided
      
      // Gather notes from multiple columns (PO, Pur. By, Dep., Other, User)
      const notesArr = [];
      if (row[8]) notesArr.push(`User: ${row[8]}`);
      if (row[2]) notesArr.push(`PO: ${row[2]}`);
      if (row[5]) notesArr.push(`Pur. By: ${row[5]}`);
      if (row[9]) notesArr.push(`Dep: ${row[9]}`);
      if (row[18]) notesArr.push(`Other: ${row[18]}`);
      const notes = notesArr.length > 0 ? notesArr.join(' | ') : null;
      
      // Set status based on User presence
      const status = row[8] ? 'In Use' : 'Available';
      
      // Licenses
      const osLicense = row[19] || null;
      const osKey = row[20] || null;
      const officeLicense = row[21] || null;
      const officeKey = row[22] || null;

      // 1. Insert Asset
      const insertAssetQuery = `
        INSERT INTO assets (
          asset_code, name, category, purchase_date, price, 
          status, location, brand, model, serial_number, 
          cpu, ram, storage, display_size, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const assetParams = [
        assetCode, name, category, purchaseDate, price,
        status, location, brand, model, serialNumber,
        cpu, ram, storage, displaySize, notes
      ];
      
      try {
        const [result] = await connection.query(insertAssetQuery, assetParams);
        const assetId = result.insertId;
        
        // 2. Insert OS License if present
        if (osLicense || osKey) {
          await connection.query(`
            INSERT INTO asset_licenses (asset_id, software_type, software_name, license_key)
            VALUES (?, ?, ?, ?)
          `, [assetId, 'OS', osLicense || 'Unknown OS', osKey || '']);
        }
        
        // 3. Insert Office License if present
        if (officeLicense || officeKey) {
          await connection.query(`
            INSERT INTO asset_licenses (asset_id, software_type, software_name, license_key)
            VALUES (?, ?, ?, ?)
          `, [assetId, 'Office', officeLicense || 'Unknown Office', officeKey || '']);
        }
        
        successCount++;
        console.log(`Imported: ${assetCode} - ${name}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Skipped duplicate Asset Code: ${assetCode}`);
        } else {
          console.error(`Error importing row: ${assetCode}`, err.message);
        }
      }
    }
    
    console.log(`\nImport Summary: Successfully imported ${successCount} assets.`);
    
  } catch (error) {
    console.error('Import script failed:', error);
  } finally {
    if (connection) await connection.end();
  }
};

runImport();
