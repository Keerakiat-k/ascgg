const db = require('../config/db');
const ExcelJS = require('../../frontend/node_modules/exceljs');
const path = require('path');

async function setupAndImport() {
  console.log('--- Setting up IT Health Check Tables ---');
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`it_health_checks\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`check_date\` DATE NOT NULL,
      \`branch_code\` VARCHAR(50) NOT NULL,
      \`branch_name\` VARCHAR(100) NOT NULL,
      \`reporter_name\` VARCHAR(100) DEFAULT 'นาย ธนกฤต กิจสมฝัน',
      \`reporter_role\` VARCHAR(100) DEFAULT 'IT Supports',
      \`general_notes\` TEXT NULL,
      \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY \`idx_date_branch\` (\`check_date\`,\`branch_code\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS \`it_health_check_items\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`check_id\` INT NOT NULL,
      \`item_order\` INT DEFAULT 0,
      \`category\` VARCHAR(100) NOT NULL,
      \`item_name\` VARCHAR(255) NOT NULL,
      \`subject\` VARCHAR(255) NULL,
      \`status\` VARCHAR(20) NOT NULL DEFAULT 'N',
      \`status_text\` VARCHAR(100) DEFAULT 'ปกติ',
      \`remarks\` TEXT NULL,
      \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (\`check_id\`) REFERENCES \`it_health_checks\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('Tables created successfully.');

  const excelPath = path.join(__dirname, '../../IT Report 08-2026.xlsx');
  console.log('Reading Excel file from:', excelPath);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  const branchMapping = {
    'Soi-10': { code: 'Soi-10', name: 'สาขา ซอย 10 (Head Office)' },
    'BD-8': { code: 'BD-8', name: 'สาขา BD-8' },
    'Rayong': { code: 'Rayong', name: 'สาขา ระยอง (Rayong W7/W16)' },
    'BD-15': { code: 'BD-15', name: 'สาขา BD-15' },
    'RAT21': { code: 'RAT21', name: 'สาขา RAT21' }
  };

  const getCellStr = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      if (val.result !== undefined && val.result !== null) return String(val.result).trim();
      if (val.text !== undefined && val.text !== null) return String(val.text).trim();
      if (val.richText) return val.richText.map(t => t.text).join('').trim();
      return JSON.stringify(val);
    }
    return String(val).trim();
  };

  for (const sheet of workbook.worksheets) {
    const sheetName = getCellStr(sheet.name);
    if (!sheetName || sheetName.toLowerCase() === 'summary') continue;

    const branchInfo = branchMapping[sheetName] || { code: sheetName.toLowerCase().replace(/\s+/g, '-'), name: `สาขา ${sheetName}` };

    console.log(`Processing sheet: ${sheetName}...`);

    // Row 8 contains date columns (columns 5 to end)
    const dateRow = sheet.getRow(8);
    const dateCols = [];
    dateRow.eachCell((cell, colNumber) => {
      if (colNumber >= 5 && cell.value) {
        let rawDate = cell.value;
        if (rawDate instanceof Date) {
          const yyyy = rawDate.getFullYear();
          const mm = String(rawDate.getMonth() + 1).padStart(2, '0');
          const dd = String(rawDate.getDate()).padStart(2, '0');
          dateCols.push({ col: colNumber, dateStr: `${yyyy}-${mm}-${dd}` });
        } else {
          const str = getCellStr(rawDate);
          if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
            dateCols.push({ col: colNumber, dateStr: str.substring(0, 10) });
          }
        }
      }
    });

    if (dateCols.length === 0) {
      dateCols.push({ col: 5, dateStr: '2026-08-01' });
    }

    // Extract item rows
    const items = [];
    let currentCategory = 'Network & Systems';

    for (let r = 10; r <= 35; r++) {
      const row = sheet.getRow(r);
      const catVal = getCellStr(row.getCell(2).value);
      const nameVal = getCellStr(row.getCell(3).value);
      const subjVal = getCellStr(row.getCell(4).value);

      if (!nameVal && !subjVal && !catVal) continue;
      if (catVal && isNaN(Number(catVal))) {
        currentCategory = catVal;
      }

      const itemName = nameVal || catVal || 'System Check';
      const subject = subjVal || '';

      items.push({
        rowNum: r,
        category: currentCategory,
        itemName,
        subject
      });
    }

    for (const dCol of dateCols) {
      const checkDate = dCol.dateStr;

      const [existing] = await db.query(
        'SELECT id FROM it_health_checks WHERE check_date = ? AND branch_code = ?',
        [checkDate, branchInfo.code]
      );

      let checkId;
      if (existing.length > 0) {
        checkId = existing[0].id;
      } else {
        const [res] = await db.query(
          'INSERT INTO it_health_checks (check_date, branch_code, branch_name, reporter_name, reporter_role) VALUES (?, ?, ?, ?, ?)',
          [checkDate, branchInfo.code, branchInfo.name, 'นาย ธนกฤต กิจสมฝัน', 'IT Supports']
        );
        checkId = res.insertId;
      }

      await db.query('DELETE FROM it_health_check_items WHERE check_id = ?', [checkId]);

      let order = 1;
      for (const item of items) {
        const rawCell = sheet.getRow(item.rowNum).getCell(dCol.col).value;
        const cleanStr = getCellStr(rawCell);

        let status = 'N';
        let statusText = 'ปกติ';
        let remarks = '';

        if (cleanStr) {
          if (cleanStr.toUpperCase() === 'F' || cleanStr.includes('Down') || cleanStr.includes('ผิดปกติ')) {
            status = 'F';
            statusText = 'ผิดปกติ';
            remarks = cleanStr;
          } else if (cleanStr.toUpperCase() === 'N' || cleanStr.includes('ปกติ') || cleanStr.includes('Ready')) {
            status = 'N';
            statusText = 'ปกติ';
            remarks = cleanStr !== 'N' ? cleanStr : '';
          } else {
            status = 'W';
            statusText = cleanStr;
            remarks = cleanStr;
          }
        }

        await db.query(
          `INSERT INTO it_health_check_items (check_id, item_order, category, item_name, subject, status, status_text, remarks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [checkId, order++, item.category, item.itemName, item.subject, status, statusText, remarks]
        );
      }
    }
  }

  console.log('--- Import Completed Successfully! ---');
  process.exit(0);
}

setupAndImport().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
