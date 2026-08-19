const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function testExcelTemplate() {
  const templatePath = 'c:/Users/keerakiat.k/Desktop/ascg_g/IT Report 08-2026.xlsx';
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);

  console.log('Successfully loaded template workbook!');
  console.log('Worksheets:', workbook.worksheets.map(w => w.name));

  // Modify Soi-10 sheet cell as a test
  const soi10 = workbook.getWorksheet('Soi-10');
  if (soi10) {
    // Row 10 is Item 1 (TOT 500/1000), Col 5 is Day 1
    const cell = soi10.getCell(10, 5);
    cell.value = 'N';
    console.log('Updated Soi-10 Day 1 status to N');
  }

  const outputPath = 'c:/Users/keerakiat.k/Desktop/ascg_g/backend/scripts/test_output.xlsx';
  await workbook.xlsx.writeFile(outputPath);
  console.log('Successfully wrote output file to:', outputPath);
}

testExcelTemplate().catch(err => console.error('Error:', err));
