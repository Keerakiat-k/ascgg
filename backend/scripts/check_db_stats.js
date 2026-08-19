const db = require('../config/db');

async function checkDatabaseStats() {
  const [dates] = await db.query('SELECT check_date, COUNT(*) as branch_count FROM it_health_checks GROUP BY check_date ORDER BY check_date ASC');
  console.log(`=== DATABASE STATS: ${dates.length} Days Monitored ===`);
  dates.slice(0, 5).forEach(d => console.log(`  Date: ${d.check_date.toISOString().substring(0, 10)} -> ${d.branch_count} branches`));
  console.log('  ...');
  dates.slice(-5).forEach(d => console.log(`  Date: ${d.check_date.toISOString().substring(0, 10)} -> ${d.branch_count} branches`));

  const [faults] = await db.query(`
    SELECT c.check_date, c.branch_code, c.branch_name, i.category, i.item_name, i.remarks
    FROM it_health_check_items i
    JOIN it_health_checks c ON i.check_id = c.id
    WHERE i.status = 'F'
  `);
  console.log(`\n=== FAULT / ISSUE SUMMARY: ${faults.length} total faults found ===`);
  faults.forEach(f => {
    console.log(`  [${f.check_date.toISOString().substring(0, 10)}] ${f.branch_code}: ${f.item_name} -> ${f.remarks}`);
  });

  process.exit(0);
}

checkDatabaseStats().catch(err => console.error(err));
