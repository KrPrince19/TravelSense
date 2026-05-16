const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Sync user data and location from Clerk
router.post('/sync', userController.syncUser);

// Get user location by Clerk ID
router.get('/location/:clerkId', userController.getUserLocation);

module.exports = router;
