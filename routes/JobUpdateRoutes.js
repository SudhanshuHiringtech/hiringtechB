const express = require('express');
const router = express.Router();
const { JobPost } = require('../model/JobPostSchema');

// Update Job 
router.post('/job-update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedJobPost = await JobPost.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    console.log("DSD", req.body, "d", id)
    if (!updatedJobPost) {
      return res.status(404).send({ message: 'Job post not found' });
    }
    
    res.send(updatedJobPost);
  } catch (error) {
    res.status(400).send(error);
  }
});









// Create a Job Post
router.post('/jobstatus/:id', async (req, res) => {
    const { id } = req.params;
    const { jobStatus } = req.body;
    console.log(id)
    console.log(jobStatus)
  
    if (!jobStatus) {
      return res.status(400).json({ error: 'Job status is required' });
    }
  
    try {
      const jobPost = await JobPost.findById(id);
      
      if (!jobPost) {
        return res.status(404).json({ error: 'Job post not found' });
      }
  
      jobPost.jobStatus = jobStatus;
      await jobPost.save();
  
      res.json(jobPost);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while updating the job status' });
    }
  });


// jobSearch Routes
router.get('/search', async (req, res) => {
  const { query, status } = req.query;
  if (!query || !status) {
    return res.json([]);
  }
  console.log(req.query)
  try {
    const results = await JobPost.find({ 
      jobTitle: { $regex: query, $options: 'i' },
      jobStatus: status
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
