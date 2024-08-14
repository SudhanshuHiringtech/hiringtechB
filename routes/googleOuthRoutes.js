
// // routes/auth.js
// const router = require('express').Router();
// const passport = require('passport');
// const { loadAuth, successGoogleLogin, failureGoogleLogin } = require('../controller/userController');

// // Load auth page
// router.get('/', loadAuth);

// // Auth with Google
// router.get('/auth/google', passport.authenticate('google', {
//   scope: ['profile', 'email'],
// }));

// // Google auth callback
// router.get('/auth/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/auth/failure' }), 
//   successGoogleLogin
// );

// // Auth failure
// router.get('/failure', failureGoogleLogin);

// // Logout
// // router.get('/logout', (req, res) => {
// //   req.logout();
// //   res.redirect('/');
// // });

// module.exports = router;


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
    passport.authenticate('google', { failureRedirect: '/failure' }), 
    successGoogleLogin
);

// Auth failure
router.get('/failure', failureGoogleLogin);

module.exports = router;
