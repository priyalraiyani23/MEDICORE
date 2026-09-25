const http = require('http');

const data = JSON.stringify({ symptoms: "headache and fever" });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/ai/symptom-checker',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
