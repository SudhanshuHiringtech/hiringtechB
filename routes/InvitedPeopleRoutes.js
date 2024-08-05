const express = require('express');
const router = express.Router();
const { InvitedPeople} = require('../model/JobPostSchema');
router.post('/invited-people', async (req, res) => {
    try {
      const { ownId, invitedPersonId, invitedPersonName, invitedPersonEmail, invitedPersonProfileStatus } = req.body;
  
      // Create a new invited person document
      const invitedPerson = new InvitedPeople({
        ownId,
        invitedPersonId,
        invitedPersonName,
        invitedPersonEmail,
        invitedPersonProfileStatus
      });
  
      // Save the document to the database
      await invitedPerson.save();
  
      // Respond with the saved document
      res.status(201).json(invitedPerson);
    } catch (error) {
      console.error('Error saving invited person:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  });

 // GET API to fetch invitations by ownId
router.get('/Invited-people', async (req, res) => {
  try {
    const { ownId } = req.query;
    if (!ownId) {
      return res.status(400).json({ message: 'ownId is required' });
    }
    
    const invitations = await InvitedPeople.find({ ownId });
    res.status(200).json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





  module.exports = router;