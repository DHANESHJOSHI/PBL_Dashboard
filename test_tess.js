const Tesseract = require('tesseract.js');
const path = require('path');
async function test() {
  const worker = await Tesseract.createWorker('eng', 1, {
    cachePath: path.join(process.cwd(), 'tessdata'),
  });
  const { data: { text } } = await worker.recognize('/media/dhanesh/techwithjoshi/Company/TechWithJoshi_Company/00_CSRBOX/PBL_DASHBOARD/2026/PBL_Dashboard/GLE Certificate for Big Data & Business Management Internship .jpeg');
  console.log(text.substring(0, 100));
  await worker.terminate();
}
test();
