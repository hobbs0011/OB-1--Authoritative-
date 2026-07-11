const fs = require('fs');
const https = require('https');

const fp = 'D:/OB-1-CANONICAL/APPS/NET-PET-AI/public/audio/mai-tram-july05-16k.mp4';
const stat = fs.statSync(fp);
const boundary = '----UploadBoundary' + Date.now();
const prefix = Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="audio"; filename="mai-tram-july05.mp4"\r\nContent-Type: audio/mpeg\r\n\r\n');
const suffix = Buffer.from('\r\n--' + boundary + '--\r\n');
const buf = fs.readFileSync(fp);
const body = Buffer.concat([prefix, buf, suffix]);

console.log(`Uploading ${(stat.size / 1024 / 1024).toFixed(1)} MB...`);

const req = https.request({
  hostname: 'net.mrmichaelhobbs123.workers.dev',
  path: '/api/transcribe-upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': body.length,
  }
}, (res) => {
  const chunks = [];
  res.on('data', d => chunks.push(d));
  res.on('end', () => {
    const raw = Buffer.concat(chunks).toString();
    console.log('status:', res.statusCode);
    console.log('body:', raw.slice(0, 1000));
  });
});

req.on('error', e => console.log('err:', e.message));
req.setTimeout(600000, () => { req.destroy(); console.log('timeout'); });
req.write(body);
req.end();
