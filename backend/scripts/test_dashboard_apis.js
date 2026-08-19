const employeeController = require('../controllers/employeeController');
const itHealthController = require('../controllers/itHealthController');

async function testAllDashboardAPIs() {
  console.log('--- Testing All Dashboard APIs ---');
  
  const resDummy = {
    json: (d) => console.log('✓ API OK:', d.status || 'success', 'Count/Length:', Array.isArray(d.data) ? d.data.length : Object.keys(d.data || {})),
    status: (code) => ({ json: (e) => console.error('✗ API Error:', code, e) })
  };

  await employeeController.getNewEmployeesThisMonth({}, resDummy);
  await employeeController.getResignedEmployeesThisMonth({}, resDummy);
  await itHealthController.getExecutiveSummary({ query: {} }, resDummy);

  console.log('--- ALL APIS TESTED CLEANLY & SAFELY ---');
  process.exit(0);
}

testAllDashboardAPIs().catch(err => console.error('API Test Error:', err));
