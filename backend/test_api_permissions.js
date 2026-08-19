const http = require('http');

const testApi = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/employees', // Protected route
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response Body:', data);
      if (res.statusCode === 401) {
        console.log('✅ TEST PASSED: API is protected (returned 401 Without Token)');
      } else {
        console.log('❌ TEST FAILED: API is not protected as expected');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
};

console.log('Running API Permission Test (No Token)...');
testApi();
