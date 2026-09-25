// AI Controller using Gemini REST API
import { callGeminiAPI } from "../util/gemini.js";

// POST /api/ai/symptom-checker
export const symptomChecker = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) return res.json({ success: false, message: "Symptoms are required" });

    const prompt = `You are a professional AI medical assistant. A patient reports: "${symptoms}".

Respond in EXACTLY this format — no deviations, no extra headings, no bullet points:

Write 2-3 plain sentences explaining the likely cause. In those sentences, whenever you mention the medical specialist the patient should see, wrap ONLY that specialist's title in double asterisks like **General physician** or **Cardiologist**. Choose the specialist ONLY from this list: General physician, Cardiologist, Neurologist, Pediatrician, Orthopedist, Dermatologist, Psychiatrist, Radiologist, Gynecologist, Anesthesiologist, Ophthalmologist.

Then on a new line, add the disclaimer wrapped in single asterisks exactly like this:
*Disclaimer: I am an AI, not a doctor.*

Example output:
A cold is typically caused by a viral infection of the upper respiratory tract, most commonly rhinoviruses. You should consult a **General physician** for a proper evaluation and symptom management.

*Disclaimer: I am an AI, not a doctor.*

Do NOT use any other markdown, bullet points, or section headers. Follow this format strictly.`;
    const aiResponse = await callGeminiAPI(prompt);

    res.json({ success: true, analysis: aiResponse });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/ai/report-summary
export const reportSummary = async (req, res) => {
  try {
    const { reportText } = req.body;
    if (!reportText) return res.json({ success: false, message: "Report text is required" });

    const prompt = `Summarize the following medical lab report into simple, easy-to-understand language for a patient without a medical background. Report: ${reportText}`;
    const aiResponse = await callGeminiAPI(prompt);

    res.json({ success: true, summary: aiResponse });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/ai/chat
export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ success: false, message: "Message is required" });

    const prompt = `You are a helpful healthcare assistant for the MEDICORE hospital platform. Answer this user query: "${message}".

Respond in EXACTLY this format — no deviations:

Write 1-3 plain sentences giving a concise, helpful answer. If you recommend seeing a medical specialist, wrap ONLY that specialist's title in double asterisks like **General physician**.

Then on a new line, add the disclaimer wrapped in single asterisks exactly like this:
*Disclaimer: I am an AI, not a doctor.*

Do NOT use bullet points, section headers, or any other markdown. Be direct and concise.`;
    const aiResponse = await callGeminiAPI(prompt);

    res.json({ success: true, reply: aiResponse });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
