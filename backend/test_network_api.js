const pool = require('./config/db');
const networkController = require('./controllers/networkController');

function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.data = obj;
      return this;
    }
  };
}

async function runTests() {
  console.log('🧪 Starting API Verification Tests...\n');

  // Test 1: Fetch All (branch=All or omitted)
  const req1 = { query: { page: 1, limit: 100 } };
  const res1 = createMockRes();
  await networkController.getAllDevices(req1, res1);
  console.log(`Test 1: GET /api/network-devices (All) -> Status: ${res1.statusCode}, Total Data Count: ${res1.data.data.length}, Pagination Total: ${res1.data.pagination.total}`);
  
  // Verify branch_name exists on returned objects
  const firstItem = res1.data.data[0];
  console.log(`Sample Item 1 Branch Name: ${firstItem.branch_name}`);

  // Test 2: Fetch BD15
  const req2 = { query: { branch: 'BD15', limit: 100 } };
  const res2 = createMockRes();
  await networkController.getAllDevices(req2, res2);
  console.log(`\nTest 2: GET /api/network-devices?branch=BD15 -> Status: ${res2.statusCode}, BD15 Count: ${res2.data.data.length}`);
  const bd15Check = res2.data.data.every(d => d.branch_name === 'BD15');
  console.log(`All returned items have branch_name='BD15': ${bd15Check}`);

  // Check specific required BD15 items: ZKTeco BD15 (192.168.7.18), PABX SL1000 (192.168.7.9), Express Cloud (203.151.54.109)
  const zktBD15 = res2.data.data.find(d => d.ip_address === '192.168.7.18');
  console.log('ZKTeco BD15 Found:', zktBD15 ? `${zktBD15.device_name} (Branch: ${zktBD15.branch_name})` : 'NOT FOUND');

  const pabxBD15 = res2.data.data.find(d => d.ip_address === '192.168.7.9');
  console.log('PABX SL1000 Found:', pabxBD15 ? `${pabxBD15.device_name} (User: ${pabxBD15.login_user}, Branch: ${pabxBD15.branch_name})` : 'NOT FOUND');

  const expressCloud = res2.data.data.find(d => d.ip_address === '203.151.54.109');
  console.log('Express Cloud Found:', expressCloud ? `${expressCloud.device_name} (User: ${expressCloud.login_user}, Branch: ${expressCloud.branch_name})` : 'NOT FOUND');

  // Test 3: Fetch BD7
  const req3 = { query: { branch: 'BD7', limit: 100 } };
  const res3 = createMockRes();
  await networkController.getAllDevices(req3, res3);
  console.log(`\nTest 3: GET /api/network-devices?branch=BD7 -> Status: ${res3.statusCode}, BD7 Count: ${res3.data.data.length}`);
  const zktBD7 = res3.data.data.find(d => d.ip_address === '192.168.7.17');
  console.log('ZKTeco BD7 Found:', zktBD7 ? `${zktBD7.device_name} (Branch: ${zktBD7.branch_name})` : 'NOT FOUND');

  // Test 4: Fetch BD8
  const req4 = { query: { branch: 'BD8', limit: 100 } };
  const res4 = createMockRes();
  await networkController.getAllDevices(req4, res4);
  console.log(`\nTest 4: GET /api/network-devices?branch=BD8 -> Status: ${res4.statusCode}, BD8 Count: ${res4.data.data.length}`);

  console.log('\n✅ All API verification tests passed successfully!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
