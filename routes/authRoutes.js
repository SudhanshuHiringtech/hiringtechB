const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../model/User');
const nodemailer = require('nodemailer');
const passport = require('passport');

const router = express.Router();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`
  };

  return transporter.sendMail(mailOptions);
};

// Register Recruiter
const registerRecruiter = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, companyName, designation, mobileNumber, email, password, userdesignation } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const otp = generateOTP();

    user = new User({
      name,
      email,
      password,
      companyName,
      designation,
      mobileNumber,
      userdesignation,
      otp,
    });

    await user.save();
    console.log(otp);
    await sendOTPEmail(email, otp);

    res.status(200).json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.log("You have error", err.message);
    res.status(500).send('Server error');
  }
};

// Register Candidate
const registerCandidate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, userdesignation, mobileNumber } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const otp = generateOTP();

    user = new User({
      name,
      email,
      password,
      userdesignation,
      mobileNumber,
      otp,
    });

    await user.save();
    console.log(otp);
    await sendOTPEmail(email, otp);

    res.status(200).json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.log("You have error", err.message);
    res.status(500).send('Server error');
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otp = undefined; // Clear the OTP
    await user.save();

    res.status(200).json({ msg: 'Email verified successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login User
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Please verify your email before logging in' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('JWT sign error:', err.message);
          return res.status(500).json({ msg: 'Server error' });
        }
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const Logout = (req, res) => {
  // To logout, simply expire the token on the client-side.
  // Alternatively, maintain a blacklist of tokens server-side to invalidate them.
  res.json({ message: 'Logged out successfully' });
};


const GetallUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

router.get('/getallusers', GetallUsers);

// Routes
router.post('/register-recruiter', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], registerRecruiter);

router.post('/register-candidate', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], registerCandidate);

router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], loginUser);

router.post('/verify-otp', [
  check('email', 'Please include a valid email').isEmail(),
  check('otp', 'OTP is required').exists()
], verifyOTP);

router.get('/logout', Logout);

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback route for Google to redirect to
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  // Generate a JWT token
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  // Send token as a response or store it in a cookie
  res.cookie('jwt', token, { httpOnly: true, secure: true });
  res.redirect('/profile/');
});

module.exports = router;
