const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Connection
const connectDB = require('./lib/mongodb');
(async () => {
  await connectDB();
})();

// Import Routes
const placesRoutes = require('./routes/places');
const restaurantsRoutes = require('./routes/restaurant');
const cultureRoutes = require('./routes/culture');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
// const locationRoutes = require('./routes/location'); // Optional
const translateRoutes = require('./routes/translate');
const assistantRoutes = require('./routes/assistant');
const questRoutes = require('./routes/quests');
const storyRoutes = require('./routes/stories');
const safetyRoutes = require('./routes/safety');

// Use Routes
console.log('Registering routes...');
app.use('/api/places', placesRoutes);
app.use('/api/restaurants', restaurantsRoutes);
app.use('/api/culture', cultureRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/assistant', assistantRoutes);
console.log('Registering quests...');
app.use('/api/quests', questRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/safety', safetyRoutes);
console.log('All routes registered.');

// Root Endpoint
app.get('/', (req, res) => {
  res.send('TravelSense Express API is running! 🌍🚀');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
