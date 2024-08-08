const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../model/MessageSchema');
const User = require('../model/User'); // Ensure you have this

// Fetch chat history between two users
router.get('/history/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;
  console.log(senderId, "FS", receiverId)
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




// Endpoint to get only unread messages
router.get('/unread-messages/:userId', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const unreadMessages = await Message.aggregate([
      { $match: { receiver: userId, read: false } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$sender",
          latestMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: 'users', // Assuming your users collection is named 'users'
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user: 1,
          latestMessage: 1
        }
      }
    ]);

    res.json(unreadMessages);
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    res.status(500).send('Server error');
  }
});

// Get latest unique messages for a user including own messages
router.get('/unique-messagers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userObjectId },
            { receiver: userObjectId }
          ]
        }
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userObjectId] },
              '$receiver',
              '$sender'
            ]
          },
          latestMessage: { $first: '$$ROOT' },
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user: {
            _id: '$_id',
            name: '$user.name',
            email: '$user.email'
          },
          latestMessage: {
            message: '$latestMessage.message',
            timestamp: '$latestMessage.timestamp'
          }
        }
      }
    ]);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    res.status(500).json({ error: 'Failed to fetch recent messages' });
  }
});

// Endpoint to mark a message as read
router.patch('/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true } // Return the updated document
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = router;
