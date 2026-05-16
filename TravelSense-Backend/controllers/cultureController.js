const CultureData = require('../models/CultureData');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const getCultureData = async (req, res) => {
  try {
    const { city, state, country } = req.query;

    if (!city || !state || !country) {
      return res.status(400).json({ error: 'City, state, and country are required query parameters.' });
    }

    // 1. Attempt to fetch exact city from MongoDB database
    let culturalData = await CultureData.findOne({
      city: { $regex: new RegExp(`^${city}$`, 'i') },
      state: { $regex: new RegExp(`^${state}$`, 'i') },
      country: { $regex: new RegExp(`^${country}$`, 'i') }
    });

    if (culturalData) {
      return res.status(200).json(culturalData);
    }

    // 2. SMART AI GENERATION: If exact city not found, use Gemini to generate and dynamically store data!
    try {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (GEMINI_API_KEY) {
        console.log(`Generating authentic local data for ${city}, ${state} via Google Gemini 2.5 AI SDK...`);
        const prompt = `Provide exactly 8 authentic famous local foods (ensure at least 2 are famous local sweet desserts), up to 4 exact local languages or major dialects strictly spoken in the region (e.g., Bhojpuri/Maithili for Bihar, Telugu for Andhra Pradesh) with exactly 4 traveler English-to-Local phrases each, and 3 specific culture tips for a traveler visiting the city of ${city}, in ${state}, ${country}.
Respond ONLY in valid JSON format matching this exact structure containing no markdown wrappers, no markdown codeblocks, just the raw JSON:
{
  "famous_foods": [ { "name": "...", "description": "...", "image_url": "" } ],
  "languages": [ { "language": "...", "phrases": [ { "english": "...", "local": "..." } ] } ],
  "culture_tips": [ "...", "..." ]
}`;
        
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        let aiText = result.response.text();
          
          // Clean the JSON string (Gemini sometimes returns markdown json blocks)
          aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();
          
          const parsedData = JSON.parse(aiText);

          // Server-side Image Scraping: Get Wikipedia images or unique fallbacks
          const savoryFallbacks = [
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
            "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=500&q=80",
            "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500&q=80",
            "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&q=80"
          ];
          const dessertFallbacks = [
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80",
            "https://images.unsplash.com/photo-1484723091791-c0870f443831?w=500&q=80",
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
            "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80",
            "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80"
          ];

          const enrichedFoods = await Promise.all(parsedData.famous_foods.map(async (food) => {
            const isSweet = /sweet|dessert|sugar|syrup|cake/i.test(food.description) || /sweet|dessert|cake/i.test(food.name);
            const fallbackPool = isSweet ? dessertFallbacks : savoryFallbacks;
            // Generate a consistent hash index based on the food name so it maintains the same image across loads
            let hash = 0;
            for (let i = 0; i < food.name.length; i++) hash += food.name.charCodeAt(i);
            let finalImgUrls = fallbackPool[hash % fallbackPool.length];

            try {
              // 1. Search Wikipedia for closest article title
              const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(food.name + " food")}&utf8=&format=json&origin=*`);
              const searchData = await searchRes.json();
              if (searchData.query?.search?.length > 0) {
                 const matchedTitle = searchData.query.search[0].title;
                 // 2. Fetch the thumbnail for that verified article
                 const imgRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(matchedTitle)}&prop=pageimages&format=json&pithumbsize=500&origin=*`);
                 const imgData = await imgRes.json();
                 const pages = imgData.query?.pages;
                 if (pages) {
                   const pageId = Object.keys(pages)[0];
                   if (pages[pageId].thumbnail?.source) {
                     finalImgUrls = pages[pageId].thumbnail.source;
                   }
                 }
              }
            } catch(e) { } // silent fail on wiki error
            return { ...food, image_url: finalImgUrls };
          }));
          
          parsedData.famous_foods = enrichedFoods;
          
          // Automatically save the localized AI generated data to MongoDB for next time!
          culturalData = await CultureData.create({
            country, state, city, 
            famous_foods: parsedData.famous_foods,
            languages: parsedData.languages,
            culture_tips: parsedData.culture_tips
          });
          
          console.log(`Successfully generated and saved AI data to database for ${city}!`);
          return res.status(200).json(culturalData);
      }
    } catch (aiError) {
      console.error('AI Generation Failed. Falling back gently...', aiError);
    }

    // 3. SMART FALLBACK (STATE-LEVEL): If exact city is not found and AI fails, fetch ANY data for the state!
    if (!culturalData) {
      culturalData = await CultureData.findOne({
        state: { $regex: new RegExp(`^${state}$`, 'i') },
        country: { $regex: new RegExp(`^${country}$`, 'i') }
      });
      console.log(`Fallback triggered. Using state-level data for ${state}.`);
    }

    if (culturalData) {
      // Convert to plain object to safely manipulate
      const responseData = culturalData.toObject ? culturalData.toObject() : culturalData;
      // Overwrite the returned city property to emotionally ground it to the user's specific location
      responseData.city = city;
      return res.status(200).json(responseData);
    }

    // SMART FALLBACK: If not found in database, return dummy fallback data.
    // In a future update, an AI API (like Gemini/OpenAI) can be integrated here.
    return res.status(200).json({
      country,
      state,
      city,
      is_fallback: true,
      famous_foods: [
        {
          name: "Regional Specialty",
          description: `A delicious local dish popular in ${city}.`,
          image_url: ""
        },
        {
          name: "Local Street Food",
          description: `Famous street food found across ${state}.`,
          image_url: ""
        }
      ],
      languages: [
        {
          language: "Local Language",
          phrases: [
            { english: "Hello", local: "Hello (Local Translation)" },
            { english: "Thank you", local: "Thank you (Local Translation)" },
            { english: "Where is the restroom?", local: "Where is the restroom? (Local Translation)" }
          ]
        }
      ],
      culture_tips: [
        `Respect local customs in ${city}.`,
        "Try greeting locals with a smile.",
        "Always carry some local currency for small purchases."
      ]
    });

  } catch (error) {
    console.error('Error in getCultureData:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const seedCultureData = async (req, res) => {
  try {
    const data = {
      country: "India",
      state: "Andhra Pradesh",
      city: "Nellore",
      famous_foods: [
        { name: "Nellore Chepala Pulusu", description: "A famous, spicy and tangy fish curry.", image_url: "" },
        { name: "Pulihora", description: "A traditional South Indian tamarind rice dish.", image_url: "" },
        { name: "Gongura Pachadi", description: "A vibrant and tangy chutney made from sorrel leaves.", image_url: "" }
      ],
      languages: [
        { language: "Telugu", phrases: [{ english: "Hello", local: "Namaskaram" }, { english: "Thank you", local: "Dhanyavadalu" }] }
      ],
      culture_tips: ["Remove shoes before entering temples.", "Locals are very welcoming!"]
    };
    await CultureData.deleteMany({ city: "Nellore" });
    await CultureData.create(data);
    res.status(200).json({ success: true, message: 'Seeded test data for Nellore' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCultureData, seedCultureData };
