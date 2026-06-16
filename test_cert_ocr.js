const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

async function testOCR(filePath, internshipName, memberName) {
  console.log(`\nTesting: ${path.basename(filePath)}`);
  
  const worker = await Tesseract.createWorker('eng', 1, {
    workerPath: path.join(process.cwd(), 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js'),
    corePath: path.join(process.cwd(), 'node_modules', 'tesseract.js-core', 'tesseract-core.wasm.js'),
    cachePath: path.join(process.cwd(), 'tessdata')
  });

  try {
    const { data: { text } } = await worker.recognize(filePath);
    await worker.terminate();
    
    const extractedText = text.toLowerCase();
    console.log("Extracted snippet:", extractedText.substring(0, 150).replace(/\n/g, " "));

    const firstName = memberName.toLowerCase().split(' ')[0];
    const nameMatch = extractedText.includes(firstName);
    
    const courseKeywords = internshipName.toLowerCase().split(' ').filter(w => w.length > 3);
    const courseMatch = courseKeywords.length === 0 || courseKeywords.some(kw => extractedText.includes(kw));
    
    console.log(`Name ('${firstName}'):`, nameMatch ? "Found" : "Not Found");
    console.log(`Course keywords (${courseKeywords.join(',')}) match:`, courseMatch ? "Found" : "Not Found");
    
  } catch (error) {
    console.error("OCR Error:", error);
  }
}

async function run() {
  const certDir = path.join(process.cwd(), 'demo certificate');
  await testOCR(path.join(certDir, 'GLE Certificate for Big Data & Business Management Internship .jpeg'), 'AICTE | IBM SkillsBuild Big Data & Business Management Internship | BharatCares', 'John Doe');
  await testOCR(path.join(certDir, 'GLE Certificate for Gen AI & Cloud Internship .jpeg'), 'AICTE | IBM SkillsBuild Gen AI & Cloud Computing Internship | BharatCares', 'Jane Doe');
  await testOCR(path.join(certDir, 'GLE Certificate for AI Automation & Intelligent Solutions Internship .jpeg'), 'AICTE | IBM SkillsBuild AI Automation & Intelligent Solutions Internship | BharatCares', 'Alice Smith');
}

run();
