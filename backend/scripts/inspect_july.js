const XLSX = require('xlsx');
const path = require('path');

const fPath = 'c:/Users/keerakiat.k/Desktop/Soi_10_july_2026.xls';
const wb = XLSX.readFile(fPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log('--- Inspecting Soi_10_july_2026.xls Rows ---');
for (let r = 0; r < Math.min(12, data.length); r++) {
  const row = data[r] || [];
  const nonEmp = row.map((v, idx) => ({ col: idx + 1, val: v })).filter(x => x.val !== '');
  if (nonEmp.length > 0) {
    console.log(`Row ${r + 1}:`, nonEmp.slice(0, 10));
  }
}
