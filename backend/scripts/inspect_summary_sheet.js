const XLSX = require('xlsx');
const path = require('path');

const augPath = path.join(__dirname, '../../IT Report 08-2026.xlsx');
const wb = XLSX.readFile(augPath);
const sheet = wb.Sheets['Summary'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log('=== Inspecting Sheet: Summary ===');
for (let r = 0; r < data.length; r++) {
  const row = data[r] || [];
  const nonEmp = row.map((v, idx) => ({ col: idx + 1, val: v })).filter(x => x.val !== '');
  if (nonEmp.length > 0) {
    console.log(`Row ${r + 1}:`, nonEmp);
  }
}
