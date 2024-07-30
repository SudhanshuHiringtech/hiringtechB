const { JobPost } = require('../model/JobPostSchema');
const express = require('express');
const router = express.Router();


// Filter jobs
router.get('/filterjobs', async (req, res) => {
    console.log(req.query)
    try {
        const filters = {};

        if (req.query.title) {
            filters.title = { $regex: req.query.title, $options: 'i' };
        }
        if (req.query.company) {
            filters.company = { $regex: req.query.company, $options: 'i' };
        }
        if (req.query.skillRequired) {
            filters.techStack = { $in: req.query.techStack.split(',') };
        }
    if (req.query.experienceRequired) {
        const experienceRange = experienceRequired.match(/(\d+)-(\d+)|(\d+)/);
         console.log(experienceRange)
        if (experienceRange) {
        if (experienceRange[1] && experienceRange[2]) {
          // Format is "X-Y years"
          query.experienceRequired = { $gte: Number(experienceRange[1]), $lte: Number(experienceRange[2]) };
        } else {
          // Format is "X years"
          query.experienceRequired = { $eq: Number(experienceRange[3]) };
        }
      }
    }
        if (req.query.location) {
            filters.location = { $regex: req.query.location, $options: 'i' };
        }
        if (req.query.workMode) {
            filters.workMode = { $regex: req.query.workMode, $options: 'i' };
        }

        const jobs = await JobPost.find(filters);
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;