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

const server = http.createServer(app);
const io = socketIo(server);
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

// Middleware to inject io instance into requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/notifications', notificationRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});






const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
