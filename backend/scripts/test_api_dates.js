const itHealthController = require('../controllers/itHealthController');

async function testDates() {
  console.log('--- Testing Date 2026-08-01 (Recorded Today) ---');
  const req1 = { query: { date: '2026-08-01', branch: 'all' } };
  const res1 = {
    json: (data) => console.log('2026-08-01 Response:', data.status, 'Branches:', data.data.length, 'Summary:', data.summary)
  };
  await itHealthController.getHealthChecks(req1, res1);

  console.log('\n--- Testing Date 2026-08-03 (Unrecorded Future Date) ---');
  const req3 = { query: { date: '2026-08-03', branch: 'all' } };
  const res3 = {
    json: (data) => console.log('2026-08-03 Response:', data.status, 'Branches:', data.data.length, 'Summary:', data.summary)
  };
  await itHealthController.getHealthChecks(req3, res3);

  process.exit(0);
}

testDates().catch(err => console.error(err));
