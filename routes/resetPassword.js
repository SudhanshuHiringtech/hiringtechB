 const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../model/User');
const nodemailer = require('nodemailer');
const passport = require('passport');
const { JobPost, Application } = require('../model/JobPostSchema');
const Message = require('../model/MessageSchema');
const Notification = require('../model/Notification');


const router = express.Router();


// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };


// Send OTP
const sendOTPEmail = (email, otp) => {
  console.log("dekh bhai")
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


// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate and save OTP
        const otp = generateOTP();
        const otpExpiry = Date.now() + 600000; // OTP expires in 10 minutes
        user.otp = otp.toString();
        user.otpExpires = new Date(otpExpiry);
        await user.save();
        await sendOTPEmail(email, otp);
       
        // // Send OTP via email
        // const mailOptions = {
        //     to: user.email,
        //     from: 'your-email@gmail.com',
        //     subject: 'OTP for Password Reset',
        //     text: `Your OTP for password reset is: ${otp}`
        // };

        // await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Verify OTP and change password
router.post('/forget-password-verify-otp', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify OTP
        if (user.otp !== otp || Date.now() > user.otpExpires) {
            return res.status(400).json({ message: 'Invalid OTP or OTP expired' });
        }

        // Reset OTP fields
        user.otp = undefined;
        user.password =  newPassword
        console.log(user.password)
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
 
// Verify OTP and change password
router.post('/change-password', async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  console.log(id)
  console.log(oldPassword, "fvcf", newPassword)
  try {
      const user = await User.findById(id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      const salt = await bcrypt.genSalt(10);
      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Your old password does not match' });
      }
      user.password = newPassword
      await user.save();

      res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});


// Delete full account totally from database

router.delete('/delete-account/:userId', async (req, res) => {
  const { userId } = req.params;
  const { password } = req.body; // Assuming password is sent in the request body

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the password matches
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // Proceed with deleting the user and related data
    const userDeleted = await User.findByIdAndDelete(userId);

    // Delete related data
    const applicationsDeleted = await Application.deleteMany({ candidateId: userId });
    const messagesDeleted = await Message.deleteMany({
      $or: [{ sender: userId }, { receiver: userId }]
    });
    const notificationsDeleted = await Notification.deleteMany({ userId });

    res.status(200).json({
      message: 'User and related data deleted successfully.',
      details: {
        userDeleted,
        applicationsDeleted,
        messagesDeleted,
        notificationsDeleted,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account.', error: error.message });
  }
});

  module.exports = router;