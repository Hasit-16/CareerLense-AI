const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const res = await models.json();
    console.log(res.models.map(m => m.name).join("\n"));
  } catch (err) {
    console.error(err);
  }
}
run();
