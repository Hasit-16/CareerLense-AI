const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

async function run() {
  const imageBuf = fs.readFileSync('Marksheet.jpeg');
  console.log("Image loaded.");

  const workerPath = path.join(process.cwd(), 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js');
  console.log("Worker Path: ", workerPath);
  
  try {
    const worker = await Tesseract.createWorker('eng', 1, {
      workerPath,
      logger: m => console.log(m)
    });
    console.log("Worker created.");
    const { data: { text } } = await worker.recognize(imageBuf);
    console.log("\n\n======== OCR RESULT ========");
    console.log(text);
    await worker.terminate();
  } catch (e) {
    console.error("Worker failed:", e);
  }
}

run();
