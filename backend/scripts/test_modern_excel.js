const ExcelJS = require('exceljs');
const path = require('path');

async function generateModernExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ASCG Group Enterprise IT Portal';

  // ==========================================
  // SHEET 1: Executive Dashboard
  // ==========================================
  const dashSheet = workbook.addWorksheet('📊 Executive Dashboard', {
    views: [{ showGridLines: true }]
  });

  // Title Banner
  dashSheet.mergeCells('A1:G2');
  const titleCell = dashSheet.getCell('A1');
  titleCell.value = 'ASCG GROUP — EXECUTIVE IT OPERATIONS REPORT';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFF59E0B' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Subtitle
  dashSheet.mergeCells('A3:G3');
  const subCell = dashSheet.getCell('A3');
  subCell.value = 'รายงานภาพรวมระบบโครงสร้างพื้นฐาน IT, ทรัพย์สินคอมพิวเตอร์ และงานบริการ IT Support';
  subCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF475569' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // KPI Cards Row
  dashSheet.getCell('A5').value = '💻 คอมพิวเตอร์ในระบบ';
  dashSheet.getCell('A6').value = '110 เครื่อง';
  dashSheet.getCell('A5').font = { size: 9, bold: true, color: { argb: 'FF475569' } };
  dashSheet.getCell('A6').font = { size: 16, bold: true, color: { argb: 'FF0F172A' } };
  dashSheet.getCell('A5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  dashSheet.getCell('A6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

  dashSheet.getCell('C5').value = '🎫 ทิกเก็ตแจ้งซ่อม IT';
  dashSheet.getCell('C6').value = '15 รายการ';
  dashSheet.getCell('C5').font = { size: 9, bold: true, color: { argb: 'FF475569' } };
  dashSheet.getCell('C6').font = { size: 16, bold: true, color: { argb: 'FF2563EB' } };
  dashSheet.getCell('C5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
  dashSheet.getCell('C6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };

  dashSheet.getCell('E5').value = '⚡ IT System Health Uptime';
  dashSheet.getCell('E6').value = '99.4%';
  dashSheet.getCell('E5').font = { size: 9, bold: true, color: { argb: 'FF475569' } };
  dashSheet.getCell('E6').font = { size: 16, bold: true, color: { argb: 'FF059669' } };
  dashSheet.getCell('E5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
  dashSheet.getCell('E6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };

  // Asset Table Header
  const headerRowNumber = 9;
  dashSheet.getRow(headerRowNumber).values = ['ลำดับ', 'บริษัทในเครือ (Company)', 'จำนวน PC / Notebook', 'สัดส่วน (%)', 'สถานะการตรวจเช็ค'];
  const headerRow = dashSheet.getRow(headerRowNumber);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const assetData = [
    [1, 'AIC (บริษัท เอไอซี)', 57, '51.8%', 'ปกติ (Normal)'],
    [2, 'AIA (บริษัท เอไอเอ)', 26, '23.6%', 'ปกติ (Normal)'],
    [3, 'CST (บริษัท ซีเอสที)', 8, '7.3%', 'ปกติ (Normal)'],
    [4, 'SQT (บริษัท เอสคิวที)', 8, '7.3%', 'ปกติ (Normal)'],
    [5, 'ASPD (บริษัท เอเอสพีดี)', 3, '2.7%', 'ปกติ (Normal)'],
    [6, 'AEP (บริษัท เออีพี)', 3, '2.7%', 'ปกติ (Normal)'],
    [7, 'Q-AIR (บริษัท คิว-แอร์)', 2, '1.8%', 'ปกติ (Normal)'],
    [8, 'AGC (บริษัท เอจีซี)', 2, '1.8%', 'ปกติ (Normal)'],
    [9, 'QPM (บริษัท คิวพีเอ็ม)', 1, '0.9%', 'ปกติ (Normal)']
  ];

  assetData.forEach((rowVals, idx) => {
    const row = dashSheet.addRow(rowVals);
    row.height = 20;
    const isEven = idx % 2 === 0;
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFF8FAFC' : 'FFFFFFFF' } };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
      if (colNum === 1 || colNum === 3 || colNum === 4) cell.alignment = { horizontal: 'center' };
    });
  });

  dashSheet.columns = [
    { width: 10 }, { width: 30 }, { width: 22 }, { width: 16 }, { width: 22 }
  ];

  const outputPath = 'c:/Users/keerakiat.k/Desktop/ascg_g/backend/scripts/modern_output.xlsx';
  await workbook.xlsx.writeFile(outputPath);
  console.log('Successfully created modern Excel file at:', outputPath);
}

generateModernExcel().catch(err => console.error(err));
