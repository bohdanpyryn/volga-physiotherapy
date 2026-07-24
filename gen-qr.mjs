import QRCode from 'qrcode';
import { writeFileSync } from 'fs';
const url = 'https://volgafizioterapi.com/pricelist';
const opts = { errorCorrectionLevel: 'M', margin: 2, color: { dark: '#2C2420', light: '#FFFFFF' } };
await QRCode.toFile('pricelist-qr.png', url, { ...opts, width: 1200, type: 'png' });
const svg = await QRCode.toString(url, { ...opts, type: 'svg', width: 512 });
writeFileSync('pricelist-qr.svg', svg);
console.log('QR generated for', url);
