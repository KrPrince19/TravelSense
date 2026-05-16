const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getCurrentWeather } = require("../services/weatherService");

/**
 * Dynamic Assistant Controller
 * Handles real-time itinerary modifications and contextual travel help.
 */
const handleAssistantQuery = async (req, res) => {
  try {
    const { query, currentItinerary, location, coordinates } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is missing on the server.' });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Fetch Weather Logic
    const weather = await getCurrentWeather(location, coordinates);
    const weatherContext = weather 
      ? `Current Weather: ${weather.temp}°C, ${weather.condition}. ${weather.isRainy ? "⚠️ WARN: It is raining, prioritized indoor activities." : "Expect clear weather."}`
      : "Weather data currently unavailable.";

    const systemPrompt = `You are a professional AI Travel Assistant for the "TravelSense" app. 
    Current Location: ${location} (${coordinates?.lat}, ${coordinates?.lon})
    ${weatherContext}
    
    Current Itinerary: ${JSON.stringify(currentItinerary)}

    Your goal is to help the user manage their trip. You can:
    1. Skip the next stop.
    2. Swap activities.
    3. Find immediate alternatives (food, coffee, rest).
    4. Provide cultural or language tips.

    If the user wants to change the plan, return the UPDATED itinerary in the response.
    Respond in JSON format:
    {
      "message": "A friendly conversational response to the user",
      "updatedItinerary": { ... same structure as currentItinerary or null if no change ... },
      "actionTaken": "skip_stop" | "find_alternative" | "none"
    }
    
    Respond ONLY with raw JSON. No markdown.`;

    const result = await model.generateContent(`${systemPrompt}\n\nUser Query: "${query}"`);
    let aiText = result.response.text();
    
    // Clean JSON
    aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(aiText);

    res.status(200).json(parsedData);

  } catch (error) {
    console.error('Error in Assistant Controller:', error);
    res.status(500).json({ error: 'Assistant is currently resting. Please try again.' });
  }
};

module.exports = { handleAssistantQuery };
