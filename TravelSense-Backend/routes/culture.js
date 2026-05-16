const express = require('express');
const router = express.Router();
const { getCultureData, seedCultureData } = require('../controllers/cultureController');

// GET /api/culture/seed
router.get('/seed', seedCultureData);

// GET /api/culture?city=CityName&state=StateName&country=CountryName
router.get('/', getCultureData);

module.exports = router;
