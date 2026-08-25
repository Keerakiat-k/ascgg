// ดึงการเชื่อมต่อ Database เข้ามา (แก้ไขพาธ ../config/db ให้ตรงกับโปรเจกต์คุณ)
const pool = require('../config/db'); 

// 1. ฟังก์ชันดึงรหัสพนักงานอัตโนมัติ (แบบมีปี พ.ศ. 2 หลัก)
exports.getNextEmployeeCode = async (req, res) => {
    const { prefix } = req.query;
    if (!prefix) {
        return res.status(400).json({ status: 'error', message: 'กรุณาระบุบริษัท (prefix)' });
    }

    try {
        // 1. ดึงปี พ.ศ. ปัจจุบันแบบ 2 หลัก (เช่น ปี 2026 + 543 = 2569 -> จะได้ '69')
        const currentYear = (new Date().getFullYear() + 543).toString().slice(-2);
        
        // 2. สร้างคำค้นหา (เช่น 'CST69%') เพื่อหาเฉพาะรหัสของบริษัทนี้และปีนี้
        const searchPattern = `${prefix}${currentYear}%`;

        // 3. ค้นหาในฐานข้อมูล
        const [rows] = await pool.query(
            `SELECT employee_code FROM employees WHERE company_prefix = ? AND employee_code LIKE ? ORDER BY employee_code DESC LIMIT 1`,
            [prefix, searchPattern]
        );

        let nextNumber = 1;
        
        if (rows.length > 0) {
            const lastCode = rows[0].employee_code; // สมมติได้ 'CST69001'
            
            // 4. ตัด prefix และ ปี ออก (CST69) เพื่อเอาแค่ตัวเลขด้านหลังมาบวก 1
            const prefixWithYear = `${prefix}${currentYear}`;
            const lastNumberStr = lastCode.replace(prefixWithYear, '');
            const lastNumber = parseInt(lastNumberStr, 10);
            
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        // 5. นำมาประกอบร่าง: Prefix + Year (2 หลัก) + Running Number (3 หลัก)
        const nextCode = `${prefix}${currentYear}${String(nextNumber).padStart(3, '0')}`; 
        
        res.json({ status: 'success', nextCode });
    } catch (error) {
        console.error('Error generating employee code:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};


// ==========================================
// Helper: Get or Create Department
// ==========================================
async function getOrCreateDepartment(connection, deptName) {
  if (!deptName) return null;
  // Check if exists
  const [rows] = await connection.execute('SELECT id FROM departments WHERE name = ? LIMIT 1', [deptName]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  // Create if not exists
  const uniqueCode = Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000);
  const [result] = await connection.execute('INSERT INTO departments (code, name) VALUES (?, ?)', [uniqueCode.substring(0, 20), deptName]);
  return result.insertId;
}

// ==========================================
// Helper: Get or Create Position
// ==========================================
async function getOrCreatePosition(connection, positionTitle) {
  if (!positionTitle) return null;
  // Check if exists
  const [rows] = await connection.execute('SELECT id FROM positions WHERE title = ? LIMIT 1', [positionTitle]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  // Create if not exists (default level: 'Staff')
  const [result] = await connection.execute('INSERT INTO positions (title, level) VALUES (?, ?)', [positionTitle, 'Staff']);
  return result.insertId;
}

// 2. ฟังก์ชันสำหรับบันทึกพนักงานใหม่ (POST /api/employees)
exports.createEmployee = async (req, res) => {
  const data = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let finalDeptId = data.departmentId;
    if (data.departmentName && !data.departmentId) {
      finalDeptId = await getOrCreateDepartment(connection, data.departmentName);
    } else if (data.departmentName && isNaN(parseInt(data.departmentName))) {
      finalDeptId = await getOrCreateDepartment(connection, data.departmentName);
    }

    if (data.position) {
      await getOrCreatePosition(connection, data.position);
    }

    const [empResult] = await connection.execute(
      `INSERT INTO employees (
        company_prefix, employee_code, email, use_domain, position, 
        department_id, role_id,
        title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en, nickname,
        mobile, start_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.companyPrefix || null, data.employeeCode || null, data.email || null, data.useDomain ? 1 : 0, data.position || null, 
        finalDeptId || null, data.roleId || 3,
        data.titleThai || null, data.firstName || null, data.lastName || null, data.titleEnglish || null, data.englishFirstName || null, data.englishLastName || null, data.nickname || null,
        data.mobile || null, data.startDate || null, data.status || 'Active'
      ]
    );

    const employeeId = empResult.insertId;

    await connection.commit();
    res.status(201).json({ status: 'success', message: 'บันทึกข้อมูลสำเร็จ', employeeId: employeeId });

  } catch (error) {
    await connection.rollback();
    console.error('Database Error:', error);
    res.status(500).json({ status: 'error', message: error.sqlMessage || error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  } finally {
    connection.release();
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    // ดึงข้อมูลผู้ใช้งานระบบและข้อมูลจำเป็นสำหรับใส่ในทรัพย์สินบริษัท
    const [rows] = await pool.query(`
      SELECT 
        e.id, e.company_prefix, e.employee_code, 
        CONCAT(COALESCE(e.title_th,''), e.first_name_th, ' ', e.last_name_th) AS full_name_th,
        e.first_name_th, e.last_name_th, e.nickname, e.email, 
        e.mobile AS phone,
        e.position, e.department_id, d.name AS department_name, e.status, e.start_date, e.created_at, e.role_id, e.profile_image,
        r.name AS role_name,
        (SELECT COUNT(*) FROM assets a WHERE a.assigned_to = e.id OR a.assigned_to = e.employee_code) AS asset_count
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN roles r ON e.role_id = r.id
      WHERE e.employee_code NOT IN ('ADM-001', 'HR-001')
      ORDER BY e.created_at DESC
    `);
    
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching system users:', error);
    res.status(500).json({ status: 'error', message: 'ไม่สามารถดึงข้อมูลผู้ใช้งานระบบได้' });
  }
};

// ==========================================
// 4. ดึงข้อมูลแผนกทั้งหมด
// ==========================================
exports.getAllDepartments = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departments ORDER BY name ASC');
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนก' });
  }
};

// ==========================================
// 5. ดึงข้อมูลพนักงานตาม ID (GET /api/employees/:id)
// ==========================================
exports.getEmployeeById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.*, d.name as department_name, e.resignation_date
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'ไม่พบข้อมูลพนักงาน' });
    }
    
    res.status(200).json({ status: 'success', data: rows[0] });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
};

// ==========================================
// ฟังก์ชันดึงรายชื่อบริษัททั้งหมด (GET /api/companies)
// ==========================================
exports.getAllCompanies = async (req, res) => {
  try {
    // ดึงเฉพาะบริษัทที่ status = 'Active' 
    const [rows] = await pool.query(
      "SELECT prefix, name FROM companies WHERE status = 'Active' ORDER BY id ASC"
    );
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ status: 'error', message: 'ไม่สามารถดึงข้อมูลบริษัทได้' });
  }
};

// ==========================================
// ฟังก์ชันอัปเดตข้อมูลพนักงาน (PUT /api/employees/:id)
// ==========================================
exports.updateEmployee = async (req, res) => {
  const data = req.body;
  const id = req.params.id;

  try {
    let finalDeptId = data.departmentId;
    if (data.departmentName && !data.departmentId) {
      finalDeptId = await getOrCreateDepartment(pool, data.departmentName);
    } else if (data.departmentName && isNaN(parseInt(data.departmentName))) {
      finalDeptId = await getOrCreateDepartment(pool, data.departmentName);
    }

    if (data.position) {
      await getOrCreatePosition(pool, data.position);
    }

    await pool.execute(
      `UPDATE employees SET 
        company_prefix = ?, employee_code = ?, position = ?, department_id = ?, role_id = ?, email = ?, use_domain = ?,
        title_th = ?, first_name_th = ?, last_name_th = ?, 
        title_en = ?, first_name_en = ?, last_name_en = ?, nickname = ?,
        mobile = ?, status = ?, resignation_date = ?, start_date = ?
      WHERE id = ?`,
      [
        data.companyPrefix || null, data.employeeCode || null, data.position || null, finalDeptId || null, data.roleId || null, data.email || null, data.useDomain ? 1 : 0,
        data.titleThai || null, data.firstName || null, data.lastName || null, 
        data.titleEnglish || null, data.englishFirstName || null, data.englishLastName || null, data.nickname || null,
        data.mobile || null, data.status || 'Active', data.resignationDate || null, data.startDate || null,
        id 
      ]
    );

    // ถ้าระบุสถานะว่าลาออก (Resigned) ให้ระงับสิทธิ์โดยอัตโนมัติ
    if (data.status === 'Resigned') {
      await pool.execute('DELETE FROM employee_credentials WHERE employee_id = ?', [id]);
      await pool.execute(
        'UPDATE employees SET access_granted = 0, access_revoked = 1, role_id = 3 WHERE id = ?',
        [id]
      );
    }

    res.status(200).json({ status: 'success', message: 'อัปเดตข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
  }
};

// ==========================================
// ฟังก์ชันอัปเดตสถานะพนักงาน (เช่น ลาออก) (PUT /api/employees/:id/status)
// ==========================================
exports.updateEmployeeStatus = async (req, res) => {
  const { id } = req.params;
  const { status, resignationDate } = req.body; 

  try {
    await pool.execute(
      'UPDATE employees SET status = ?, resignation_date = ? WHERE id = ?',
      [status, resignationDate || null, id]
    );

    // ถ้าระบุสถานะว่าลาออก (Resigned) เราจะไม่ระงับสิทธิ์ทันที
    // เพื่อให้ไปแสดงที่ Offboarding Tracker สำหรับ IT/Admin ดำเนินการต่อ


    res.status(200).json({ status: 'success', message: 'อัปเดตสถานะสำเร็จ' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
  }
};

// ==========================================
// ฟังก์ชันดึงพนักงานที่ลาออกในเดือนปัจจุบัน
// ==========================================
exports.getResignedEmployeesThisMonth = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, company_prefix, employee_code, 
        CONCAT(COALESCE(title_th,''), first_name_th, ' ', last_name_th) AS full_name_th,
        position, resignation_date 
      FROM employees 
      WHERE status = 'Resigned' 
        AND resignation_date IS NOT NULL 
        AND COALESCE(access_revoked, 0) = 0
        AND MONTH(resignation_date) = MONTH(CURRENT_DATE())
        AND YEAR(resignation_date) = YEAR(CURRENT_DATE())
        AND employee_code NOT IN ('ADM-001', 'HR-001')
      ORDER BY resignation_date DESC
    `);
    
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching resigned employees:', error);
    res.status(500).json({ status: 'error', message: 'ไม่สามารถดึงข้อมูลพนักงานที่ลาออกได้' });
  }
};

// ==========================================
// ฟังก์ชันอัปเดตเพิกถอนสิทธิ์พนักงาน (PUT /api/employees/:id/revoke-access)
// ==========================================
exports.revokeEmployeeAccess = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. ลบข้อมูลรหัสผ่านออกจาก employee_credentials
    await pool.execute('DELETE FROM employee_credentials WHERE employee_id = ?', [id]);
    
    // 2. ปิดการเข้าถึงและตั้งค่า Role กลับเป็นค่าเริ่มต้น (3 = Employee) 
    await pool.execute(
      'UPDATE employees SET access_granted = 0, access_revoked = 1, role_id = 3 WHERE id = ?',
      [id]
    );

    res.status(200).json({ status: 'success', message: 'เพิกถอนสิทธิ์เรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error revoking access:', error);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการเพิกถอนสิทธิ์' });
  }
};

// ==========================================
// ฟังก์ชันดึงพนักงานใหม่ในเดือนนี้
// ==========================================
exports.getNewEmployeesThisMonth = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, company_prefix, employee_code, 
        CONCAT(COALESCE(title_th,''), first_name_th, ' ', last_name_th) AS full_name_th,
        first_name_en, last_name_en,
        position, start_date 
      FROM employees 
      WHERE status = 'Active' 
        AND COALESCE(access_granted, 0) = 0
        AND employee_code NOT IN ('ADM-001', 'HR-001')
      ORDER BY created_at DESC
    `);
    
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching new employees:', error);
    res.status(500).json({ status: 'error', message: 'ไม่สามารถดึงข้อมูลพนักงานใหม่ได้' });
  }
};

// ==========================================
// ฟังก์ชันอัปเดตการสร้างสิทธิ์พนักงานใหม่ (PUT /api/employees/:id/grant-access)
// ==========================================
exports.grantEmployeeAccess = async (req, res) => {
  const { id } = req.params;
  const { email, useDomain } = req.body;

  try {
    // 0. ดึงข้อมูลพนักงานเพื่อเอาชื่อ-นามสกุลมาสร้างรหัสผ่าน
    const [empRows] = await pool.execute('SELECT first_name_en, last_name_en, first_name_th, last_name_th FROM employees WHERE id = ?', [id]);
    let defaultPassword = 'password123';
    if (empRows.length > 0) {
      const emp = empRows[0];
      const fn = emp.first_name_en || emp.first_name_th || 'X';
      const ln = emp.last_name_en || emp.last_name_th || 'X';
      const initialF = fn.charAt(0).toUpperCase();
      const initialL = ln.charAt(0).toUpperCase();
      defaultPassword = `P@ssw0rd${initialF}${initialL}`;
    }

    // 1. อัปเดตสิทธิ์ในตาราง employees
    await pool.execute(
      'UPDATE employees SET access_granted = 1, email = ?, use_domain = ? WHERE id = ?',
      [email || null, useDomain ? 1 : 0, id]
    );

    // 2. สร้างรหัสผ่านเริ่มต้น (Default Password)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 3. บันทึกลง employee_credentials (ใช้ ON DUPLICATE KEY UPDATE เผื่อมีอยู่แล้ว)
    await pool.execute(`
      INSERT INTO employee_credentials (employee_id, password_hash) 
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE password_hash = ?
    `, [id, hashedPassword, hashedPassword]);

    res.status(200).json({ status: 'success', message: `สร้างสิทธิ์เรียบร้อยแล้ว (รหัสผ่านเริ่มต้น: ${defaultPassword})` });
  } catch (error) {
    console.error('Error granting access:', error);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการสร้างสิทธิ์' });
  }
};

// ==========================================
// ฟังก์ชันดึงสถิติเข้าออกพนักงานรายเดือน (GET /api/employees/stats/turnover)
// ==========================================
exports.getTurnoverStats = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    
    // ดึงพนักงานที่เข้าใหม่ในปีนี้
    const [newEmps] = await pool.query(`
      SELECT MONTH(start_date) as month, COUNT(*) as count 
      FROM employees 
      WHERE YEAR(start_date) = ? AND start_date IS NOT NULL
      AND employee_code NOT IN ('ADM-001', 'HR-001')
      GROUP BY MONTH(start_date)
    `, [year]);
    
    // ดึงพนักงานที่ลาออกในปีนี้
    const [resignedEmps] = await pool.query(`
      SELECT MONTH(resignation_date) as month, COUNT(*) as count 
      FROM employees 
      WHERE status = 'Resigned' AND YEAR(resignation_date) = ? 
      AND employee_code NOT IN ('ADM-001', 'HR-001')
      GROUP BY MONTH(resignation_date)
    `, [year]);

    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const data = thaiMonths.map((name, index) => {
      const monthIndex = index + 1;
      const newCount = newEmps.find(n => n.month === monthIndex)?.count || 0;
      const resignedCount = resignedEmps.find(r => r.month === monthIndex)?.count || 0;
      return { name, new: newCount, resigned: resignedCount };
    });

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    console.error('Error fetching turnover stats:', error);
    res.status(500).json({ status: 'error', message: 'ไม่สามารถดึงข้อมูลสถิติได้' });
  }
};

// ==========================================
// ฟังก์ชันดึงกิจกรรมล่าสุด (GET /api/employees/stats/recent-activity)
// ==========================================
exports.getRecentActivity = async (req, res) => {
  try {
    // พนักงานเข้าใหม่ล่าสุด 5 คน
    const [newEmps] = await pool.query(`
      SELECT id, CONCAT(title_th, first_name_th, ' ', last_name_th) AS name, start_date as date, 'new' as type, position
      FROM employees 
      WHERE start_date IS NOT NULL
      AND employee_code NOT IN ('ADM-001', 'HR-001')
      ORDER BY start_date DESC 
      LIMIT 5
    `);
    
    // พนักงานลาออกล่าสุด 5 คน
    const [resignedEmps] = await pool.query(`
      SELECT id, CONCAT(title_th, first_name_th, ' ', last_name_th) AS name, resignation_date as date, 'resigned' as type, position
      FROM employees 
      WHERE status = 'Resigned' AND resignation_date IS NOT NULL
      AND employee_code NOT IN ('ADM-001', 'HR-001')
      ORDER BY resignation_date DESC 
      LIMIT 5
    `);

    // รวมแล้วเรียงตามวันที่ล่าสุด
    const combined = [...newEmps, ...resignedEmps]
      .filter(item => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.status(200).json({ status: 'success', data: combined });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ status: 'error', message: 'ไม่สามารถดึงข้อมูลกิจกรรมได้' });
  }
};

// ==========================================
// ฟังก์ชันดึงรายชื่อบัญชีระบบ (คนที่เข้าใช้งานระบบได้)
// ==========================================
exports.getSystemAccounts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.id, e.company_prefix, e.employee_code, e.email,
        CONCAT(e.title_th, e.first_name_th, ' ', e.last_name_th) AS full_name_th,
        e.position, e.department_id, e.status, e.start_date, e.created_at, e.role_id,
        r.name as role_name
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.id
      WHERE e.status != 'Resigned' AND (e.access_granted = 1 OR e.email IS NOT NULL OR e.employee_code IN ('ADM-001', 'HR-001'))
      ORDER BY e.created_at DESC
    `);
    
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching system accounts:', error);
    res.status(500).json({ status: 'error', message: 'ไม่สามารถดึงข้อมูลบัญชีระบบได้' });
  }
};

// ==========================================
// ฟังก์ชันอัปเดต Role ของพนักงาน
// ==========================================
exports.updateEmployeeRole = async (req, res) => {
  const { id } = req.params;
  const { roleId } = req.body;

  try {
    await pool.execute('UPDATE employees SET role_id = ? WHERE id = ?', [roleId, id]);
    res.status(200).json({ status: 'success', message: 'อัปเดตสิทธิ์การใช้งานสำเร็จ' });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการอัปเดตสิทธิ์' });
  }
};

// ==========================================
// ฟังก์ชันรีเซ็ตรหัสผ่าน (ยังไม่ได้ implement เข้ารหัสจริง เป็นจำลองไปก่อน)
// ==========================================
exports.resetEmployeePassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    // ในอนาคตควรใช้ bcrypt.hash ที่นี่ (ตอนนี้จำลองไปก่อนเพราะเราใช้ตาราง employees อย่างเดียว หรือ employee_credentials)
    // ถ้าระบบจริงมีตาราง employee_credentials ก็ควรอัปเดตที่นั่น
    // เราจะใช้ bcrypt เพื่อแฮช
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // อัปเดตในตาราง employees เผื่อเก็บไว้ หรือถ้ามี employee_credentials ก็อัปเดตที่นั่น
    // เนื่องจากเราใช้ authController เช็คจาก employee_credentials เราจะอัปเดตที่นั่น
    await pool.execute('UPDATE employee_credentials SET password_hash = ? WHERE employee_id = ?', [hashedPassword, id]);
    
    res.status(200).json({ status: 'success', message: 'รีเซ็ตรหัสผ่านสำเร็จ' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' });
  }
};

// =========================================
// แจ้งเตือนพนักงานใหม่ทางอีเมล
// =========================================
exports.sendWelcomeEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(`
            SELECT e.*, d.name as department_name, c.name as company_name 
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN companies c ON e.company_prefix = c.prefix
            WHERE e.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'ไม่พบข้อมูลพนักงาน' });
        }
        const emp = rows[0];

        const { getSmtpSettings, createTransporter } = require('./emailSettingsController');
        
        // ใช้การตั้งค่าอีเมลของ HR (หรือ IT ถ้าไม่มี)
        let settings = await getSmtpSettings('HR');
        if (!settings) settings = await getSmtpSettings('IT');

        if (!settings || !settings.smtp_host || !settings.smtp_user) {
            return res.status(400).json({ status: 'error', message: 'ยังไม่ได้ตั้งค่าระบบส่งอีเมล (HR/IT) กรุณาตั้งค่าก่อน' });
        }

        // ผู้รับ: ให้ส่งหาอีเมลที่ตั้งค่าไว้ในระบบ (to_emails)
        if (!settings.to_emails && !settings.cc_emails && !settings.bcc_emails) {
            return res.status(400).json({ status: 'error', message: 'ยังไม่ได้ระบุอีเมลผู้รับ (To, CC, BCC) ในการตั้งค่าอีเมล' });
        }

        const transporter = createTransporter(settings);

        const defaultHtmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">🎉 แจ้งพนักงานใหม่เข้าทำงาน</h2>
                </div>
                <div style="padding: 20px;">
                    <h3 style="color: #1e293b; margin-top: 0;">เรียนทีมงานที่เกี่ยวข้อง,</h3>
                    <p style="color: #334155; line-height: 1.6;">
                        ขอแจ้งให้ทราบว่ามีพนักงานใหม่เข้ามาในระบบ โดยมีรายละเอียดดังนี้:
                    </p>
                    <ul style="color: #334155; line-height: 1.6; background: #f8fafc; padding: 15px 30px; border-radius: 5px;">
                        <li><strong>ชื่อ-นามสกุล:</strong> {{first_name}} {{last_name}}</li>
                        <li><strong>รหัสพนักงาน:</strong> {{employee_code}}</li>
                        <li><strong>ตำแหน่ง:</strong> {{position}}</li>
                        <li><strong>แผนก:</strong> {{department}}</li>
                        <li><strong>บริษัท:</strong> {{company}}</li>
                        <li><strong>วันเริ่มงาน:</strong> {{start_date}}</li>
                    </ul>
                    <p style="color: #334155; line-height: 1.6;">
                        โปรดดำเนินการในส่วนที่เกี่ยวข้อง (เช่น เตรียมอุปกรณ์, สิทธิ์การเข้าระบบ ฯลฯ)
                    </p>
                    <br/>
                    <p style="color: #334155; margin-bottom: 0;">ขอแสดงความนับถือ,<br/>ระบบจัดการพนักงาน (ASCG)</p>
                </div>
                <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
                    <p style="margin: 0;">นี่คืออีเมลอัตโนมัติจากระบบ ASCG กรุณาอย่าตอบกลับ</p>
                </div>
            </div>
        `;

        let htmlContent = settings.welcome_template || defaultHtmlContent;

        // Replace placeholders with actual employee data
        htmlContent = htmlContent
            .replace(/{{first_name}}/g, emp.first_name_th || '')
            .replace(/{{last_name}}/g, emp.last_name_th || '')
            .replace(/{{employee_code}}/g, emp.employee_code || '')
            .replace(/{{position}}/g, emp.position_name || emp.position || '')
            .replace(/{{department}}/g, emp.department_name || '')
            .replace(/{{company}}/g, emp.company_name || '')
            .replace(/{{email}}/g, emp.email || '')
            .replace(/{{start_date}}/g, emp.start_date ? new Date(emp.start_date).toLocaleDateString('th-TH') : '');

        const mailOptions = {
            from: `"${settings.from_name}" <${settings.from_email}>`,
            subject: `แจ้งเตือนพนักงานใหม่: ${emp.first_name_th} ${emp.last_name_th}`,
            html: htmlContent,
        };

        if (settings.to_emails) mailOptions.to = settings.to_emails;
        if (settings.cc_emails) mailOptions.cc = settings.cc_emails;
        if (settings.bcc_emails) mailOptions.bcc = settings.bcc_emails;
        
        await transporter.sendMail(mailOptions);

        res.json({ status: 'success', message: 'ส่งอีเมลต้อนรับเรียบร้อยแล้ว' });

    } catch (error) {
        console.error('Error sending welcome email:', error);
        res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการส่งอีเมล' });
    }
};

// ==========================================
// 12. อัปโหลดรูปโปรไฟล์พนักงาน
// ==========================================
exports.uploadProfileImage = async (req, res) => {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ status: 'error', message: 'กรุณาแนบไฟล์รูปภาพ' });
    }

    try {
        const imageUrl = `/uploads/profiles/${file.filename}`;
        
        await pool.query('UPDATE employees SET profile_image = ? WHERE id = ?', [imageUrl, id]);
        
        res.json({ 
            status: 'success', 
            message: 'อัปโหลดรูปโปรไฟล์สำเร็จ',
            profile_image: imageUrl 
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ status: 'error', message: 'ไม่สามารถบันทึกรูปโปรไฟล์ได้' });
    }
};