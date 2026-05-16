const Quest = require('../models/Quest');
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Generate 3 unique quests for a city using AI
 */
const generateQuests = async (req, res) => {
  try {
    const { city, clerkId } = req.body;
    if (!city) return res.status(400).json({ error: 'City is required' });
    if (!clerkId) return res.status(400).json({ error: 'clerkId is required' });

    // Check if quests already exist for this city for this specific user
    const existingQuests = await Quest.find({ city, clerkId });
    if (existingQuests.length > 0) {
      return res.status(200).json(existingQuests);
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate 3 interesting "Hidden Quests" for a traveler in ${city}.
    Each quest should be a specific landmark or unique spot with coordinates.
    Return ONLY a JSON array:
    [{
      "title": "Title of the quest",
      "riddle": "A fun riddle or hint for the user",
      "lat": decimal_latitude,
      "lon": decimal_longitude,
      "points": 100
    }]`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const questData = JSON.parse(text);

    const savedQuests = await Quest.insertMany(
      questData.map(q => ({ ...q, city, clerkId }))
    );

    res.status(201).json(savedQuests);
  } catch (error) {
    console.error('Quest Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate quests' });
  }
};

const getQuests = async (req, res) => {
  try {
    const { city, clerkId } = req.query;
    const query = {};
    if (city) query.city = city;
    if (clerkId) query.clerkId = clerkId;
    
    const quests = await Quest.find(query);
    res.status(200).json(quests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quests' });
  }
};

const completeQuest = async (req, res) => {
    try {
      const { id } = req.params;
      const quest = await Quest.findByIdAndUpdate(id, { isCompleted: true }, { new: true });
      res.status(200).json(quest);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update quest' });
    }
  };

const verifyQuestPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageBase64, city } = req.body; // Expecting base64 string without data:image prefix

    const quest = await Quest.findById(id);
    if (!quest) return res.status(404).json({ error: 'Quest not found' });

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Vision Prompt
    const prompt = `You are a professional travel inspector for the "TravelSense" app. 
    Analyze this photo. Is it possible that this photo shows the landmark '${quest.title}' in ${city}? 
    Verify visual alignment with the riddle/hint: "${quest.riddle}".
    Return ONLY a JSON object: 
    { "isMatch": true/false, "confidence": 0-1, "description": "short analysis" }`;

    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    let text = result.response.text();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const verification = JSON.parse(text);

    if (verification.isMatch && verification.confidence > 0.6) {
      quest.isCompleted = true;
      await quest.save();
      return res.status(200).json({ success: true, verification });
    }

    res.status(200).json({ success: false, verification });
  } catch (error) {
    console.error('Vision Verification Error:', error);
    res.status(500).json({ error: 'AI failed to inspect the image' });
  }
};

module.exports = { generateQuests, getQuests, completeQuest, verifyQuestPhoto };
