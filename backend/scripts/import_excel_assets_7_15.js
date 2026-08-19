const xlsx = require('xlsx');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const excelDateToJSDate = (excelDate) => {
  if (!excelDate) return null;
  if (typeof excelDate === 'number') {
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  const dateStr = String(excelDate);
  const parts = dateStr.split(/[/-]/);
  if (parts.length === 3) {
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
    const filePath = path.join(__dirname, '../../Server& Device 7,15.xlsx');
    console.log(`Reading Excel file: ${filePath}`);
    const workbook = xlsx.readFile(filePath);
    
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const rows = data.slice(2);
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ascg_g_db'
    });
    
    console.log('Connected to database. Starting import...');
    let successCount = 0;
    
    for (const row of rows) {
      if (!row[1] && !row[5]) continue; 
      
      const assetCode = row[1] || `IT-UNK-${Date.now()}`;
      const name = row[5] || `${row[9] || ''} ${row[10] || ''}`.trim() || 'Unknown Asset';
      const category = row[8] || 'Others';
      const brand = row[9] || null;
      const model = row[10] || null;
      const serialNumber = row[11] || null;
      
      const cpu = row[12] || null;
      const ram = row[13] || null;
      const storage = row[14] || null;
      const displaySize = row[15] || null;
      
      const purchaseDate = excelDateToJSDate(row[2]);
      const price = parseFloat(row[20]) || null;
      
      let location = row[4] || 'Soi-7/15'; 
      
      const notesArr = [];
      if (row[6]) notesArr.push(`User: ${row[6]}`);
      if (row[3]) notesArr.push(`Pur. By: ${row[3]}`);
      if (row[7]) notesArr.push(`Dep: ${row[7]}`);
      if (row[16]) notesArr.push(`Other: ${row[16]}`);
      const notes = notesArr.length > 0 ? notesArr.join(' | ') : null;
      
      const status = row[6] ? 'In Use' : 'Available';
      
      const osLicense = row[17] || null;
      const navLicense = row[18] || null;
      const rdpLicense = row[19] || null;

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
        
        if (osLicense) {
          await connection.query(`
            INSERT INTO asset_licenses (asset_id, software_type, software_name, license_key)
            VALUES (?, ?, ?, ?)
          `, [assetId, 'OS', osLicense, '']);
        }
        
        if (navLicense) {
          await connection.query(`
            INSERT INTO asset_licenses (asset_id, software_type, software_name, license_key)
            VALUES (?, ?, ?, ?)
          `, [assetId, 'Extra Software', `NAV: ${navLicense}`, '']);
        }

        if (rdpLicense) {
          await connection.query(`
            INSERT INTO asset_licenses (asset_id, software_type, software_name, license_key)
            VALUES (?, ?, ?, ?)
          `, [assetId, 'Extra Software', `RDP Server: ${rdpLicense}`, '']);
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
