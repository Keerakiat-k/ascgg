const pool = require('../config/db'); // ตรวจสอบพาทให้ตรงกับไฟล์ db ของคุณ

// 1. รับเรื่องแจ้งปัญหาใหม่จากพนักงาน (POST)
exports.createTicket = async (req, res) => {
  const { name, department, category, urgency, description } = req.body;

  try {
    // --- 🌟 เริ่มสร้างรหัสแบบ IT-6907001 🌟 ---
    const now = new Date();
    // 1. หาปี พ.ศ. เอาแค่ 2 ตัวท้าย (เช่น 2026 + 543 = 2569 ตัดเหลือ '69')
    const thaiYear = (now.getFullYear() + 543).toString().slice(-2);
    // 2. หาเดือน (บวก 1 เพราะ JS เริ่มเดือน 0) และเติม 0 ข้างหน้าถ้าเป็นเลขหลักเดียว (เช่น '07')
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // คำนำหน้ารหัสของเดือนนี้ เช่น 'IT-6907'
    const prefix = `IT-${thaiYear}${month}`;

    // 3. ค้นหารหัสล่าสุดในฐานข้อมูลที่ขึ้นต้นด้วย 'IT-6907'
    const [rows] = await pool.query(
      `SELECT ticket_no FROM it_supports WHERE ticket_no LIKE ? ORDER BY ticket_no DESC LIMIT 1`,
      [`${prefix}%`] // ค้นหา IT-6907%
    );

    let runningNum = 1; // เริ่มที่ 1
    if (rows.length > 0) {
      // ถ้ามีข้อมูลเดือนนี้อยู่แล้ว ให้ดึงรหัสล่าสุดมา เช่น 'IT-6907001'
      const lastTicket = rows[0].ticket_no; 
      // ตัดเอา 3 ตัวท้ายสุดมาทำเป็นตัวเลข แล้วบวก 1 (จะได้ 2)
      runningNum = parseInt(lastTicket.slice(-3), 10) + 1;
    }

    // 4. แปลงเลขรันนิ่งกลับเป็น 3 หลัก (เช่น 2 -> '002')
    const runningStr = runningNum.toString().padStart(3, '0');
    
    // ประกอบร่างเป็นรหัสสมบูรณ์ -> 'IT-6907002'
    const ticketNo = `${prefix}${runningStr}`;
    // --- 🌟 จบการสร้างรหัส 🌟 ---


    // บันทึกลงฐานข้อมูลด้วยรหัสใหม่
    const [result] = await pool.execute(
      `INSERT INTO it_supports (ticket_no, name, department, category, urgency, description, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'รอรับเรื่อง')`,
      [ticketNo, name, department, category, urgency, description]
    );

    res.status(201).json({ 
      status: 'success', 
      message: 'ส่งแจ้งปัญหาสำเร็จ',
      ticket_no: ticketNo
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  }
};

// 2. ดึงรายการแจ้งปัญหาทั้งหมดสำหรับ Admin (GET)
exports.getAllTickets = async (req, res) => {
  try {
    // ดึงข้อมูลเรียงจากวันที่แจ้งล่าสุดขึ้นก่อน
    const [rows] = await pool.query(
      'SELECT * FROM it_supports ORDER BY created_at DESC'
    );
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ status: 'error', message: 'ไม่สามารถดึงข้อมูลรายการได้' });
  }
};

// 3. อัปเดตสถานะและข้อมูลผู้รับผิดชอบโดย Admin (PUT)
exports.updateTicket = async (req, res) => {
  const { id } = req.params;
  const { status, admin_note, assigned_to } = req.body;

  try {
    await pool.execute(
      `UPDATE it_supports 
       SET status = ?, admin_note = ?, assigned_to = ? 
       WHERE id = ?`,
      [status, admin_note, assigned_to, id]
    );

    res.status(200).json({ status: 'success', message: 'อัปเดตข้อมูลสำเร็จ' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
  }
};