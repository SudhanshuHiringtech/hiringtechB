// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../model/User');
const nodemailer = require('nodemailer');
const auth =  require('../routes/authRoutes');
const upload = require('../middleware/upload');

const router = express.Router();


const personalDetail = async (req, res) => {
    console.log("Hello")
    const {id, name, email, mobileNumber, gender, currentLocation, DOB, totalExperience} = req.body;
    
    try {
        const user = await User.findById(id); // Assuming req.user contains the authenticated user's ID

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update the fields if they are provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (mobileNumber) user.mobileNumber = mobileNumber;
        if (gender) user.gender = gender;
        if (currentLocation) user.currentLocation = currentLocation;
        if (DOB) user.DOB = DOB;
        if ( totalExperience) user.totalExperience =  totalExperience;

        await user.save();

        res.json({ msg: 'Personal details updated successfully', user });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
  };




// Function to update education details
const updateEducation = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {id, education } = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update the education field with the new education array
        user.education = education;

        await user.save();

        res.json({ msg: 'Education details updated successfully', education: user.education });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};




// Function to update skills
const updateSkills = async (req, res) => {
    const {id, skills } = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.skills = skills;

        await user.save();

        res.json({ msg: 'Skills updated successfully', skills: user.skills });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// Function to update languages
const updateLanguages = async (req, res) => {
    const {id, languages } = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.languages = languages;

        await user.save();

        res.json({ msg: 'Languages updated successfully', languages: user.languages });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// Function to update certifications
const updateCertifications = async (req, res) => {
    const { id, certifications } = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.certifications = certifications;

        await user.save();

        res.json({ msg: 'Certifications updated successfully', certifications: user.certifications });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};



// Function to update experience
const updateExperience = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {id, experience } = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update the experience field with the new experience array
        user.experience = experience;

        await user.save();

        res.json({ msg: 'Experience details updated successfully', experience: user.experience });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};



// Function to upload resume
const uploadResume = async (req, res) => {
    const {id} = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Save resume URL to user's profile
        user.resume = req.file.path;
        await user.save();

        res.json({ msg: 'Resume uploaded successfully', resume: user.resume });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /profile/upload-resume
// @desc    Upload resume
// @access  Private
router.post('/upload-resume', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ msg: err });
        }

        if (req.file == undefined) {
            return res.status(400).json({ msg: 'No file selected' });
        }

        await uploadResume(req, res);
    });
});


router.post('/experience', [
    check('experience', 'Experience details are required').isArray().notEmpty(),
    check('experience.*.title', 'Title is required').not().isEmpty(),
    check('experience.*.company', 'Company is required').not().isEmpty(),
    check('experience.*.location', 'Location is required').not().isEmpty(),
    check('experience.*.startDate', 'Start date is required').isISO8601(),
    check('experience.*.endDate', 'End date must be a valid date').optional().isISO8601(),
    check('experience.*.description', 'Description is required').not().isEmpty()
], updateExperience);

router.post('/skills', [
    check('skills', 'Skills are required').isArray().notEmpty(),
    check('skills.*.name', 'Skill name is required').not().isEmpty(),
    check('skills.*.proficiency', 'Proficiency level is required').not().isEmpty(),
], updateSkills);



router.post('/languages',[
    check('languages', 'Languages are required').isArray().notEmpty(),
    check('languages.*.name', 'Language name is required').not().isEmpty(),
    check('languages.*.proficiency', 'Proficiency level is required').not().isEmpty(),
], updateLanguages);

// @route   PUT /profile/certifications
// @desc    Update certifications
// @access  Private
router.post('/certifications',  [
    check('certifications', 'Certifications are required').isArray().notEmpty(),
], updateCertifications);


router.post('/education', [
    check('education', 'Education details are required').isArray().notEmpty(),
    check('education.*.institution', 'Institution is required').not().isEmpty(),
    check('education.*.degree', 'Degree is required').not().isEmpty(),
    check('education.*.fieldOfStudy', 'Field of study is required').not().isEmpty(),
    check('education.*.startDate', 'Start date is required').isISO8601(),
], updateEducation);

  router.post('/personal-details', [
    auth
], personalDetail);



  


module.exports = router;