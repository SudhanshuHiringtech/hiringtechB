// const express = require('express');
// const Notification = require('../model/Notification');
// const router = express.Router();

// // Add a new notification
// router.post('/', async (req, res) => {
//     const { message } = req.body; // Extract message from the request body
//     const notification = new Notification({ message }); // Create a new Notification instance without userId
//     await notification.save(); // Save the notification to the database

//     // Emit to all connected users
//     const io = req.io; // Get the Socket.io instance from the request
//     const users = io.sockets.sockets; // Get all connected sockets
//     for (let socketId in users) { // Loop through each connected socket
//         const socket = users[socketId];
//         socket.emit('new-notification', notification); // Emit the notification to the user
//     }

//     console.log('A new notification was created:', notification); // Log the creation of the notification
//     res.status(201).send(notification); // Send the created notification as the response
// });

// // Get all notifications
// router.get('/allnotification', async (req, res) => {
//     try {
//         const notifications = await Notification.find().sort({ createdAt: -1 }); // Fetch all notifications sorted by creation date
//         res.send(notifications); // Send the notifications as the response
//     } catch (error) {
//         console.error('Error fetching notifications:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });


// // Get notifications for a user
// router.get('/:userId', async (req, res) => {
//     const { userId } = req.params;
//     const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
//     console.log("Dekho notification")
//     res.send(notifications);
// });

// // Mark a notification as read
// router.put('/:id', async (req, res) => {
//     const { id } = req.params;
//     const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
//     res.send(notification);
// });

// module.exports = router;
