const mongoose = require('mongoose');



// Define the Job Post Schema

const questionSchema = new mongoose.Schema({
  _id:{type: String,},
  questionId: { type: String, required: true},
  question: { type: String},
  answer: { type: String},
  answerText: {type: String},
});


const jobPostSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, required: true },
  jobDescription: { type: String, required: true },
  company: { type: String, required: true },
  jobType: { type: String },
  jobStatus: { type: String, required: true },
  workMode: { type: String},
  location: { type: String, required: true },
  numberOfOpenings: { type: Number, required: true },
  postedDate: { type: Date, default: Date.now },
  closedDeadline: { type: Date, required: true },
  skillsRequired: [{ type: String }],
  salaryYearlyOrMonthly: { type: String, required: true },
  incentivesAndPerks: [{ type: String }],
  benefits: [{ type: String }],
  minPay:{type: String},
  maxPay: {type: String},
  workingHours : [{type : String}],
  experienceRequired: { type: String },
  applications: [{ type: mongoose.Schema.Types.ObjectId,   unique: true, ref: 'Application' }],
  questions: [questionSchema] // Add the questions array
});

/// Define the Candidate Application Schema
const candidateApplicationSchema = new mongoose.Schema({
  jobPost: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPost', required: true },
  candidateName: { type: String, required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, required: true },
  candidateEmail: { type: String, required: true },
  candidateProfileStatus: { type: String, required: true },
  resume: { type: String, required: true }, // URL or path to the resume file
  coverLetter: { type: String },
  appliedDate: { type: Date, default: Date.now },
  questions: [questionSchema] // Candidate's answers to the job post questions
});

const invitedPeopleSchema = new mongoose.Schema({
  ownId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invitedPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invitedPersonName: { type: String, required: true },
  invitedPersonEmail: { type: String, required: true, unique: true },
  invitedPersonProfileStatus: { type: String, required: true },
});
// Create Models
const JobPost = mongoose.model('JobPost', jobPostSchema);
const Application = mongoose.model('Application', candidateApplicationSchema);

const InvitedPeople = mongoose.model('InvitedPeople', invitedPeopleSchema);
// Export Models
module.exports = {
  JobPost,
  Application,
  InvitedPeople
};
