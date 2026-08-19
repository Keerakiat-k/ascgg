const path = require('path');
const ExcelJS = require(path.join(__dirname, '../../frontend/node_modules/exceljs'));

async function inspectRow8() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('c:/Users/keerakiat.k/Desktop/ascg_g/IT Report 08-2026.xlsx');
  const sheet = wb.getWorksheet('Soi-10');

  console.log('--- Row 8 Cell Values ---');
  const r8 = sheet.getRow(8);
  for (let c = 1; c <= 36; c++) {
    const val = r8.getCell(c).value;
    console.log(`Col ${c}:`, typeof val === 'object' ? JSON.stringify(val) : val);
  }

  console.log('--- Row 9 Cell Values ---');
  const r9 = sheet.getRow(9);
  for (let c = 1; c <= 36; c++) {
    const val = r9.getCell(c).value;
    console.log(`Col ${c}:`, typeof val === 'object' ? JSON.stringify(val) : val);
  }
}

inspectRow8().catch(err => console.error(err));
