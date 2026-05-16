const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const TripPlan = require('../models/TripPlan');

// Get user history and stats
router.get('/:clerkId', profileController.getUserHistory);

// Save a trip plan
router.post('/trips', async (req, res) => {
    try {
        const { clerkId, destination, planJSON, isCompleted } = req.body;
        const newTrip = new TripPlan({ clerkId, destination, planJSON, isCompleted });
        await newTrip.save();
        res.status(201).json(newTrip);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save trip' });
    }
});

module.exports = router;
