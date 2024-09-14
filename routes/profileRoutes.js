// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../model/User');
const nodemailer = require('nodemailer');
const auth =  require('../routes/authRoutes');
const {upload, uploadCertAndResume} = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const personalDetail = async (req, res) => {
    console.log("Hello");
    const { id, name, email, mobileNumber, gender, currentLocation, DOB, totalExperience } = req.body;
  
    try {
      const user = await User.findById(id);
  
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
      if (totalExperience) user.totalExperience = totalExperience;
  
      // If an image is uploaded, update profileImage
      if (req.file) {
        user.profileImage = {
          path: `uploads/${req.file.filename}`.replace(/\\/g, '/')  // Save the file path
        };
      }
  
      //console.log("check", req.body);
      
      await user.save();
  
      res.json({ msg: 'Personal details updated successfully', user });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  };
  


// Function to update education details
const updateEducation = async (req, res) => {
    console.log("Education")
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
        console.log(user.education);
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





// Function to update experience
const updateExperience = async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }

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
const uploadFiles = async (req, res) => {
    const { id } = req.body;
  
    try {
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      if (req.files.certification) {
        const certificationFile = req.files.certification[0];
        const certificationDir = path.dirname(certificationFile.path);
        const certificationPath = path.join(certificationDir, certificationFile.originalname);
        fs.renameSync(certificationFile.path, certificationPath);
        user.certifications = certificationPath;
    }

    if (req.files.resume) {
        const resumeFile = req.files.resume[0];
        const resumeDir = path.dirname(resumeFile.path);
        const resumePath = path.join(resumeDir, resumeFile.originalname);
        fs.renameSync(resumeFile.path, resumePath);
        user.resume = resumePath;
    }
      await user.save();
  
      res.json({ 
        msg: 'Files uploaded successfully', 
        certificationImage: user.certifications, 
        resumeFile: user.resume
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  };


  
router.post('/upload-files', (req, res) => {
    uploadCertAndResume(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ msg: err });
        }

        if (!req.files || (!req.files.certification && !req.files.resume)) {
            return res.status(400).json({ msg: 'No files selected' });
        }

        await uploadFiles(req, res);
    });
});

router.post('/experience', [
    check('experience', 'Experience details are required').isArray().notEmpty(),
    check('experience.*.designation', 'designation is required').not().isEmpty(),
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



router.post('/education', [
    check('education', 'Education details are required').isArray().notEmpty(),
    check('education.*.institution', 'Institution is required').not().isEmpty(),
    check('education.*.degree', 'Degree is required').not().isEmpty(),
    check('education.*.fieldOfStudy', 'Field of study is required').not().isEmpty(),
    check('education.*.startDate', 'Start date is required').isISO8601(),
], updateEducation);


router.post('/personal-details', (req, res) => {
    upload(req, res, async (err) => {
        console.log(req.file)
        if (err) {
            return res.status(400).json({ msg: err });
        }
        console.log(req.file)
        console.log(req.body)
        if (req.file == undefined) {
            return res.status(400).json({ msg: 'No file selected' });
        }

        await personalDetail(req, res);
    });
});


  


module.exports = router;