const Story = require('../models/Story');
const TripPlan = require('../models/TripPlan');
const Quest = require('../models/Quest');

const getUserHistory = async (req, res) => {
  try {
    const { clerkId } = req.params;

    if (!clerkId) {
      return res.status(400).json({ error: 'clerkId is required.' });
    }

    // Fetch counts for the profile dashboard
    const storyCount = await Story.countDocuments({ clerkId });
    const completedTripCount = await TripPlan.countDocuments({ clerkId, isCompleted: true });
    
    // Fetch recent items for the history log
    const recentStories = await Story.find({ clerkId }).sort({ createdAt: -1 }).limit(5);
    const recentTrips = await TripPlan.find({ clerkId }).sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      stats: {
        stories: storyCount,
        trips: completedTripCount
      },
      history: {
        stories: recentStories,
        trips: recentTrips
      }
    });
  } catch (error) {
    console.error('Error in getUserHistory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getUserHistory };
