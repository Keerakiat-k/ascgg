const db = require('../config/db');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

async function importAllCompleteData() {
  console.log('=== STARTING PERFECTED AUGUST 2026 FULL DATA IMPORT ===');

  // Clear existing health check data for clean state
  await db.query('DELETE FROM it_health_checks');
  console.log('Cleared existing health check data.');

  const augPath = path.join(__dirname, '../../IT Report 08-2026.xlsx');
  const wb = XLSX.readFile(augPath);

  const branchNameMapping = {
    'Soi-10': 'สาขา ซอย 10 (Head Office)',
    'BD-8': 'สาขา BD-8',
    'Rayong': 'สาขา ระยอง (Rayong W7/W16)',
    'BD-15': 'สาขา BD-15',
    'RAT21': 'สาขา RAT21'
  };

  const getCleanStr = (val) => {
    if (val === null || val === undefined) return '';
    return String(val).trim();
  };

  let totalBranches = 0;
  let totalDays = 0;
  let totalItemsCount = 0;
  let totalFaultsCount = 0;

  for (const sheetName of wb.SheetNames) {
    const sheetTrim = sheetName.trim();
    if (['summary', 'helpdesk&support'].includes(sheetTrim.toLowerCase())) continue;

    const branchCode = sheetTrim.replace(/\s+/g, '-');
    const branchName = branchNameMapping[sheetTrim] || `สาขา ${sheetTrim}`;
    console.log(`\nImporting Sheet: ${sheetName} (${branchCode})...`);

    const sheetObj = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheetObj, { header: 1, defval: '' });

    // Find header row containing Day 1, 2, 3 ... 31
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

    if (headerRowIdx === -1) {
      console.log(`  ⚠️ Header row not found for ${sheetName}`);
      continue;
    }

    // Map day columns (Col 4 = Day 1, Col 5 = Day 2 ... Col 34 = Day 31)
    const dayRow = data[headerRowIdx] || [];
    const dateColMapping = [];
    let remarkColIdx = -1;

    for (let c = 4; c < dayRow.length; c++) {
      const valStr = getCleanStr(dayRow[c]);
      const dayVal = parseInt(valStr, 10);
      if (!isNaN(dayVal) && dayVal >= 1 && dayVal <= 31) {
        const dayStr = String(dayVal).padStart(2, '0');
        dateColMapping.push({ colIdx: c, dayNum: dayVal, dateStr: `2026-08-${dayStr}` });
      } else if (valStr.toLowerCase().includes('remark') || valStr.includes('หมายเหตุ')) {
        remarkColIdx = c;
      }
    }

    if (remarkColIdx === -1) {
      // Default remark column is col 35 (index 35 -> Col 36)
      remarkColIdx = 35;
    }

    // Extract system items
    const itemsList = [];
    let currentCategory = 'Network & Systems';

    for (let r = headerRowIdx + 1; r < data.length; r++) {
      const row = data[r] || [];
      const col1 = getCleanStr(row[1]); // Title / Category
      const col2 = getCleanStr(row[2]); // Description / Item Name
      const col3 = getCleanStr(row[3]); // Subject

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

    totalBranches++;

    // For each day (Aug 1 to Aug 31)
    for (const dMap of dateColMapping) {
      const checkDate = dMap.dateStr;

      const [res] = await db.query(
        'INSERT INTO it_health_checks (check_date, branch_code, branch_name, reporter_name, reporter_role) VALUES (?, ?, ?, ?, ?)',
        [checkDate, branchCode, branchName, 'นาย ธนกฤต กิจสมฝัน', 'IT Supports']
      );
      const checkId = res.insertId;
      totalDays++;

      let order = 1;
      for (const item of itemsList) {
        const rawCell = data[item.rowIdx] ? data[item.rowIdx][dMap.colIdx] : '';
        const cellStr = getCleanStr(rawCell);
        const itemRemark = item.globalRemark;

        let status = 'N';
        let statusText = 'ปกติ';
        let finalRemarks = cellStr || itemRemark;

        // Check fault triggers
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
          totalFaultsCount++;
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
        totalItemsCount++;
      }
    }

    console.log(`  ✓ Imported ${branchCode}: 31 days (Aug 1 - Aug 31, 2026), ${itemsList.length} items/day`);
  }

  console.log('\n==================================================');
  console.log('🎉 PERFECTED FULL DATA IMPORT COMPLETED!');
  console.log(`Total Branches Monitored: ${totalBranches} branches`);
  console.log(`Total Days Monitored: 31 days (2026-08-01 to 2026-08-31)`);
  console.log(`Total Branch-Day Records: ${totalDays} records`);
  console.log(`Total System Status Items Stored: ${totalItemsCount} items`);
  console.log(`Total System Fault/Alert Items Flagged: ${totalFaultsCount} items`);
  console.log('==================================================\n');

  process.exit(0);
}

importAllCompleteData().catch(err => {
  console.error('Import Failed:', err);
  process.exit(1);
});
