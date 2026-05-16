const User = require('../models/User');

const syncUser = async (req, res) => {
  try {
    const { clerkId, email, latitude, longitude } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ error: 'clerkId and email are required.' });
    }

    const updateData = {
      email,
      lastLocation: {
        lat: latitude,
        lng: longitude,
        updatedAt: new Date()
      }
    };

    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error in syncUser:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUserLocation = async (req, res) => {
    try {
        const { clerkId } = req.params;
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ 
            lat: user.lastLocation?.lat, 
            lng: user.lastLocation?.lng 
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { syncUser, getUserLocation };
