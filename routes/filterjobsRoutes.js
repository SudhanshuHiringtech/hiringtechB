const { JobPost } = require('../model/JobPostSchema');
const express = require('express');
const router = express.Router();


// // Filter jobs
// router.get('/filterjobs', async (req, res) => {
//     console.log(req.query)
//     try {
//         const filters = {};

//         if (req.query.title) {
//             filters.title = { $regex: req.query.title, $options: 'i' };
//         }
//         if (req.query.company) {
//             filters.company = { $regex: req.query.company, $options: 'i' };
//         }
//         if (req.query.skillRequired) {
//             filters.techStack = { $in: req.query.techStack.split(',') };
//         }
//     if (req.query.experienceRequired) {
//         const experienceRange = experienceRequired.match(/(\d+)-(\d+)|(\d+)/);
//          console.log(experienceRange)
//         if (experienceRange) {
//         if (experienceRange[1] && experienceRange[2]) {
//           // Format is "X-Y years"
//           query.experienceRequired = { $gte: Number(experienceRange[1]), $lte: Number(experienceRange[2]) };
//         } else {
//           // Format is "X years"
//           query.experienceRequired = { $eq: Number(experienceRange[3]) };
//         }
//       }
//     }
//         if (req.query.location) {
//             filters.location = { $regex: req.query.location, $options: 'i' };
//         }
//         if (req.query.workMode) {
//             filters.workMode = { $regex: req.query.workMode, $options: 'i' };
//         }

//         const jobs = await JobPost.find(filters);
//         res.status(200).json(jobs);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });


// GET /api/jobposts - Get job posts with optional filters
router.get('/filterjobs', async (req, res) => {
    try {
      const {
        jobTitle,
        company,
        jobType,
        jobStatus,
        workMode,
        location,
        minPay,
        maxPay,
        experienceRequired,
        skillsRequired,
      } = req.query;
  
      // Build the filter object dynamically
      let filter = {};
  
      if (jobTitle) filter.jobTitle = { $regex: jobTitle, $options: 'i' }; // Case-insensitive regex search
      if (company) filter.company = { $regex: company, $options: 'i' };
      if (jobType) filter.jobType = jobType;
      if (jobStatus) filter.jobStatus = jobStatus;
      if (workMode) filter.workMode = workMode;
      if (location) filter.location = { $regex: location, $options: 'i' };
      if (minPay) filter.minPay = { $gte: minPay };
      if (maxPay) filter.maxPay = { $lte: maxPay };
      if (experienceRequired) filter.experienceRequired = { $regex: experienceRequired, $options: 'i' };
      if (skillsRequired) filter.skillsRequired = { $all: skillsRequired.split(',') }; // Expecting comma-separated values
  
      // Fetch job posts based on filter
      const jobPosts = await JobPost.find(filter);
      res.status(200).json(jobPosts);
  
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });


module.exports = router;