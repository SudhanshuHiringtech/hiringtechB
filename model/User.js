// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const EducationSchema = new mongoose.Schema({
  institution: {
      type: String,
      required: true
  },
  degree: {
      type: String,
      required: true
  },
  fieldOfStudy: {
      type: String,
      required: true
  },
  startDate: {
      type: Date,
      required: true
  },
  endDate: {
      type: Date
  },
  grade: {
      type: String
  },
  Percentage: {
    type: String
}
});


// Skill Schema
const SkillSchema = new mongoose.Schema({
  name: {
      type: String,
  },
  proficiency: {
      type: String, // e.g., Beginner, Intermediate, Expert
      required: true
  }
});

// Language Schema
const LanguageSchema = new mongoose.Schema({
  name: {
      type: String,
  },
  proficiency: {
      type: String, // e.g., Basic, Conversational, Fluent, Native
      required: true
  }
});


 // Experience Schema
const ExperienceSchema = new mongoose.Schema({
  designation: { type: String},
  workMode: { type: String},
  company: { type: String, required: true },
  location: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String }
});



const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  name: {
    type: String,
  },
  profileImage: {
    // data: Buffer,
    // contentType: String,
    path: String // Add this field to store the path of the uploaded image
  },
  googleId:{
    type : String
  },
  thumbnail:{ 
    type : String
  },
  companyName: {
    type: String,
  },
  designation: {
    type: String,
  },
  mobileNumber: {
    type: String,
   // required: true,
  },
  userdesignation :{
    type : String
  },
  email: {
    type: String,
   // required: true,
    unique: true
  },
  password: {
    type: String,
   // required: true
  },
  otp: {
    type: Number,
    default : null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  DOB : {
    type : String
  },
  gender : {
    type : String
  },
  currentLocation :{
    type : String
  },
  totalExperience :{
    type : String,
   // required : true
  },
  education: [EducationSchema],
  skills: [SkillSchema],
  languages: [LanguageSchema],
  experience: [ExperienceSchema],
  resume: {
    type: String,
},
  certifications: {
     type: String,
  },
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
