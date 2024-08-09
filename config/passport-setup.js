// const passport = require('passport'); 
// const GoogleStrategy = require('passport-google-oauth2').Strategy; 
// require('dotenv').config();

// passport.serializeUser((user , done) => { 
// 	done(null , user); 
// }) 
// passport.deserializeUser(function(user, done) { 
// 	done(null, user); 
// }); 

// console.log("google", process.env.GOOGLE_CLIENT_ID);
// passport.use(new GoogleStrategy({ 
// 	clientID:process.env.GOOGLE_CLIENT_ID, // Your Credentials here. 
// 	clientSecret:process.env.GOOGLE_CLIENT_SECRET, // Your Credentials here. 
// 	callbackURL:"http://localhost:5000/auth/google/callback", 
// 	passReqToCallback:true
// }, 
// function(request, accessToken, refreshToken, profile, done) { 
// 	return done(null, profile); 
// } 
// ));


const passport = require('passport'); 
const GoogleStrategy = require('passport-google-oauth2').Strategy; 
require('dotenv').config();
const User = require('../model/User'); // Make sure to require your user model

passport.serializeUser((user, done) => { 
    done(null, user.id); // Serialize user by ID
}); 

passport.deserializeUser((id, done) => { 
    User.findById(id, (err, user) => {
        done(err, user); // Deserialize user by finding them in the database
    });
}); 

console.log("google", process.env.GOOGLE_CLIENT_ID);
passport.use(new GoogleStrategy({ 
    clientID: process.env.GOOGLE_CLIENT_ID, 
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
   // callbackURL: "http://localhost:5000/auth/google/callback", 
   callbackURL: process.env.NODE_ENV === 'production' 
   ? "https://hiringtechb-1.onrender.com/auth/google/callback" 
   : "http://localhost:5000/auth/google/callback",
    passReqToCallback: true
}, 
async function(request, accessToken, refreshToken, profile, done) { 
    // Log the profile to check the structure
    console.log("profile", profile);

    try {
        // Check if the user already exists in the database
       // let user = await User.findOne({ googleId: profile.id });
       let user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
                user.email = profile.emails[0].value;
              console.log(user.email, " Helloe", profile.emails[0].value)
               return done(null, user);
            }
        else {
            // If user doesn't exist, create a new user
            user = new User({
                googleId: profile.id,
                email: profile.emails[0].value, // Access email from profile
                name: profile.displayName,
                imageUrl: profile.photos[0].value
            });
            await user.save();
            return done(null, user);
        }
    }
    } catch (error) {
        return done(error, null);
    }
}));
