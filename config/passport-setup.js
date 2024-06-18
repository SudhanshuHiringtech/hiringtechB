const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../model/User');
require('dotenv').config(); // Ensure this is at the top

// Log the environment variables to debug
console.log("GOOGLE_CLIENT_ID: ", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET: ", process.env.GOOGLE_CLIENT_SECRET);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Ensure these are correct
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Ensure these are correct
    callbackURL: '/auth/google/redirect'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
            return done(null, existingUser);
        }

        const newUser = await new User({
            googleId: profile.id,
            name: profile.displayName,
            thumbnail: profile.photos[0].value,
            email: profile.emails[0].value // Assuming emails is not empty and contains the user's email
        }).save();

        done(null, newUser);
    } catch (error) {
        done(error, false);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});
