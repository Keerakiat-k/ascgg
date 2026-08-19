const path = require('path');
const fs = require('fs');
const ExcelJS = require(path.join(__dirname, '../../frontend/node_modules/exceljs'));

async function inspectAllFiles() {
  console.log('=== Inspecting IT Report 08-2026.xlsx ===');
  const file08 = 'c:/Users/keerakiat.k/Desktop/ascg_g/IT Report 08-2026.xlsx';
  const wb08 = new ExcelJS.Workbook();
  await wb08.xlsx.readFile(file08);

  for (const sheet of wb08.worksheets) {
    console.log(`Sheet: ${sheet.name}, RowCount: ${sheet.rowCount}`);
    const dateRow = sheet.getRow(8);
    const dates = [];
    dateRow.eachCell((cell, colNum) => {
      if (colNum >= 5 && cell.value) {
        if (cell.value instanceof Date) {
          dates.push(cell.value.toISOString().substring(0, 10));
        } else {
          dates.push(String(cell.value));
        }
      }
    });
    console.log(`  Found ${dates.length} date columns in sheet ${sheet.name}`);
    if (dates.length > 0) {
      console.log(`  Dates range: ${dates[0]} to ${dates[dates.length - 1]}`);
    }
  }

  console.log('\n=== Checking July 2026 files on Desktop ===');
  const desktopPath = 'c:/Users/keerakiat.k/Desktop';
  const desktopFiles = fs.readdirSync(desktopPath).filter(f => f.includes('july_2026'));
  console.log('Desktop July Files:', desktopFiles);
}

inspectAllFiles().catch(err => console.error(err));
