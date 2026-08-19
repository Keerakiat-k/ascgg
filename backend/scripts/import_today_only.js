const db = require('../config/db');
const XLSX = require('xlsx');
const path = require('path');

async function importTodayOnly() {
  console.log('--- Importing Health Check Data for Today (2026-08-01) Only ---');
  await db.query('DELETE FROM it_health_checks');

  const augPath = path.join(__dirname, '../../IT Report 08-2026.xlsx');
  const wb = XLSX.readFile(augPath);

  const branchNameMapping = {
    'Soi-10': 'สาขา ซอย 10 (Head Office)',
    'BD-8': 'สาขา BD-8',
    'Rayong': 'สาขา ระยอง (Rayong W7/W16)',
    'BD-15': 'สาขา BD-15',
    'RAT21': 'สาขา RAT21'
  };

  const getCleanStr = (val) => (val === null || val === undefined ? '' : String(val).trim());

  for (const sheetName of wb.SheetNames) {
    const sheetTrim = sheetName.trim();
    if (['summary', 'helpdesk&support'].includes(sheetTrim.toLowerCase())) continue;

    const branchCode = sheetTrim.replace(/\s+/g, '-');
    const branchName = branchNameMapping[sheetTrim] || `สาขา ${sheetTrim}`;

    const data = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });

    let headerRowIdx = -1;
    for (let r = 0; r < Math.min(15, data.length); r++) {
      const row = data[r] || [];
      const col4Val = parseInt(row[4], 10);
      const col0Val = getCleanStr(row[0]);
      if (col4Val === 1 || col0Val.toLowerCase() === 'no') {
        headerRowIdx = r;
        break;
      }
    }

    if (headerRowIdx === -1) continue;

    // Day 1 corresponds to Col Index 4 (Col E) -> Date: 2026-08-01
    const day1ColIdx = 4;
    const checkDate = '2026-08-01';

    // Extract item rows
    const itemsList = [];
    let currentCategory = 'Network & Systems';
    const remarkColIdx = 35;

    for (let r = headerRowIdx + 1; r < data.length; r++) {
      const row = data[r] || [];
      const col1 = getCleanStr(row[1]);
      const col2 = getCleanStr(row[2]);
      const col3 = getCleanStr(row[3]);

      if (col1.includes('หมายเหตุ') || col1.includes('ผู้จัดทำ')) break;
      if (!col1 && !col2 && !col3) continue;

      if (col1 && isNaN(Number(col1))) {
        currentCategory = col1;
      }

      const itemName = col2 || col1 || 'System Check';
      const subject = col3 || '';
      const globalRemark = getCleanStr(row[remarkColIdx]);

      itemsList.push({
        rowIdx: r,
        category: currentCategory,
        itemName,
        subject,
        globalRemark
      });
    }

    const [res] = await db.query(
      'INSERT INTO it_health_checks (check_date, branch_code, branch_name, reporter_name, reporter_role) VALUES (?, ?, ?, ?, ?)',
      [checkDate, branchCode, branchName, 'นาย ธนกฤต กิจสมฝัน', 'IT Supports']
    );
    const checkId = res.insertId;

    let order = 1;
    for (const item of itemsList) {
      const rawCell = data[item.rowIdx] ? data[item.rowIdx][day1ColIdx] : '';
      const cellStr = getCleanStr(rawCell);
      const itemRemark = item.globalRemark;

      let status = 'N';
      let statusText = 'ปกติ';
      let finalRemarks = cellStr || itemRemark;

      if (
        cellStr.toUpperCase() === 'F' ||
        cellStr.toLowerCase().includes('down') ||
        cellStr.includes('ผิดปกติ') ||
        itemRemark.toLowerCase().includes('down') ||
        itemRemark.includes('ผิดปกติ')
      ) {
        status = 'F';
        statusText = 'ผิดปกติ';
        if (!finalRemarks) finalRemarks = itemRemark || 'ขัดข้อง/Down';
      } else if (cellStr.toUpperCase() === 'N' || cellStr.includes('ปกติ') || cellStr.toLowerCase().includes('ready')) {
        status = 'N';
        statusText = 'ปกติ';
        if (finalRemarks === 'N') finalRemarks = '';
      } else if (cellStr) {
        status = 'W';
        statusText = cellStr;
      }

      await db.query(
        `INSERT INTO it_health_check_items (check_id, item_order, category, item_name, subject, status, status_text, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [checkId, order++, item.category, item.itemName, item.subject, status, statusText, finalRemarks]
      );
    }

    console.log(`  ✓ Created today baseline (2026-08-01) for ${branchCode}: ${itemsList.length} items.`);
  }

  console.log('\n--- Baseline Data Ready for 2026-08-01. Future dates are 100% clean and unrecorded! ---');
  process.exit(0);
}

importTodayOnly().catch(err => console.error(err));
