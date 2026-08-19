const db = require('../config/db');

async function cleanFutureData() {
  console.log('--- Cleaning Future Unrecorded Health Checks (date > 2026-08-01) ---');
  
  // ลบข้อมูลที่เป็นวันที่ในอนาคต (เกินกว่าวันที่ปัจจุบัน 2026-08-01)
  const [result] = await db.query('DELETE FROM it_health_checks WHERE check_date > "2026-08-01"');
  console.log(`Deleted ${result.affectedRows} future check records.`);

  const [remaining] = await db.query('SELECT check_date, COUNT(*) as c FROM it_health_checks GROUP BY check_date');
  console.log('Remaining dates in DB:');
  remaining.forEach(r => {
    console.log(`  Date: ${r.check_date.toISOString().substring(0, 10)} -> ${r.c} branches`);
  });

  process.exit(0);
}

cleanFutureData().catch(err => console.error(err));
