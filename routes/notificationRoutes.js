const express = require('express');
const Notification = require('../model/Notification');
const router = express.Router();

// Add a new notification
router.post('/', async (req, res) => {
    const { userId, message } = req.body;
    const notification = new Notification({ userId, message });
    await notification.save();
    req.io.emit('new-notification', notification);
    console.log('A new notification was created:', notification);
    res.status(201).send(notification);
});

// Get notifications for a user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    console.log("Dekho notification")
    res.send(notifications);
});

// Mark a notification as read
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    res.send(notification);
});

module.exports = router;
