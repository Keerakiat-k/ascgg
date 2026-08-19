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
    console.log('Clearing old assets and licenses data...');
    // DELETE CASCADE will clear licenses too
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    await pool.execute('TRUNCATE TABLE asset_licenses');
    await pool.execute('TRUNCATE TABLE assets');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

    const wb = xlsx.readFile('../Book2.xlsx');
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(ws, {header: 1});

    console.log(`Found ${data.length} rows to process.`);

    let insertedCount = 0;
    const [employees] = await pool.query('SELECT id, first_name_en, first_name_th FROM employees');

    function getComment(colIndex, R) {
      const colStr = xlsx.utils.encode_col(colIndex);
      const cell = ws[colStr + R];
      if (cell && cell.c && cell.c.length > 0) return cell.c[0].t;
      return '';
    }

    for (let r = 0; r < data.length; r++) {
      const row = data[r];
      const R = r + 1;
      
      if (!row || row.length < 8) continue;
      
      let assetCode = row[7] ? row[7].toString().trim() : '';
      const hasHardwareSpecs = row[11] && row[14]; // Brand and CPU
      
      if (!assetCode.match(/^(ASCG|ASPD|CST|HP-|Device)/i) && !hasHardwareSpecs) {
        continue;
      }

      if (!assetCode) {
        assetCode = `VIP-Row${R}`;
      }

      // Collect generic notes from columns before licenses (e.g. Price, Asset Code, etc)
      let genericNotesArr = [];
      [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].forEach(c => {
        const comment = getComment(c, R);
        if (comment) genericNotesArr.push(comment);
      });
      const genericNotes = genericNotesArr.join('\n\n---\n\n');

      const company = row[5] ? row[5].toString() : '';
      const location = row[6] ? row[6].toString() : '';
      const employeeName = row[8] ? row[8].toString() : '';
      const category = row[10] ? row[10].toString() : '';
      const brand = row[11] ? row[11].toString() : '';
      const model = row[12] ? row[12].toString() : '';
      const serialNumber = row[13] ? row[13].toString() : '';
      const cpu = row[14] ? row[14].toString() : '';
      const ram = row[15] ? row[15].toString() : '';
      const storage = row[16] ? row[16].toString() : '';
      const displaySize = row[17] ? row[17].toString() : '';
      
      // Licenses Data
      const osLicense = row[19] ? row[19].toString() : '';
      const osLicenseKey = row[20] ? row[20].toString() : '';
      const osComment = [getComment(19, R), getComment(20, R)].filter(Boolean).join('\n');

      const officeLicense = row[21] ? row[21].toString() : '';
      const officeLicenseKey = row[22] ? row[22].toString() : '';
      const officeComment = [getComment(21, R), getComment(22, R)].filter(Boolean).join('\n');

      const extraSoftware1 = row[23] ? row[23].toString() : '';
      const extraSoftwareKey1 = row[24] ? row[24].toString() : '';
      const extraComment1 = [getComment(23, R), getComment(24, R)].filter(Boolean).join('\n');

      const extraSoftware2 = row[25] ? row[25].toString() : '';
      const extraSoftwareKey2 = row[26] ? row[26].toString() : '';
      const extraComment2 = [getComment(25, R), getComment(26, R)].filter(Boolean).join('\n');

      let name = `${brand} ${model}`.trim();
      if (!name) name = category;
      
      let assigned_to = null;
      if (employeeName) {
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
        const [result] = await pool.execute(
          `INSERT INTO assets (
            asset_code, name, category, status, assigned_to, 
            company, location, brand, model, serial_number, cpu, ram, storage, display_size, notes
           )
           VALUES (?, ?, ?, 'In Use', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            assetCode.toString(), name, category, assigned_to,
            company, location, brand, model, serialNumber, cpu, ram, storage, displaySize, genericNotes
          ]
        );
        
        const assetId = result.insertId;

        // Insert OS
        if (osLicense || osLicenseKey || osComment) {
          await pool.execute(
            `INSERT INTO asset_licenses (asset_id, software_type, software_name, license_key, notes) VALUES (?, ?, ?, ?, ?)`,
            [assetId, 'OS', osLicense, osLicenseKey, osComment]
          );
        }

        // Insert Office
        if (officeLicense || officeLicenseKey || officeComment) {
          await pool.execute(
            `INSERT INTO asset_licenses (asset_id, software_type, software_name, license_key, notes) VALUES (?, ?, ?, ?, ?)`,
            [assetId, 'Office', officeLicense, officeLicenseKey, officeComment]
          );
        }

        // Insert Extra Software 1
        if (extraSoftware1 || extraSoftwareKey1 || extraComment1) {
          await pool.execute(
            `INSERT INTO asset_licenses (asset_id, software_type, software_name, license_key, notes) VALUES (?, ?, ?, ?, ?)`,
            [assetId, 'Extra Software', extraSoftware1, extraSoftwareKey1, extraComment1]
          );
        }

        // Insert Extra Software 2
        if (extraSoftware2 || extraSoftwareKey2 || extraComment2) {
          await pool.execute(
            `INSERT INTO asset_licenses (asset_id, software_type, software_name, license_key, notes) VALUES (?, ?, ?, ?, ?)`,
            [assetId, 'Extra Software', extraSoftware2, extraSoftwareKey2, extraComment2]
          );
        }

        insertedCount++;
      } catch (err) {
        console.error(`Error inserting asset ${assetCode}:`, err.message);
      }
    }

    console.log(`Successfully processed and inserted ${insertedCount} assets with split licenses.`);
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    pool.end();
  }
}

importData();
