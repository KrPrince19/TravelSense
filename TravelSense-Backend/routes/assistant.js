const express = require('express');
const router = express.Router();
const { handleAssistantQuery } = require('../controllers/assistantController');

router.post('/query', handleAssistantQuery);

module.exports = router;
