const express = require('express');
const router = express.Router();
const { JobPost, Application } = require('../model/JobPostSchema');

// Apply to a Job Post
router.post('/apply-job', async (req, res) => {
  try {
    const application = new Application(req.body);
    await application.save();
    await JobPost.findByIdAndUpdate(application.jobPost, { $push: { applications: application._id } });
    res.status(201).send(application);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get Applications for a Job Post
router.get('/job-posts/:id/applications', async (req, res) => {
  try {
    const jobPost = await JobPost.findById(req.params.id).populate('applications');
    if (!jobPost) {
      return res.status(404).send();
    }
    res.status(200).send(jobPost.applications);
  } catch (error) {
    res.status(500).send(error);
  }
});


const Getalljobs = async (req, res) => {
  try {
    const users = await JobPost.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


router.get('/getalljobs', Getalljobs);


// GET API to fetch jobs a candidate has applied to
router.get('/appliedjobs/:candidateId', async (req, res) => {
  try {
    const candidateId = req.params.candidateId;

    // Find jobs where the candidate has applied
    const jobs = await JobPost.find({ applications: candidateId });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
