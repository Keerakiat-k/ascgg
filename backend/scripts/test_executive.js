const itHealthController = require('../controllers/itHealthController');

async function testExecutive() {
  console.log('--- Testing Executive Summary API ---');
  const req = { query: {} };
  const res = {
    json: (d) => console.log('Exec Summary Data:', d.status, 'Total Computers:', d.data.total_computers, 'Assets:', d.data.asset_counts)
  };
  await itHealthController.getExecutiveSummary(req, res);

  console.log('\n--- Testing Export API ---');
  const reqExp = { query: {} };
  const resExp = {
    json: (d) => console.log('Export Data:', d.status, 'Total Rows:', d.total_rows)
  };
  await itHealthController.getExportData(reqExp, resExp);

  process.exit(0);
}

testExecutive().catch(err => console.error(err));
