const fs = require('fs');
const path = require('path');
const publicDir = path.join(process.cwd(), 'public');
const src = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const dest = path.join(publicDir, 'pdf.worker.min.mjs');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('Copied pdf.worker.min.mjs to public/');
} else {
  console.warn('pdfjs-dist worker not found at', src, '- run npm install');
}
