const express = require('express');
const router = express.Router();
const { getSafetyInfo } = require('../controllers/safetyController');

router.get('/', getSafetyInfo);

module.exports = router;
