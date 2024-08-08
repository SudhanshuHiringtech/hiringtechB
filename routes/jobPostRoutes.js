const express = require('express');
const router = express.Router();
const { JobPost } = require('../model/JobPostSchema');

// Create a Job Post
router.post('/job-post', async (req, res) => {
  // try {
  //   const jobPost = new JobPost(req.body);
  //   await jobPost.save();
  //   res.status(201).send(jobPost);
  // } catch (error) {
  //   res.status(400).send(error);
  // }

  try {
    const jobPost = new JobPost(req.body);
    await jobPost.save();
    res.status(201).send(jobPost);
  } catch (error) {
    console.error('Error details:', error); // Log the error details

    if (error.code === 11000) {
      // Handle duplicate key error
      res.status(400).send({
        error: 'Duplicate key error',
        message: 'A record with the same key already exists.',
        details: error.keyValue // Provides more info on the key causing the conflict
      });
    } else {
      // Handle other types of errors
      res.status(500).send({
        error: 'Internal Server Error',
        message: error.message
      });
    }
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
