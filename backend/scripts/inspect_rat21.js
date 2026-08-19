const XLSX = require('xlsx');
const path = require('path');

const augPath = path.join(__dirname, '../../IT Report 08-2026.xlsx');
const wb = XLSX.readFile(augPath);
const sheet = wb.Sheets['RAT21'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log('--- RAT21 Row 7 (Internet AIS) values across day columns ---');
const r7 = data[6] || [];
for (let c = 0; c < Math.min(37, r7.length); c++) {
  if (r7[c]) {
    console.log(`Col ${c + 1}:`, r7[c]);
  }
}
