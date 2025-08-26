const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const userRoutes = require('./routes/userRoutes');
const todoRoutes = require('./routes/todoRoutes');
const chatRoutes = require('./routes/chatRoutes');

dotenv.config();
connectDB();

// Verify Gemini API key
if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is not set');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/chats', chatRoutes);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini chat endpoints
app.post('/api/ai-chat', async (req, res) => {
  // ...existing AI chat code...
});

app.post('/api/ai-chat/stream', async (req, res) => {
  // ...existing AI chat stream code...
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ...existing error handling and graceful shutdown code...
