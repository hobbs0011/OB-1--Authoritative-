const https = require('https');

const body = '--test\r\nContent-Disposition: form-data; name="audio"; filename="test.mp4"\r\nContent-Type: audio/mpeg\r\n\r\ntest\r\n--test--\r\n';

const req = https.request({
  hostname: 'net.mrmichaelhobbs123.workers.dev',
  path: '/api/transcribe-upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=test',
    'Content-Length': body.length,
  }
}, (res) => {
  const chunks = [];
  res.on('data', d => chunks.push(d));
  res.on('end', () => {
    console.log('status:', res.statusCode);
    console.log('body:', Buffer.concat(chunks).toString());
  });
});

req.on('error', e => console.log('err:', e.message));
req.write(body);
req.end();
