const express = require('express');
const router = express.Router();
const { JobPost, Application } = require('../model/JobPostSchema');

// Apply to a Job Post
router.post('/apply-job', async (req, res) => {
  try {
    const application = new Application(req.body);
    console.log("SD", req.body);
    await application.save();
    await JobPost.findByIdAndUpdate(application.jobPost, { $push: { applications: application._id } });
    res.status(201).send(application);
    console.log(application)
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

router.get('/jobs/internship', async (req, res) => {
  try {
    const internships = await JobPost.find({ jobType: 'Internship' });
    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/jobs/fulltime', async (req, res) => {
  try {
    const internships = await JobPost.find({ jobType: 'Full-time' });
    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/getalljobs', Getalljobs);



router.get('/appliedjobs/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;

    // Find applications by candidateId
    const applications = await Application.find({ candidateId }).populate('jobPost');

    // Extract job posts from applications
    const jobPosts = applications.map(app => app.jobPost);

    res.status(200).json(jobPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Fetch jobs based on status
router.get('/jobstatus', async (req, res) => {
  const status = req.query.status;

  // Validate the status parameter
  if (!status || (status !== 'open' && status !== 'closed')) {
    return res.status(400).json({ error: 'Invalid status parameter. Use "open" or "closed".' });
  }

  try {
    const jobs = await JobPost.find({ jobStatus: status });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Status candidate who applied on job 
router.post('/candidate-job-status/:id', async (req, res) => {
    const { id } = req.params;
    const { candidateProfileStatus } = req.body;
    // console.log(id)
    // console.log(candidateProfileStatus)
  
    if (!candidateProfileStatus) {
      return res.status(400).json({ error: 'Candidate Job Status is required' });
    }
  
    try {
      const application = await Application.findById(id);
      
      if (!application) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
  
      application.candidateProfileStatus = candidateProfileStatus;
      await application.save();
  
      res.json(application);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while updating the job status' });
    }
  });




module.exports = router;
