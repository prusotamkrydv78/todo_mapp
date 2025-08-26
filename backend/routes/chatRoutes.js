import express from 'express';
import protect from "../middleware/authMiddleware.js";
import Chat from "../models/chatModel.js";

const router = express.Router();
// Get chat messages between two users
router.get("/:receiverId", protect, async (req, res) => {
  try {
    const messages = await Chat
      .find({
        $or: [
          { sender: req.user.id, receiver: req.params.receiverId },
          { sender: req.params.receiverId, receiver: req.user.id },
        ],
      })
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post("/", protect, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const chat = await Chat.create({
      sender: req.user.id,
      receiver: receiverId,
      message,
    });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
