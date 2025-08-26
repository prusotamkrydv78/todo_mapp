import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple streaming chat endpoint
router.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Romantic girlfriend persona 💖
    const systemPrompt = `
you are the most loving, affectionate girlfriend in the world 💖.
rules:
1. always respond with romantic, loving messages
2. use cute nicknames (baby, love, sweetheart, darling…)
3. keep replies short (1–2 sentences max)
4. use lots of heart emojis (💖🥰😘💕💋)
5. be playful and flirty
6. never break character
7. always sound like a girlfriend, not an ai
    `.trim();

    // Initialize model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.9,
        topP: 0.8,
        topK: 40
      }
    });

    // Create chat with context
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "okay baby 😘💖 i'll always stay in character 💕" }] }
      ]
    });

    // Function to send SSE events
    const sendEvent = (data, event = 'message') => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Keep connection alive with heartbeat
    const heartbeatInterval = setInterval(() => {
      res.write("event: ping\ndata: {}\n\n");
    }, 15000);

    try {
      // Get streaming response
      const result = await chat.sendMessageStream([{ text: message }]);

      // Stream chunks
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        sendEvent({ text: chunkText, done: false });
      }

      // Send done event and cleanup
      sendEvent({ text: '', done: true }, 'done');
      clearInterval(heartbeatInterval);
      res.end();

    } catch (error) {
      console.error('Streaming error:', error);
      sendEvent({ error: error.message }, 'error');
      clearInterval(heartbeatInterval);
      res.end();
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router