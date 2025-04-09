// Simple test script for the API
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET'
};

console.log('Testing API health endpoint...');

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('RESPONSE:');
    console.log(JSON.parse(data));
    console.log('\nAPI test completed successfully!');
  });
});

req.on('error', (error) => {
  console.error('Error testing API:', error.message);
});

req.end();
