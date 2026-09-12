const fs = require('fs');
const html = fs.readFileSync('WEBSITE/mailala/index.html', 'utf8');
const css = fs.readFileSync('WEBSITE/mailala/style.css', 'utf8');
const js = fs.readFileSync('WEBSITE/mailala/main.js', 'utf8');

console.log('Has booking form:', html.includes('bookingForm'));
console.log('Has date inputs:', html.includes('type="date"'));
console.log('Has room select:', html.includes('id="room"'));
console.log('Has guests select:', html.includes('id="guests"'));
console.log('Has WhatsApp submit:', html.includes('wa.me'));
console.log('Has validation:', js.includes('checkout <= checkin'));
console.log('Has date min:', js.includes('min'));
console.log('Has encodeURIComponent:', js.includes('encodeURIComponent'));
console.log('Has alert fallback:', js.includes('alert'));
