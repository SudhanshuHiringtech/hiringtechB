const express = require('express');
const router = express.Router();
const { JobPost } = require('../model/JobPostSchema');

// Create a Job Post
router.post('/job-post', async (req, res) => {
  try {
    const jobPost = new JobPost(req.body);
    await jobPost.save();
    res.status(201).send(jobPost);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get All Job Posts
router.get('/', async (req, res) => {
  try {
    const jobPosts = await JobPost.find();
    res.status(200).send(jobPosts);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
