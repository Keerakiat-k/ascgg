const itHealthController = require('../controllers/itHealthController');

async function testBackend() {
  const req = { query: { date: '2026-08-01', branch: 'all' } };
  const res = {
    json: (data) => console.log('API Response Success:', data.status, 'Branches:', data.data.length, 'Summary:', data.summary),
    status: (code) => ({ json: (err) => console.error('API Error:', code, err) })
  };
  await itHealthController.getHealthChecks(req, res);
  process.exit(0);
}

testBackend().catch(err => console.error(err));
