const express = require('express');
const router = express.Router();
const Message = require('../model/MessageSchema');

// Fetch chat history between two users
router.get('/history/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    }).sort({ createdAt: 1 }); // Sort messages by creation time
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

module.exports = router;
