const express = require('express');
const mongoose = require('mongoose');

const passport = require('passport');
//const session = require('cookie-session');
require('./config/passport-setup');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const connectDB = require('./db');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path'); 
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const jobPostRoutes = require('./routes/jobPostRoutes');
const jobApplyRoutes = require('./routes/jobApplyRoutes');
const filterjobsRoutes = require('./routes/filterjobsRoutes');
const resetPassword = require('./routes/resetPassword');

const JobUpdateRoutes = require('./routes/JobUpdateRoutes');
const chatRoutes = require('./routes/chatRoutes');
const InivitedPeopleRoutes =  require('./routes/InvitedPeopleRoutes')
const Notification = require('./model/Notification');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);
const io = socketIo(server);
const Message = require('./model/MessageSchema');
const cors = require('cors');
const MemoryStore = require('memorystore')(session)
app.use(cors());

connectDB();

app.use(session({
  secret: process.env.SESSION_SECRET || 'sector123',
  resave: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  saveUninitialized: true,
  cookie: { secure: true } // Set to true if using https
}));



app.set("view engine", "ejs");

// Set the directory where the view files are located
app.set('views', path.join(__dirname, 'views'));

app.use(express.json({ extended: false }));
app.use(bodyParser.json());

//app.use('/auth', require('./routes/authRoutes'));
app.use('/', require('./routes/googleOuthRoutes'));


app.use(authRoutes);
app.use(profileRoutes);
app.use(jobPostRoutes);
app.use(jobApplyRoutes);
app.use(filterjobsRoutes);
app.use(resetPassword);
app.use(JobUpdateRoutes);
app.use(chatRoutes);
app.use(InivitedPeopleRoutes);

const getUnreadNotifications = async (userId) => {
  try {
    const notifications = await Notification.find({ userId, isRead: false }).exec();
    return notifications;
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    throw error;
  }
};
const getNotificationsByUserId = async (userId) => {
  try {
    const notifications = await Notification.find({ userId }).exec();
    console.log(notifications)
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};


//app.use('/notifications', notificationRoutes);


// Create namespaces for chat and notifications
const chatNamespace = io.of('/chat');
const connectedUsers = {};
const notificationNamespace = io.of('/notifications');
// Socket.io connection handling
chatNamespace.on('connection', (socket) => {
  console.log('A user chats connected');

  socket.on('disconnect', () => {
    console.log('User chats disconnected');
  });

  socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
    console.log(`Received message from ${senderId} to ${receiverId}: ${message}`);
    try {
      const newMessage = new Message({ sender: senderId, receiver: receiverId, message});
      await newMessage.save();
      console.log('Message saved to database:', newMessage);
      console.log('Message saved to database:', newMessage);
      chatNamespace.to(receiverId).emit('receiveMessage', newMessage);
      chatNamespace.to(senderId).emit('receiveMessage', newMessage); // Emit to sender as well
     
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  });

  socket.on('joinRoom', async (roomId, { senderId, receiverId }) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);

    // Fetch chat history when the user joins the room
    try {
      const messages = await Message.find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId }
        ]
      }).sort({ createdAt: 1 }); // Sort messages by creation time
      socket.emit('loadChatHistory', messages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  });
});



// Listen for client connections
notificationNamespace.on('connection', (socket) => {
  console.log('A user connected Notification');

  // When a user connects, store their socket ID
  const userId = socket.handshake.query.userId;
  connectedUsers[userId] = socket.id;

  // Handle sending notifications to multiple users
  socket.on('sendNotification', async (data) => {
    const { userIds, message } = data; // Expecting an array of user IDs

    // Save the notification to MongoDB for each user
    userIds.forEach(async (userId) => {
      const newNotification = new Notification({ userId, message });
      await newNotification.save();

      // Find the socket ID of the recipient
      const recipientSocketId = connectedUsers[userId];
      
      if (recipientSocketId) {
        // Emit the notification only to the specific user
        notificationNamespace.to(recipientSocketId).emit('receiveNotification', newNotification);
        
      } else {
        console.log(`User ${userId} is not connected`);
      }
    });
  });

    // Handle fetching notifications
    socket.on('fetchNotifications', async () => {
      try {
        const notifications = await getNotificationsByUserId(userId);
        socket.emit('notifications', notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    });

  socket.on('disconnect', () => {
    console.log('A user notification disconnected');
    delete connectedUsers[userId]; // Remove the user from the connected list
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

