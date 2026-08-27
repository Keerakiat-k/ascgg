/**
 * ==============================================================================
 * 📦 ASCG Enterprise Portal - Automated Batch Import Script for Users
 * ==============================================================================
 * Purpose: Import user/employee data from IT-FORM-001 Excel files in user/ directory
 * Scope: Last 3 Years (BE 2567, 2568, 2569 / CE 2024, 2025, 2026)
 * Handles:
 *  - employees table
 *  - employee_credentials table (bcrypt password hashing)
 *  - leave_balances table (initial quota for current year)
 *  - dynamic department & company mapping
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs');
const db = require('../config/db');

async function runBatchImport(options = { dryRun: false }) {
  console.log('==============================================================================');
  console.log('🚀 Starting ASCG User Batch Import (Last 3 Years: 2567 - 2569 / 2024 - 2026)');
  console.log(`Mode: ${options.dryRun ? '🔍 DRY RUN (Simulation Only)' : '💾 LIVE EXECUTION (Writing to DB)'}`);
  console.log('==============================================================================\n');

  // 1. Fetch reference tables
  const [companies] = await db.query('SELECT * FROM companies');
  const [departments] = await db.query('SELECT * FROM departments');
  const [roles] = await db.query('SELECT * FROM roles');
  const [leaveTypes] = await db.query('SELECT * FROM leave_types WHERE is_active = 1');
  const [existingEmps] = await db.query('SELECT id, employee_code, email FROM employees');

  const companyMap = new Map();
  companies.forEach(c => companyMap.set(c.prefix.toUpperCase(), c.id));

  const deptMap = new Map();
  departments.forEach(d => {
    deptMap.set(d.name.trim().toLowerCase(), d.id);
    if (d.code) deptMap.set(d.code.trim().toLowerCase(), d.id);
  });

  const existingCodes = new Set(existingEmps.map(e => (e.employee_code || '').trim().toUpperCase()).filter(Boolean));
  const existingEmails = new Set(existingEmps.map(e => (e.email || '').trim().toLowerCase()).filter(Boolean));

  // Helper function to resolve or create department
  async function resolveDepartmentId(deptName) {
    if (!deptName) return 17; // Default: Management & Operations
    const cleanName = deptName.trim();
    const key = cleanName.toLowerCase();
    
    if (deptMap.has(key)) return deptMap.get(key);

    // Fuzzy matching
    if (key.includes('it') || key.includes('ไอที')) return 13;
    if (key.includes('hr') || key.includes('บุคคล')) return 14;
    if (key.includes('acc') || key.includes('บัญชี') || key.includes('การเงิน')) return 15;
    if (key.includes('eng') || key.includes('วิศวกรรม') || key.includes('ช่าง')) return 16;
    if (key.includes('sale') || key.includes('ขาย') || key.includes('การตลาด') || key.includes('marketing')) return 17;

    // Create new department if live execution
    if (!options.dryRun) {
      try {
        const code = 'DPT' + Math.floor(1000 + Math.random() * 9000);
        const [res] = await db.query('INSERT INTO departments (code, name) VALUES (?, ?)', [code, cleanName]);
        deptMap.set(key, res.insertId);
        return res.insertId;
      } catch (err) {
        return 17;
      }
    }
    return 17;
  }

  // 2. Scan and parse files
  const userDir = path.resolve(__dirname, '../../user');
  if (!fs.existsSync(userDir)) {
    throw new Error(`Directory not found: ${userDir}`);
  }

  const compDirs = fs.readdirSync(userDir);
  const parsedEmployees = [];

  function clean(cell) {
    if (!cell || cell.value === null || cell.value === undefined) return '';
    let val = cell.value;
    if (typeof val === 'object') {
      if (val.text !== undefined) val = val.text;
      else if (val.result !== undefined) val = val.result;
      else if (val instanceof Date) return val.toISOString().split('T')[0];
      else val = '';
    }
    return String(val).trim();
  }

  function parseDate(raw) {
    if (!raw) return null;
    if (raw instanceof Date) return raw.toISOString().split('T')[0];
    const s = String(raw).trim();
    if (s.match(/^\d{4}-\d{2}-\d{2}/)) {
      const match = s.match(/(\d{4})-(\d{2})-(\d{2})/);
      let y = parseInt(match[1], 10);
      if (y > 2500) y -= 543;
      return `${y}-${match[2]}-${match[3]}`;
    }
    const dmy = s.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (dmy) {
      let d = dmy[1].padStart(2, '0');
      let m = dmy[2].padStart(2, '0');
      let y = parseInt(dmy[3], 10);
      if (y < 100) y += 2500;
      if (y > 2500) y -= 543;
      return `${y}-${m}-${d}`;
    }
    return null;
  }

  for (const comp of compDirs) {
    const compPath = path.join(userDir, comp);
    if (!fs.statSync(compPath).isDirectory()) continue;

    function walk(dir, yearFolder = '') {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          walk(itemPath, item);
        } else if (item.endsWith('.xlsx') && !item.startsWith('~$') && !item.startsWith('.')) {
          files.push({ comp, yearFolder, fileName: item, fullPath: itemPath });
        }
      }
    }

    const files = [];
    walk(compPath, '');

    for (const f of files) {
      try {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.readFile(f.fullPath);
        const sheet = wb.worksheets[0];
        if (!sheet) continue;

        let rawDate = null;
        let titleTh = 'นาย';
        let fullNameTh = '';
        let titleEn = 'Mr.';
        let fullNameEn = '';
        let position = '';
        let department = '';
        let empCode = '';
        let email = '';
        let initialPassword = '';

        sheet.eachRow((row) => {
          const rowText = [];
          row.eachCell({ includeEmpty: true }, (cell, c) => {
            rowText[c] = clean(cell);
          });
          const fullRowStr = rowText.filter(Boolean).join(' ');

          // 1. Date
          if (fullRowStr.includes('Date') || fullRowStr.includes('วันที่')) {
            for (let c = 8; c <= 15; c++) {
              if (row.getCell(c).value && clean(row.getCell(c)) !== 'Date' && clean(row.getCell(c)) !== 'วันที่') {
                rawDate = row.getCell(c).value;
                break;
              }
            }
          }

          // 2. Thai Name & Title Checkbox (B6=Mr, D6=Mrs, F6=Miss)
          if (fullRowStr.includes('ชื่อ-สกุล') || fullRowStr.includes('(ภาษาไทย)')) {
            const b = clean(row.getCell(2));
            const d = clean(row.getCell(4));
            const f_ = clean(row.getCell(6));
            if (f_.toLowerCase() === 'r' || f_.includes('ü') || f_.includes('✓')) titleTh = 'นางสาว';
            else if (d.toLowerCase() === 'r' || d.includes('ü') || d.includes('✓')) titleTh = 'นาง';
            else if (b.toLowerCase() === 'r' || b.includes('ü') || b.includes('✓')) titleTh = 'นาย';

            fullNameTh = clean(row.getCell(9)) || clean(row.getCell(10)) || clean(row.getCell(8)) || clean(row.getCell(11));
            if (!fullNameTh || fullNameTh === '(ภาษาไทย)') {
              row.eachCell((cell) => {
                const v = clean(cell);
                if (v && !['ชื่อ-สกุล', 'นาย', 'นาง', 'นางสาว', '(ภาษาไทย)', '*', 'R', 'r', 'ü', '✓'].includes(v)) {
                  fullNameTh = v;
                }
              });
            }
          }

          // 3. English Name & Title Checkbox (B7=Mr, D7=Mrs, F7=Miss)
          if (fullRowStr.includes('NAME') || fullRowStr.includes('(English)')) {
            const b = clean(row.getCell(2));
            const d = clean(row.getCell(4));
            const f_ = clean(row.getCell(6));
            if (f_.toLowerCase() === 'r' || f_.includes('ü') || f_.includes('✓')) titleEn = 'Miss';
            else if (d.toLowerCase() === 'r' || d.includes('ü') || d.includes('✓')) titleEn = 'Mrs.';
            else if (b.toLowerCase() === 'r' || b.includes('ü') || b.includes('✓')) titleEn = 'Mr.';

            fullNameEn = clean(row.getCell(9)) || clean(row.getCell(10)) || clean(row.getCell(8)) || clean(row.getCell(11));
            if (!fullNameEn || fullNameEn === '(English)') {
              row.eachCell((cell) => {
                const v = clean(cell);
                if (v && !['NAME', 'NAME ', 'Mr', 'Mrs', 'Miss', 'Mr.', 'Mrs.', 'Miss.', '(English)', '*', 'R', 'r', 'ü', '✓'].includes(v)) {
                  fullNameEn = v;
                }
              });
            }
          }

          // 4. Position & EmpCode & Dept
          if (fullRowStr.includes('ตำแหน่ง') || fullRowStr.includes('รหัสพนักงาน')) {
            position = clean(row.getCell(2)) || clean(row.getCell(3));
            department = clean(row.getCell(7)) || clean(row.getCell(8));
            empCode = clean(row.getCell(13)) || clean(row.getCell(12)) || clean(row.getCell(11));

            if (!empCode || empCode === 'รหัสพนักงาน') {
              row.eachCell((cell) => {
                const v = clean(cell);
                if (v && (v.match(/^[A-Za-z\-]{2,6}\d{4,6}$/) || v.match(/^[A-Za-z\-]{2,6}\s*\d{4,6}$/))) {
                  empCode = v.replace(/\s+/g, '');
                }
              });
            }
            if (['ตำแหน่ง', 'ฝ่าย', 'แผนก', 'รหัสพนักงาน', '*'].includes(position)) position = '';
          }

          // 5. Email
          if ((fullRowStr.includes('Email') || fullRowStr.includes('User Name')) && !email) {
            const eVal = clean(row.getCell(5)) || clean(row.getCell(4)) || clean(row.getCell(6));
            if (eVal.includes('@') && (eVal.includes('.com') || eVal.includes('.co.th'))) {
              email = eVal;
            } else {
              row.eachCell((cell) => {
                const v = clean(cell);
                if (v && v.includes('@') && (v.includes('.com') || v.includes('.co.th')) && !v.includes('http') && !v.includes('Brower') && !v.includes('Login')) {
                  email = v;
                }
              });
            }
          }

          // 6. Password
          if (fullRowStr.includes('Password') && !initialPassword) {
            const pVal = clean(row.getCell(5)) || clean(row.getCell(4));
            if (pVal.startsWith('P@ssw0rd')) {
              initialPassword = pVal;
            }
          }
        });

        // Split Names
        const thParts = (fullNameTh || '').replace(/^(นาย|นางสาว|นาง|ด\.ช\.|ด\.ญ\.)\s*/, '').trim().split(/\s+/).filter(Boolean);
        const firstNameTh = thParts[0] || '';
        const lastNameTh = thParts.slice(1).join(' ') || '';

        const enParts = (fullNameEn || '').replace(/^(Mr\.|Mrs\.|Miss|Ms\.)\s*/i, '').trim().split(/\s+/).filter(Boolean);
        const firstNameEn = enParts[0] || '';
        const lastNameEn = enParts.slice(1).join(' ') || '';

        const startDate = parseDate(rawDate);

        // Determine BE Year
        let beYear = null;
        if (f.yearFolder) {
          const m = f.yearFolder.match(/(\d{4})/);
          if (m) {
            const y = parseInt(m[1], 10);
            beYear = y > 2500 ? y : y + 543;
          } else if (f.yearFolder.match(/^6[789]$/)) {
            beYear = 2500 + parseInt(f.yearFolder, 10);
          }
        }
        if (!beYear && startDate) {
          const y = parseInt(startDate.split('-')[0], 10);
          beYear = y + 543;
        }
        if (!beYear && empCode) {
          const m = empCode.match(/[A-Za-z]+(\d{2})/);
          if (m) {
            const yy = parseInt(m[1], 10);
            if (yy >= 50 && yy <= 99) beYear = 2500 + yy;
            else if (yy >= 10 && yy <= 40) beYear = 2000 + yy + 543;
          }
        }

        // Filter last 3 years: 2567, 2568, 2569 (2024, 2025, 2026)
        if (beYear === 2567 || beYear === 2568 || beYear === 2569) {
          // Normalize Employee Code
          let cleanCode = empCode;
          if (!cleanCode || cleanCode === 'รหัสพนักงาน' || cleanCode.includes('ย้ายมาจาก')) {
            const numPart = Math.floor(100 + Math.random() * 900);
            cleanCode = `${comp}${String(beYear).slice(-2)}${numPart}`;
          }

          parsedEmployees.push({
            company_prefix: comp,
            employee_code: cleanCode.toUpperCase(),
            title_th: titleTh,
            first_name_th: firstNameTh || firstNameEn || 'ไม่ระบุชื่อ',
            last_name_th: lastNameTh || lastNameEn || '',
            title_en: titleEn,
            first_name_en: firstNameEn || firstNameTh || 'User',
            last_name_en: lastNameEn || lastNameTh || '',
            position: position || 'พนักงานทั่วไป',
            department_name: department || '',
            email: email ? email.replace(/[\s\(\)]+/g, '').trim().toLowerCase() : '',
            password: initialPassword || 'P@ssw0rd123',
            start_date: startDate || `${beYear - 543}-01-01`,
            beYear,
            ceYear: beYear - 543,
            file: f.fileName
          });
        }
      } catch (err) {
        console.error(`❌ Error parsing ${f.fullPath}:`, err.message);
      }
    }
  }

  console.log(`📋 Found ${parsedEmployees.length} employee records from the last 3 years.`);

  // 3. Deduplicate within parsed dataset
  const uniqueEmployees = [];
  const seenKeys = new Set();

  for (const emp of parsedEmployees) {
    const key = (emp.email || emp.employee_code || `${emp.first_name_th}_${emp.last_name_th}`).toLowerCase();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueEmployees.push(emp);
    }
  }

  console.log(`✨ Unique employee records to process: ${uniqueEmployees.length}\n`);

  // 4. Process insertion into database
  let insertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < uniqueEmployees.length; i++) {
    const emp = uniqueEmployees[i];
    const codeKey = emp.employee_code.trim().toUpperCase();
    const emailKey = emp.email.trim().toLowerCase();

    // Check if already exists in DB
    if (existingCodes.has(codeKey) || (emailKey && existingEmails.has(emailKey))) {
      console.log(`⏩ [SKIP] ${emp.employee_code} (${emp.first_name_th} ${emp.last_name_th}) already exists in DB.`);
      skippedCount++;
      continue;
    }

    const deptId = await resolveDepartmentId(emp.department_name);

    if (options.dryRun) {
      console.log(`🔍 [DRY-RUN] Would insert: [${emp.company_prefix}] ${emp.employee_code} | ${emp.title_th} ${emp.first_name_th} ${emp.last_name_th} | ${emp.position} | ${emp.email}`);
      insertedCount++;
      continue;
    }

    try {
      // 4.1 Insert into employees table
      const [empResult] = await db.query(
        `INSERT INTO employees 
         (company_prefix, employee_code, title_th, first_name_th, last_name_th, 
          title_en, first_name_en, last_name_en, nickname, mobile, email, 
          position, department_id, start_date, role_id, status, use_domain, access_granted, access_revoked) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          emp.company_prefix,
          emp.employee_code,
          emp.title_th,
          emp.first_name_th,
          emp.last_name_th,
          emp.title_en,
          emp.first_name_en,
          emp.last_name_en,
          '',
          '',
          emp.email || null,
          emp.position,
          deptId,
          emp.start_date,
          3, // Default role: Employee
          'Active',
          1,
          1,
          0
        ]
      );

      const newEmpId = empResult.insertId;

      // 4.2 Hash password and insert into employee_credentials
      const passwordHash = await bcrypt.hash(emp.password, 10);
      await db.query(
        `INSERT INTO employee_credentials (employee_id, password_hash) VALUES (?, ?)`,
        [newEmpId, passwordHash]
      );

      // 4.3 Initialize leave_balances for current year
      for (const lt of leaveTypes) {
        await db.query(
          `INSERT INTO leave_balances (employee_id, leave_type_id, year, total_days, used_days, pending_days, created_at, updated_at)
           VALUES (?, ?, ?, ?, 0, 0, NOW(), NOW())`,
          [newEmpId, lt.id, currentYear, lt.default_days]
        );
      }

      existingCodes.add(codeKey);
      if (emailKey) existingEmails.add(emailKey);

      console.log(`✅ [IMPORTED #${insertedCount + 1}] ID:${newEmpId} [${emp.company_prefix}] ${emp.employee_code} - ${emp.title_th} ${emp.first_name_th} ${emp.last_name_th} (${emp.position})`);
      insertedCount++;
    } catch (dbErr) {
      console.error(`❌ [DB ERROR] Failed to insert ${emp.employee_code}:`, dbErr.message);
      errorCount++;
    }
  }

  console.log('\n==============================================================================');
  console.log('🎉 BATCH IMPORT COMPLETE');
  console.log(`📊 Summary:`);
  console.log(`   - Total Processed: ${uniqueEmployees.length}`);
  console.log(`   - Successfully Imported: ${insertedCount}`);
  console.log(`   - Skipped (Existing): ${skippedCount}`);
  console.log(`   - Errors: ${errorCount}`);
  console.log('==============================================================================\n');

  return {
    total: uniqueEmployees.length,
    imported: insertedCount,
    skipped: skippedCount,
    errors: errorCount
  };
}

// If run directly from CLI
if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  runBatchImport({ dryRun: isDryRun })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error during batch import:', err);
      process.exit(1);
    });
}

module.exports = { runBatchImport };
