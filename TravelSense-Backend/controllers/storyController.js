const Story = require('../models/Story');
const Quest = require('../models/Quest');
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Generate a personalized daily story based on completed quests and itinerary
 */
const generateStory = async (req, res) => {
  try {
    const { city, itinerary, clerkId } = req.body;
    if (!city) return res.status(400).json({ error: 'City is required' });
    if (!clerkId) return res.status(400).json({ error: 'clerkId is required' });

    // Fetch completed quests for today in this city for this specific user
    const completedQuests = await Quest.find({ city, clerkId, isCompleted: true });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Write a beautiful, first-person travel diary entry for a day in ${city}. 
    The traveler completed these secret quests: ${completedQuests.map(q => q.title).join(', ') || 'Explored the city'}.
    Their planned activities were: ${JSON.stringify(itinerary)}.
    
    Style: Poetic, nostalgic, and professional. 
    Length: 3-4 concise paragraphs.
    Do not use markdown. Just raw text.`;

    const result = await model.generateContent(prompt);
    const narrative = result.response.text().trim();

    const newStory = new Story({
      clerkId,
      city,
      narrative,
      questCount: completedQuests.length
    });

    await newStory.save();
    res.status(201).json(newStory);
  } catch (error) {
    console.error('Story Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate travel story' });
  }
};

const getStories = async (req, res) => {
  try {
    const { city, clerkId } = req.query;
    const query = { city };
    if (clerkId) query.clerkId = clerkId;
    
    const stories = await Story.find(query).sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
};

module.exports = { generateStory, getStories };
