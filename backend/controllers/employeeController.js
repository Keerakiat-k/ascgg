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


// 2. ฟังก์ชันสำหรับบันทึกพนักงานใหม่ (POST /api/employees)
exports.createEmployee = async (req, res) => {
  const data = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. บันทึกลงตารางหลัก (employees)
    const [empResult] = await connection.execute(
      `INSERT INTO employees (
        company_prefix, employee_code, email, position, department_id, role_id,
        title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en, nickname,
        date_of_birth, national_id, height, weight, blood_group, religion, marital_status, military_status,
        mobile, home_phone, personal_email, home_address, current_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.companyPrefix, data.employeeCode, data.email || null, data.position, data.departmentId, data.roleId,
        data.titleThai, data.firstName, data.lastName, data.titleEnglish || null, data.englishFirstName || null, data.englishLastName || null, data.nickname || null,
        data.dateOfBirth, data.nationalId, data.height || null, data.weight || null, data.bloodGroup || null, data.religion || null, data.maritalStatus || null, data.militaryStatus || null,
        data.mobile, data.homePhone || null, data.personalEmail || null, data.homeAddress || null, data.currentAddress || null
      ]
    );

    const employeeId = empResult.insertId;

    // 2. บันทึกลงตารางครอบครัว (employee_families)
    await connection.execute(
      `INSERT INTO employee_families (
        employee_id, parent_status, father_name, father_age, father_occupation,
        mother_name, mother_age, mother_occupation, total_siblings, male_siblings, female_siblings, sibling_rank,
        spouse_name, spouse_workplace, total_children, studying_children,
        emergency_name, emergency_relation, emergency_phone, emergency_workplace
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId, data.parentStatus || null, data.fatherName || null, data.fatherAge || null, data.fatherOccupation || null,
        data.motherName || null, data.motherAge || null, data.motherOccupation || null, data.totalSiblings || 0, data.maleSiblings || 0, data.femaleSiblings || 0, data.siblingRank || null,
        data.spouseName || null, data.spouseWorkplace || null, data.totalChildren || 0, data.studyingChildren || 0,
        data.emergencyName, data.emergencyRelation, data.emergencyPhone, data.emergencyWorkplace || null
      ]
    );

    // 3. บันทึกลงตารางข้อมูลอื่นๆ (employee_additional_info)
    await connection.execute(
      `INSERT INTO employee_additional_info (
        employee_id, thai_speak, thai_write, thai_read, eng_speak, eng_write, eng_read,
        other_lang_name, other_speak, other_write, other_read, typing_thai, typing_eng, computer_skill, office_machine,
        drive_car, car_license, car_reg, drive_moto, moto_license, moto_reg, hobbies, sports,
        severe_illness, illness_detail, expected_salary, house_type, relocation_plan, relocation_detail, self_introduction,
        ref1_name, ref1_occupation, ref1_relation, ref1_address, ref1_phone,
        ref2_name, ref2_occupation, ref2_relation, ref2_address, ref2_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId, data.thaiSpeak || null, data.thaiWrite || null, data.thaiRead || null, data.engSpeak || null, data.engWrite || null, data.engRead || null,
        data.otherLangName || null, data.otherSpeak || null, data.otherWrite || null, data.otherRead || null, data.typingThai || null, data.typingEng || null, data.computerSkill || null, data.officeMachine || null,
        data.driveCar || 'ไม่ได้', data.carLicense || null, data.carReg || null, data.driveMoto || 'ไม่ได้', data.motoLicense || null, data.motoReg || null, data.hobbies || null, data.sports || null,
        data.severeIllness || 'ไม่เคย', data.illnessDetail || null, data.expectedSalary || null, data.houseType || null, data.relocationPlan || null, data.relocationDetail || null, data.selfIntroduction || null,
        data.ref1Name || null, data.ref1Occupation || null, data.ref1Relation || null, data.ref1Address || null, data.ref1Phone || null,
        data.ref2Name || null, data.ref2Occupation || null, data.ref2Relation || null, data.ref2Address || null, data.ref2Phone || null
      ]
    );

    // 4. บันทึกประวัติการศึกษา (Array)
    if (data.educations && data.educations.length > 0) {
      for (const edu of data.educations) {
        if (edu.level && edu.institution) { 
          await connection.execute(
            `INSERT INTO employee_educations (employee_id, level, institution, major, start_date, end_date, gpa)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [employeeId, edu.level, edu.institution, edu.major || null, edu.startDate || null, edu.endDate || null, edu.gpa || null]
          );
        }
      }
    }

    // 5. บันทึกประวัติการทำงาน (Array)
    if (data.experiences && data.experiences.length > 0) {
      for (const exp of data.experiences) {
        if (exp.company) {
          await connection.execute(
            `INSERT INTO employee_experiences (employee_id, company, business_type, start_position, end_position, start_salary, end_salary, start_date, end_date, description, reason_to_leave)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [employeeId, exp.company, exp.businessType || null, exp.startPosition || null, exp.endPosition || null, exp.startSalary || null, exp.endSalary || null, exp.startDate || null, exp.endDate || null, exp.description || null, exp.reasonToLeave || null]
          );
        }
      }
    }

    // 6. บันทึกประวัติการฝึกอบรม (Array)
    if (data.trainings && data.trainings.length > 0) {
      for (const trn of data.trainings) {
        if (trn.course) {
          await connection.execute(
            `INSERT INTO employee_trainings (employee_id, course, institution, duration)
             VALUES (?, ?, ?, ?)`,
            [employeeId, trn.course, trn.institution || null, trn.duration || null]
          );
        }
      }
    }

    await connection.commit();
    res.status(201).json({ status: 'success', message: 'บันทึกข้อมูลสำเร็จ', employeeId: employeeId });

  } catch (error) {
    await connection.rollback();
    console.error('Database Error:', error);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  } finally {
    connection.release();
  }
};

// ฟังก์ชันดึงรายชื่อพนักงานทั้งหมด (GET /api/employees)
exports.getAllEmployees = async (req, res) => {
  try {
    // ดึงข้อมูลเฉพาะฟิลด์ที่จำเป็นมาโชว์ในตาราง เพื่อให้โหลดไวขึ้น
    const [rows] = await pool.query(`
      SELECT 
        id, company_prefix, employee_code, 
        CONCAT(title_th, first_name_th, ' ', last_name_th) AS full_name_th,
        position, department_id, status 
      FROM employees 
      ORDER BY created_at DESC
    `);
    
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ status: 'error', message: 'ไม่สามารถดึงข้อมูลพนักงานได้' });
  }
};

// ==========================================
// ฟังก์ชันดึงข้อมูลพนักงาน 1 คน (GET /api/employees/:id)
// ==========================================
exports.getEmployeeById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    
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
// ฟังก์ชันอัปเดตข้อมูลพนักงาน (PUT /api/employees/:id)
// ==========================================
exports.updateEmployee = async (req, res) => {
  const data = req.body;
  const id = req.params.id;

  try {
    // ตัวอย่างนี้เป็นการอัปเดตเฉพาะตารางหลัก (employees) ก่อน เพื่อความรวดเร็ว
    await pool.execute(
      `UPDATE employees SET 
        company_prefix = ?, position = ?, department_id = ?, role_id = ?, email = ?,
        title_th = ?, first_name_th = ?, last_name_th = ?, 
        title_en = ?, first_name_en = ?, last_name_en = ?, nickname = ?,
        date_of_birth = ?, national_id = ?, height = ?, weight = ?, 
        blood_group = ?, religion = ?, marital_status = ?, military_status = ?,
        mobile = ?, home_phone = ?, personal_email = ?, home_address = ?, current_address = ?
      WHERE id = ?`,
      [
        data.companyPrefix, data.position, data.departmentId, data.roleId, data.email || null,
        data.titleThai, data.firstName, data.lastName, 
        data.titleEnglish || null, data.englishFirstName || null, data.englishLastName || null, data.nickname || null,
        data.dateOfBirth, data.nationalId, data.height || null, data.weight || null, 
        data.bloodGroup || null, data.religion || null, data.maritalStatus || null, data.militaryStatus || null,
        data.mobile, data.homePhone || null, data.personalEmail || null, data.homeAddress || null, data.currentAddress || null,
        id // ใส่ ID ไว้ตัวสุดท้ายสำหรับ WHERE condition
      ]
    );

    res.status(200).json({ status: 'success', message: 'อัปเดตข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
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
    await pool.execute(
      `UPDATE employees SET 
        company_prefix = ?, employee_code = ?, position = ?, department_id = ?, role_id = ?, email = ?,
        title_th = ?, first_name_th = ?, last_name_th = ?, 
        title_en = ?, first_name_en = ?, last_name_en = ?, nickname = ?,
        date_of_birth = ?, national_id = ?, height = ?, weight = ?, 
        blood_group = ?, religion = ?, marital_status = ?, military_status = ?,
        mobile = ?, home_phone = ?, personal_email = ?, home_address = ?, current_address = ?
      WHERE id = ?`,
      [
        data.companyPrefix, data.employeeCode, data.position, data.departmentId, data.roleId, data.email || null, // 🌟 เพิ่ม data.employeeCode ตรงนี้
        data.titleThai, data.firstName, data.lastName, 
        data.titleEnglish || null, data.englishFirstName || null, data.englishLastName || null, data.nickname || null,
        data.dateOfBirth, data.nationalId, data.height || null, data.weight || null, 
        data.bloodGroup || null, data.religion || null, data.maritalStatus || null, data.militaryStatus || null,
        data.mobile, data.homePhone || null, data.personalEmail || null, data.homeAddress || null, data.currentAddress || null,
        id 
      ]
    );

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
  const { status } = req.body; // ค่าที่ส่งมาจะเป็น 'Inactive'

  try {
    await pool.execute(
      'UPDATE employees SET status = ? WHERE id = ?',
      [status, id]
    );

    res.status(200).json({ status: 'success', message: 'อัปเดตสถานะสำเร็จ' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' });
  }
};