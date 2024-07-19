// const express = require('express');
// const router = express();
// const passport = require('passport'); 
// require('../config/passport-setup');

// router.use(passport.initialize()); 
// router.use(passport.session());

// const userController = require('../controller/userController');

// router.get('/', userController.loadAuth);

// // Auth 
// router.get('/auth/google' , passport.authenticate('google', { scope: 
// 	[ 'email', 'profile' ] 
// })); 

// // Auth Callback 
// router.get( '/auth/google/callback', 
// 	passport.authenticate( 'google', { 
// 		successRedirect: '/success', 
// 		failureRedirect: '/failure'
// }));

// // Success 
// router.get('/success' , userController.successGoogleLogin); 

// // failure 
// router.get('/failure' , userController.failureGoogleLogin);

// module.exports = router;\\\


// routes/auth.js
const router = require('express').Router();
const passport = require('passport');
const { loadAuth, successGoogleLogin, failureGoogleLogin } = require('../controller/userController');

// Load auth page
router.get('/', loadAuth);

// Auth with Google
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// Google auth callback
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/failure' }), 
  successGoogleLogin
);

// Auth failure
router.get('/failure', failureGoogleLogin);

// Logout
// router.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect('/');
// });

module.exports = router;
