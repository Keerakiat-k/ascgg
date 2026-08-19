const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function run() {
  const pool = mysql.createPool({host:'localhost', user:'root', password:'', database:'ascg_g_db'});
  const passwordHash = await bcrypt.hash('123456', 10);
  
  try {
      // Create Manager
      const [mgrRes] = await pool.query(`
        INSERT INTO employees 
        (company_prefix, employee_code, title_th, first_name_th, last_name_th, date_of_birth, national_id, mobile, email, department_id, position_name, role_id) 
        VALUES ('ASCG', 'MGR001', 'นาย', 'หัวหน้า', 'ทดสอบ', '1990-01-01', '1234567890123', '0800000001', 'manager@ascg.com', 1, 'Manager', 5)
      `);
      const mgrId = mgrRes.insertId;
      
      await pool.query('INSERT INTO employee_credentials (employee_id, password_hash) VALUES (?, ?)', [mgrId, passwordHash]);
      
      // Create Employee
      const [empRes] = await pool.query(`
        INSERT INTO employees 
        (company_prefix, employee_code, title_th, first_name_th, last_name_th, date_of_birth, national_id, mobile, email, department_id, position_name, role_id, manager_id) 
        VALUES ('ASCG', 'EMP001', 'นาย', 'พนักงาน', 'ทดสอบ', '1995-01-01', '1234567890124', '0800000002', 'employee@ascg.com', 1, 'Staff', 3, ?)
      `, [mgrId]);
      const empId = empRes.insertId;
      
      await pool.query('INSERT INTO employee_credentials (employee_id, password_hash) VALUES (?, ?)', [empId, passwordHash]);
      
      console.log('Manager created: email=manager@ascg.com, pw=123456');
      console.log('Employee created: email=employee@ascg.com, pw=123456');
  } catch(e) {
      console.error(e);
  } finally {
      process.exit(0);
  }
}
run();
