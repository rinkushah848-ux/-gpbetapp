const http = require('http');
const payload = JSON.stringify({ username: 'testuser', password: 'password123', uid: 'GAMETEST123' });
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = http.request(options, (res) => {
  console.log('status', res.statusCode);
  res.setEncoding('utf8');
  res.on('data', (chunk) => process.stdout.write(chunk));
  res.on('end', () => process.stdout.write('\n'));
});

req.on('error', (err) => {
  console.error('req error', err);
});

req.write(payload);
req.end();
