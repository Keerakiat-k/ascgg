const path = require('path');
const ExcelJS = require(path.join(__dirname, '../../frontend/node_modules/exceljs'));

async function testJls() {
  try {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('c:/Users/keerakiat.k/Desktop/BD15_july_2026.xls');
    console.log('Successfully read BD15_july_2026.xls via ExcelJS!');
    console.log('Worksheets:', wb.worksheets.map(w => w.name));
  } catch (err) {
    console.log('ExcelJS xls error:', err.message);
  }
}

testJls();
