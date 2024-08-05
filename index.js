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
const notificationRoutes =  require('./routes/notificationRoutes');
const JobUpdateRoutes = require('./routes/JobUpdateRoutes');
const chatRoutes = require('./routes/chatRoutes');
const InivitedPeopleRoutes =  require('./routes/InvitedPeopleRoutes')

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);
const io = socketIo(server);
const Message = require('./model/MessageSchema');
const cors = require('cors');
const MemoryStore = require('memorystore')(session)
app.use(cors());

connectDB();

// Middleware to parse JSON

// // Set up view engine

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
app.use('/chat', chatRoutes);
app.use(InivitedPeopleRoutes);

// // Middleware to inject io instance into requests
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });

app.use('/notifications', notificationRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
    console.log(`Received message from ${senderId} to ${receiverId}: ${message}`);
    try {
      const newMessage = new Message({ sender: senderId, receiver: receiverId, message });
      await newMessage.save();
      console.log('Message saved to database:', newMessage);
      io.to(receiverId).emit('receiveMessage', newMessage);
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





const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// const express = require('express');
// const mongoose = require('mongoose');
// const passport = require('passport');
// const session = require('express-session');
// const bodyParser = require('body-parser');
// const http = require('http');
// const socketIo = require('socket.io');
// const path = require('path');
// const cors = require('cors');
// const MemoryStore = require('memorystore')(session);
// require('dotenv').config();
// require('./config/passport-setup');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// const connectDB = require('./db');
// const Message = require('./model/MessageSchema');

// const authRoutes = require('./routes/authRoutes');
// const profileRoutes = require('./routes/profileRoutes');
// const jobPostRoutes = require('./routes/jobPostRoutes');
// const jobApplyRoutes = require('./routes/jobApplyRoutes');
// const filterjobsRoutes = require('./routes/filterjobsRoutes');
// const resetPassword = require('./routes/resetPassword');
// const notificationRoutes = require('./routes/notificationRoutes');
// const jobUpdateRoutes = require('./routes/JobUpdateRoutes');
// const googleOuthRoutes = require('./routes/googleOuthRoutes');
// const chatRoutes = require('./routes/chatRoutes');

// connectDB();

// app.use(cors());
// app.use(express.json());
// app.use(bodyParser.json());

// app.use(session({
//   secret: process.env.SESSION_SECRET || 'sector123',
//   resave: false,
//   store: new MemoryStore({ checkPeriod: 86400000 }),
//   saveUninitialized: true,
//   cookie: { secure: process.env.NODE_ENV === 'production' }
// }));

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// app.use('/auth', authRoutes);
// app.use('/profile', profileRoutes);
// app.use('/jobPost', jobPostRoutes);
// app.use('/jobApply', jobApplyRoutes);
// app.use('/filterjobs', filterjobsRoutes);
// app.use('/resetPassword', resetPassword);
// app.use('/jobUpdate', jobUpdateRoutes);
// app.use('/googleAuth', googleOuthRoutes);
// app.use('/notifications', notificationRoutes);
// app.use('/chat', chatRoutes);

// io.on('connection', (socket) => {
//   console.log('A user connected');

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });

//   socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
//     console.log(`Received message from ${senderId} to ${receiverId}: ${message}`);
//     try {
//       const newMessage = new Message({ sender: senderId, receiver: receiverId, message });
//       await newMessage.save();
//       console.log('Message saved to database:', newMessage);
//       io.to(receiverId).emit('receiveMessage', newMessage);
//     } catch (error) {
//       console.error('Error saving message to database:', error);
//     }
//   });

//   socket.on('joinRoom', async (roomId, { senderId, receiverId }) => {
//     socket.join(roomId);
//     console.log(`User joined room: ${roomId}`);

//     // Fetch chat history when the user joins the room
//     try {
//       const messages = await Message.find({
//         $or: [
//           { sender: senderId, receiver: receiverId },
//           { sender: receiverId, receiver: senderId }
//         ]
//       }).sort({ createdAt: 1 }); // Sort messages by creation time
//       socket.emit('loadChatHistory', messages);
//     } catch (error) {
//       console.error('Error fetching chat history:', error);
//     }
//   });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
