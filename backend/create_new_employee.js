const pool = require('./config/db');

async function createEmployee() {
  const connection = await pool.getConnection();
  try {
    console.log('Starting employee creation script...');
    await connection.beginTransaction();

    // 1. Ensure Department 'IT' exists
    let deptId = null;
    const [deptRows] = await connection.execute('SELECT id FROM departments WHERE name = ? LIMIT 1', ['IT']);
    if (deptRows.length > 0) {
      deptId = deptRows[0].id;
    } else {
      const uniqueCode = 'DEPT-IT';
      const [newDept] = await connection.execute('INSERT INTO departments (code, name) VALUES (?, ?)', [uniqueCode, 'IT']);
      deptId = newDept.insertId;
      console.log(`Created department IT with ID: ${deptId}`);
    }

    // 2. Ensure Position 'Senior Software Engineer' exists
    const [posRows] = await connection.execute('SELECT id FROM positions WHERE title = ? LIMIT 1', ['Senior Software Engineer']);
    if (posRows.length === 0) {
      await connection.execute('INSERT INTO positions (title, level) VALUES (?, ?)', ['Senior Software Engineer', 'Senior']);
      console.log('Created position Senior Software Engineer');
    }

    // 3. Ensure Company 'ASCG' exists
    const [compRows] = await connection.execute('SELECT prefix FROM companies WHERE prefix = ? LIMIT 1', ['ASCG']);
    if (compRows.length === 0) {
      await connection.execute('INSERT INTO companies (prefix, name, status) VALUES (?, ?, ?)', ['ASCG', 'ASCG Company Limited', 'Active']);
      console.log('Created company ASCG');
    }

    // 4. Check if employee already exists by employee_code or email
    const [empCheck] = await connection.execute(
      'SELECT id FROM employees WHERE employee_code = ? OR email = ? LIMIT 1',
      ['EMP69001', 'kittisak.p@ascg.co.th']
    );

    let employeeId;
    if (empCheck.length > 0) {
      employeeId = empCheck[0].id;
      console.log(`Employee EMP69001 already exists with ID ${employeeId}. Updating details...`);
      await connection.execute(
        `UPDATE employees SET 
          company_prefix = ?, employee_code = ?, email = ?, position = ?, department_id = ?,
          title_th = ?, first_name_th = ?, last_name_th = ?, 
          title_en = ?, first_name_en = ?, last_name_en = ?, nickname = ?,
          mobile = ?, start_date = ?, status = ?
        WHERE id = ?`,
        [
          'ASCG', 'EMP69001', 'kittisak.p@ascg.co.th', 'Senior Software Engineer', deptId,
          'นาย', 'กิตติศักดิ์', 'พัฒนากุล',
          'Mr.', 'Kittisak', 'Pattanakul', 'กิต',
          '081-987-6543', '2026-07-27', 'Active',
          employeeId
        ]
      );
    } else {
      const [empResult] = await connection.execute(
        `INSERT INTO employees (
          company_prefix, employee_code, email, use_domain, position, department_id, role_id,
          title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en, nickname,
          mobile, start_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'ASCG', 'EMP69001', 'kittisak.p@ascg.co.th', 1, 'Senior Software Engineer', deptId, 3,
          'นาย', 'กิตติศักดิ์', 'พัฒนากุล', 'Mr.', 'Kittisak', 'Pattanakul', 'กิต',
          '081-987-6543', '2026-07-27', 'Active'
        ]
      );
      employeeId = empResult.insertId;
      console.log(`Created new employee with ID: ${employeeId}`);

      // Insert family table placeholder
      await connection.execute(
        `INSERT INTO employee_families (employee_id) VALUES (?)`,
        [employeeId]
      );

      // Insert additional info table placeholder
      await connection.execute(
        `INSERT INTO employee_additional_info (employee_id) VALUES (?)`,
        [employeeId]
      );
    }

    // 5. Ensure Leave Types exist
    const leaveQuotaMap = [
      { name: 'ลาพักร้อน', days: 10 },
      { name: 'ลาป่วย', days: 30 },
      { name: 'ลากิจ', days: 6 }
    ];

    const currentYear = 2026;

    for (const item of leaveQuotaMap) {
      let leaveTypeId;
      const [ltRows] = await connection.execute('SELECT id FROM leave_types WHERE name = ? LIMIT 1', [item.name]);
      if (ltRows.length > 0) {
        leaveTypeId = ltRows[0].id;
      } else {
        const [newLt] = await connection.execute('INSERT INTO leave_types (name, default_days) VALUES (?, ?)', [item.name, item.days]);
        leaveTypeId = newLt.insertId;
        console.log(`Created leave type '${item.name}' with ID ${leaveTypeId}`);
      }

      // Upsert into leave_balances
      await connection.execute(
        `INSERT INTO leave_balances (employee_id, leave_type_id, year, total_days, used_days, pending_days)
         VALUES (?, ?, ?, ?, 0, 0)
         ON DUPLICATE KEY UPDATE total_days = VALUES(total_days)`,
        [employeeId, leaveTypeId, currentYear, item.days]
      );
      console.log(`Set leave balance for '${item.name}': ${item.days} days (Year ${currentYear})`);
    }

    await connection.commit();
    console.log('SUCCESS: Employee and leave balances created/updated successfully!');

    // Fetch full created employee info for report
    const [fullEmp] = await connection.execute(`
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.id = ?
    `, [employeeId]);

    const [balances] = await connection.execute(`
      SELECT b.year, b.total_days, t.name as leave_type_name
      FROM leave_balances b
      JOIN leave_types t ON b.leave_type_id = t.id
      WHERE b.employee_id = ? AND b.year = ?
    `, [employeeId, currentYear]);

    console.log('--- CREATED EMPLOYEE SUMMARY ---');
    console.log(JSON.stringify({ employee: fullEmp[0], leave_balances: balances }, null, 2));

  } catch (error) {
    await connection.rollback();
    console.error('Error creating employee:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

createEmployee();
