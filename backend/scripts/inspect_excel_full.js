const ExcelJS = require('../frontend/node_modules/exceljs');
const path = require('path');

async function inspectFullExcel() {
  const filePath = 'c:/Users/keerakiat.k/Desktop/ascg_g/IT Report 08-2026.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  console.log('Worksheets:', workbook.worksheets.map(w => w.name));

  for (const sheet of workbook.worksheets) {
    console.log(`\n========================================`);
    console.log(`SHEET: ${sheet.name} (RowCount: ${sheet.rowCount}, ColCount: ${sheet.columnCount})`);
    console.log(`========================================`);
    
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber <= 12) {
        const values = [];
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          if (colNumber <= 5 || colNumber >= 34) {
            values.push(`[Col ${colNumber}: ${cell.text}]`);
          }
        });
        console.log(`Row ${rowNumber}: ${values.join(' | ')}`);
      }
    });
  }
}

inspectFullExcel().catch(err => console.error(err));
