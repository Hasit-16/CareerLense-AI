const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hello");
    console.log("2.0 flash success");
  } catch (err) {
    console.error("2.0 flash failed:");
    console.error(err);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("1.5 flash success");
  } catch (err) {
    console.error("1.5 flash failed:");
    console.error(err);
  }
}
run();
