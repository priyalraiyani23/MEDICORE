import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('Using API key:', apiKey);

const testModel = async (url) => {
  try {
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
      })
    });
    const data = await response.json();
    console.log(`URL: ${url}`);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data));
  } catch (err) {
    console.error(`Error for ${url}:`, err.message);
  }
};

const run = async () => {
  await testModel("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent");
  await testModel("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent");
};

run();
