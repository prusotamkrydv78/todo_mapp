import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AiChat from '../models/aiChatModel.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get user's chat history
router.get('/history', protect, async (req, res) => {
  try {
    const chats = await AiChat.find({ user: req.user._id })
      .select('title lastMessageAt')
      .sort({ lastMessageAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific chat
router.get('/:chatId', protect, async (req, res) => {
  try {
    const chat = await AiChat.findOne({
      _id: req.params.chatId,
      user: req.user._id
    });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new chat
router.post('/new', protect, async (req, res) => {
  try {
    const chat = await AiChat.create({
      user: req.user._id,
      title: req.body.title || 'New Chat',
      messages: [],
      context: req.body.context || 'You are a helpful AI assistant.'
    });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Stream chat response
router.post('/stream/:chatId', protect, async (req, res) => {
  const { chatId } = req.params;
  const { message } = req.body;

  try {
    // Find or create chat
    let chat = await AiChat.findOne({ _id: chatId, user: req.user._id });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

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
    `;

    // Add user message to chat
    chat.messages.push({
      content: message,
      role: 'user'
    });

    // Initialize chat with system prompt if it's the first message
    let history;
    if (chat.messages.length === 1) {
      history = [
        { role: "user", parts: systemPrompt },
        { role: "model", parts: "okay baby 😘💖 i'll always stay in character 💕" },
        { role: "user", parts: message }
      ];
    } else {
      // Prepare conversation history
      history = chat.messages.map(msg => ({
        role: msg.role,
        parts: msg.content
      }));
    }

    // Initialize chat with enhanced configuration
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.9,
        topP: 0.8,
        topK: 40
      },
    });
    const chat_session = model.startChat({ history });

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const result = await chat_session.sendMessageStream(message);
      let fullResponse = '';

      // Keep connection alive with heartbeat
      const heartbeatInterval = setInterval(() => {
        res.write("event: ping\ndata: {}\n\n");
      }, 15000);

      // Function to send SSE events
      const sendEvent = (data, event = 'message') => {
        const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        res.write(msg);
      };

      // Stream chunks
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        sendEvent({ id: Date.now(), text: chunkText, done: false });
      }

      // Done event
      sendEvent({ id: Date.now(), text: '', done: true }, 'done');

      // Clean up
      clearInterval(heartbeatInterval);

      // Save AI response to database
      chat.messages.push({
        content: fullResponse,
        role: 'assistant'
      });
      chat.lastMessageAt = new Date();
      await chat.save();

      res.end();
    } catch (error) {
      console.error('Streaming error:', error);
      sendEvent({ error: error.message }, 'error');
      res.end();
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
