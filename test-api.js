import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/monthly-reports',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('Body:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
