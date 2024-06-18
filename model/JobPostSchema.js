const mongoose = require('mongoose');

// Define the Job Post Schema
const jobPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  jobStatus: { type: String, required: true},
  workMode: { type: String, required: true},
  location: { type: String, required: true },
  numberOfOpening : { type: String, required:true},
  salary: { type: Number, required: true },
  postedDate: { type: Date, default: Date.now },
  applicationDeadline: { type: Date, required: true },
  skillsRequired: [String],
  minExperienceRequired: Number,
  maxExperienceRequired: Number,
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }]
});

// Define the Candidate Application Schema
const candidateApplicationSchema = new mongoose.Schema({
  jobPost: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPost', required: true },
  candidateName: { type: String, required: true },
  candidateEmail: { type: String, required: true },
  resume: { type: String, required: true }, // URL or path to the resume file
  coverLetter: { type: String },
  appliedDate: { type: Date, default: Date.now }
});

// Create Models
const JobPost = mongoose.model('JobPost', jobPostSchema);
const Application = mongoose.model('Application', candidateApplicationSchema);

// Export Models
module.exports = {
  JobPost,
  Application
};
