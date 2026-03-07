const express = require('express');
const router = express.Router();
const voiceAgentService = require('../services/voiceAgentService');
const Conversation = require('../models/Conversation');

// Process text input from voice agent
router.post('/process', async (req, res) => {
  try {
    const { text, conversationId } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await voiceAgentService.processUserInput(text, conversationId);
    res.json(response);
  } catch (error) {
    console.error('Agent Process Error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Get conversation history
router.get('/conversation/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('appointmentBooked');
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get Conversation Error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

module.exports = router;