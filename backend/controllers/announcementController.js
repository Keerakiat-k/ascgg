const pool = require('../config/db');

exports.getAllAnnouncements = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM announcements WHERE status = 'Active' ORDER BY created_at DESC"
    );
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ status: 'error', message: 'ไม่สามารถดึงข้อมูลประกาศได้' });
  }
};

exports.createAnnouncement = async (req, res) => {
  const { title, content, type } = req.body;
  if (!title || !content) {
    return res.status(400).json({ status: 'error', message: 'กรุณากรอกหัวข้อและเนื้อหา' });
  }

  // รับชื่อไฟล์ถ้ามีการอัปโหลดมา
  const coverImage = req.file ? req.file.filename : null;

  try {
    const [result] = await pool.query(
      "INSERT INTO announcements (title, content, type, cover_image, status) VALUES (?, ?, ?, ?, 'Active')",
      [title, content, type || 'ข่าวสาร', coverImage]
    );
    res.status(201).json({ status: 'success', message: 'เพิ่มประกาศสำเร็จ', insertId: result.insertId });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ status: 'error', message: 'ไม่สามารถเพิ่มประกาศได้' });
  }
};