const { JobPost } = require('../model/JobPostSchema');
const express = require('express');
const router = express.Router();


// Filter jobs
router.get('/filterjobs', async (req, res) => {
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
            const experienceRange = req.query.experienceRequired.split('-').map(Number);
            filters.minExperienceRequired = { $lte: experienceRange[1] };
            filters.maxExperienceRequired = { $gte: experienceRange[0] };
        }
        if (req.query.location) {
            filters.location = { $regex: req.query.location, $options: 'i' };
        }

        const jobs = await JobPost.find(filters);
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;