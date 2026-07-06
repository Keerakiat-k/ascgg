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