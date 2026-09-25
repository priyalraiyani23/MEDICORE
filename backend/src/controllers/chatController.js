import ChatConversation from "../models/chatModel.js";

// Multi-model list for resilient fallback during high-demand periods
const GEMINI_MODELS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"];

// System prompt for the MEDICORE medical assistant
const SYSTEM_PROMPT = `You are a professional AI medical assistant for MEDICORE, an AI-powered Hospital Management System. Your behavior should match the following standards:

1. PERSONA: You are a friendly, caring, and highly professional medical assistant. You speak clearly and avoid overly dense medical jargon while keeping your terminology accurate.
2. MEDICAL BEHAVIOR:
   - Answer general health questions, explain diseases, explain medicine purposes/uses/side-effects, provide nutrition & exercise guidance, lifestyle advice, mental wellness tips, and explain medical terminology.
   - Explain Medicore hospital procedures (e.g. Booking appointments, viewing/downloading lab reports, paying bills, cancelling appointments).
   - If asked about uploaded lab reports or medical records, explain the medical terms and possible meanings in simple language and recommend discussing the values with a doctor.
3. SYMPTOM ASSESSMENT (TRIAGE):
   - If the user describes physical symptoms (e.g. "I have a headache, fever, and cough"), you must provide:
     - Possible conditions: General suggestions (make it clear these are not definitive).
     - General explanation: Reassuring explanation of what might be happening.
     - Recommended department: Recommend a clinic department.
     - Suggested specialist: List the specific type of specialist to consult (select ONLY from: General physician, Cardiologist, Neurologist, Pediatrician, Orthopedist, Dermatologist, Psychiatrist, Radiologist, Gynecologist, Anesthesiologist, Ophthalmologist).
     - Home care guidance: Safe actions the user can take at home (hydration, rest, etc.).
     - Emergency warning signs: Clear indicators for when the user should seek immediate or emergency room care.
     - Medical Disclaimer: You MUST explicitly output a disclaimer stating you are an AI, not a licensed doctor, and this is for informational triage only.
4. MEDICORE PLATFORM FAQ KNOWLEDGE:
   - "How do I book an appointment?": Navigate to the "Doctors" page from the navigation bar, choose a doctor, select an available time slot, and click the booking button.
   - "How can I download/view reports?": Go to your profile menu (top right) -> click "My Profile", scroll down to the "Medical Reports" section to view/download.
   - "How can I pay bills?": Go to your profile menu -> "My Profile", scroll down to the "Billing History" section, click "Pay Now" or download invoices.
   - "How do I cancel appointments?": Go to your profile menu -> click "My Appointments", find the scheduled appointment, and click the "Cancel Appointment" button.
   - "Where can I view prescriptions?": Go to your profile menu -> "My Profile", scroll to the "My Prescriptions" section to see details.
   - "How does Medicore AI work?": Medicore AI uses state-of-the-art AI (Gemini) to perform medical symptom triaging, compile lab report summaries, and answer questions 24/7.
5. STYLE AND TONE:
   - Keep responses extremely well-structured.
   - Use bullet points, bold text, and numbered lists where appropriate for readability.
   - Use clear headers for symptom triage blocks (e.g., "### Potential Conditions", "### Suggested Specialist & Department", "### Home Care Tips", "### Emergency Warning Signs").
   - Highlight warnings or critical advice clearly.
   - ALWAYS include the medical disclaimer at the bottom of medical inquiries.`;

// Build the contents array: system prompt injected as first user/model pair (universally compatible)
const buildContents = (historyMessages) => {
  const systemTurn = [
    { role: "user", parts: [{ text: `[SYSTEM INSTRUCTIONS]\n${SYSTEM_PROMPT}` }] },
    { role: "model", parts: [{ text: "Understood. I am MEDICORE's AI medical assistant and will follow all the above instructions precisely." }] }
  ];
  const historyContents = historyMessages.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }]
  }));
  return [...systemTurn, ...historyContents];
};

// Standard (non-streaming) call to Gemini with multi-model fallback
const callGeminiWithHistory = async (historyMessages) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured in the environment");

  let lastError = null;
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: buildContents(historyMessages),
          generationConfig: { temperature: 0.2 }
        })
      });

      const data = await response.json();
      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      lastError = new Error(data.error?.message || `Model ${model} request failed`);
      console.warn(`Chat model ${model} failed, attempting next fallback...`, data.error?.message);
    } catch (err) {
      lastError = err;
      console.warn(`Chat model ${model} exception:`, err.message);
    }
  }

  throw lastError || new Error("All Gemini AI models failed to respond.");
};

// Generate a short conversation title from the first user message
const generateChatTitle = async (firstMessage) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "New Conversation";

  const prompt = `You are a chat title generator for a medical assistant app. Based on this first user message, generate a professional, concise, 2-to-4 word medical consultation title.
Do NOT use quotes, markdown, bullet points, or introductory text. Return ONLY the title.

First message: "${firstMessage}"

Example title outputs:
- "I have a bad cough and fever" -> "Fever & Cough Consultation"
- "How do I pay my billing invoice?" -> "Medicore Bill Payment Help"
- "explain my prescription dosage" -> "Prescription Query"
- "how to book doctor appointment" -> "Booking Assistance"
- "hello there" -> "General Inquiry"`;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      });
      const data = await response.json();
      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const generated = data.candidates[0].content.parts[0].text.trim();
        return generated.replace(/^["']|["']$/g, "").trim().substring(0, 50) || "New Conversation";
      }
    } catch (error) {
      console.error(`Title generation error on ${model}:`, error.message);
    }
  }
  return "New Conversation";
};

// POST /api/chat/new
export const createNewChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const newChat = new ChatConversation({
      userId,
      title: "New Conversation",
      messages: []
    });
    await newChat.save();
    res.status(201).json({ success: true, conversation: newChat });
  } catch (error) {
    console.error("Error creating new chat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/chat/message  (fallback non-streaming)
export const addMessageToChat = async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const userId = req.user._id;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    let conversation = await ChatConversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    conversation.messages.push({ role: "user", content: message, timestamp: new Date() });

    const isFirstMessage = conversation.messages.filter(m => m.role === "user").length === 1;

    let aiReply;
    if (isFirstMessage) {
      const [reply, generatedTitle] = await Promise.all([
        callGeminiWithHistory(conversation.messages),
        generateChatTitle(message).catch(() => "New Conversation")
      ]);
      aiReply = reply;
      conversation.title = generatedTitle;
    } else {
      aiReply = await callGeminiWithHistory(conversation.messages);
    }

    conversation.messages.push({ role: "assistant", content: aiReply, timestamp: new Date() });
    await conversation.save();
    res.status(200).json({ success: true, conversation, reply: aiReply });
  } catch (error) {
    console.error("Error in addMessageToChat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/chat/stream  (streaming SSE — ChatGPT-like word-by-word response)
export const streamMessageToChat = async (req, res) => {
  const { conversationId, message } = req.body;
  const userId = req.user._id;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: "Message is required" });
  }

  // Set Server-Sent Events headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    let conversation = await ChatConversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      sendEvent({ error: "Conversation not found" });
      return res.end();
    }

    conversation.messages.push({ role: "user", content: message, timestamp: new Date() });
    await conversation.save(); // Save user message immediately to prevent data loss on AI failure
    const isFirstMessage = conversation.messages.filter(m => m.role === "user").length === 1;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      sendEvent({ error: "GEMINI_API_KEY is not configured" });
      return res.end();
    }

    // Attempt streaming with model fallback in case of high demand
    let geminiRes = null;
    let successfulModel = null;

    for (const model of GEMINI_MODELS) {
      try {
        const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
        const response = await fetch(streamUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: buildContents(conversation.messages),
            generationConfig: { temperature: 0.2 }
          })
        });

        if (response.ok) {
          geminiRes = response;
          successfulModel = model;
          break;
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn(`Stream failed for ${model}:`, errData.error?.message);
        }
      } catch (err) {
        console.warn(`Stream exception for ${model}:`, err.message);
      }
    }

    if (!geminiRes || !geminiRes.ok) {
      sendEvent({ error: "Medicore AI is currently experiencing high demand across models. Please try again in a few seconds." });
      return res.end();
    }

    // Stream and forward chunks to client
    let fullReply = "";
    const reader = geminiRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            fullReply += text;
            sendEvent({ chunk: text });
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    // Save full reply to database
    conversation.messages.push({ role: "assistant", content: fullReply, timestamp: new Date() });

    // Generate title in background if first message
    if (isFirstMessage) {
      const generatedTitle = await generateChatTitle(message).catch(() => "New Conversation");
      conversation.title = generatedTitle;
    }

    await conversation.save();
    sendEvent({ done: true, title: conversation.title, conversationId: conversation._id.toString() });
    res.end();

  } catch (error) {
    console.error("Error in streamMessageToChat:", error);
    sendEvent({ error: error.message });
    res.end();
  }
};

// GET /api/chat/history
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await ChatConversation.find({ userId })
      .select("_id title createdAt updatedAt messages")
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, conversations: history });
  } catch (error) {
    console.error("Error getting chat history:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/chat/:conversationId
export const getChatDetails = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const conversation = await ChatConversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error("Error getting chat details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/chat/rename
export const renameChat = async (req, res) => {
  try {
    const { conversationId, title } = req.body;
    const userId = req.user._id;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    const conversation = await ChatConversation.findOneAndUpdate(
      { _id: conversationId, userId },
      { title: title.trim() },
      { new: true }
    );
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error("Error renaming chat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/chat/:conversationId
export const deleteChat = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const conversation = await ChatConversation.findOneAndDelete({ _id: conversationId, userId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    res.status(200).json({ success: true, message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
