const express = require('express');
const router = express.Router();
const restaurantsController = require('../controllers/restaurantController');

router.get('/', restaurantsController.getRestaurants);

module.exports = router;
