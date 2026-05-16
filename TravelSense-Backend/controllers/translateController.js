const { GoogleGenerativeAI } = require("@google/generative-ai");

const translateText = async (req, res) => {
  try {
    const { text, targetLanguage = "English" } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text to translate is required.' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is missing on the server.' });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Translate the following text to ${targetLanguage}. 
    Provide ONLY the translated text, no explanation, no quotes, no markdown.
    Text: "${text}"`;

    const result = await model.generateContent(prompt);
    const translatedText = result.response.text().trim();

    res.status(200).json({ 
        original: text,
        translated: translatedText,
        language: targetLanguage 
    });

  } catch (error) {
    console.error('Error in translateText:', error);
    res.status(500).json({ error: 'Translation failed. Please try again.' });
  }
};

module.exports = { translateText };
