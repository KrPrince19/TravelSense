const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');

// GET /api/places
router.get('/', placesController.getPlaces);

module.exports = router;
