import mongoose from "mongoose";

const aiMessageSchema = new mongoose.Schema({
  content: String,
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  }
}, { timestamps: true });

const aiChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [aiMessageSchema],
  context: {
    type: String,
    default: 'You are a helpful AI assistant.'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const AiChat = mongoose.model('AiChat', aiChatSchema);
export default AiChat;
