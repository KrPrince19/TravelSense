const express = require('express');
const router = express.Router();
const { generateStory, getStories } = require('../controllers/storyController');

router.post('/generate', generateStory);
router.get('/', getStories);

module.exports = router;
