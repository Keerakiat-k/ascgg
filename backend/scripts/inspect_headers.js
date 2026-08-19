const XLSX = require('xlsx');
const path = require('path');

const augPath = path.join(__dirname, '../../IT Report 08-2026.xlsx');
const wb = XLSX.readFile(augPath);

for (const sName of wb.SheetNames) {
  console.log(`\n=== SHEET: ${sName} ===`);
  const sheet = wb.Sheets[sName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  for (let r = 0; r < Math.min(12, data.length); r++) {
    const row = data[r] || [];
    const nonEmp = row.map((v, idx) => ({ col: idx + 1, val: v })).filter(x => x.val !== '');
    if (nonEmp.length > 0) {
      console.log(`Row ${r + 1}:`, nonEmp.slice(0, 10));
    }
  }
}
