const express = require('express');
const router = express.Router();
const { generateQuests, getQuests, completeQuest, verifyQuestPhoto } = require('../controllers/questController');

router.post('/generate', generateQuests);
router.get('/', getQuests);
router.patch('/:id/complete', completeQuest);
router.post('/:id/verify', verifyQuestPhoto);

module.exports = router;
