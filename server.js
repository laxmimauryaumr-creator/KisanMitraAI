const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();console.log("SERVER FILE STARTED");

const app = express();
app.use(express.json({ limit: "8mb"}));
app.use(express.static("."));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/api/advice", async (req, res) => {
  try {
    const { question, crop, language } = req.body;
    const languageNames = {
  hi: "Hindi",
  en: "English",
  bn: "Bengali",
  te: "Telugu",
  mr: "Marathi",
  ta: "Tamil",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  or: "Odia",
  as: "Assamese",
  ur: "Urdu",
  ks: "Kashmiri",
  ne: "Nepali"
};

const selectedLanguage = languageNames[language] || "Hindi";

    if (!question || !crop) {
      return res.status(400).json({
        error: "Fasal aur sawal dono likhein.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are Kisan Mitra AI, a farmer advisory assistant.

      Reply in simple ${selectedLanguage}.
      Use easy words that farmers can understand.

Give simple, cautious advice in Hindi.
Crop: ${crop}
Farmer question: ${question}
Mention when the farmer should consult a local agricultural expert.
Do not invent weather, soil, or crop-disease diagnosis.`,
    });

    res.json({ answer: response.text });
  } catch (error) {
    console.error("AI error:", error.message);
    res.status(500).json({
      error: "AI se jawab nahi mil paya. API settings check karein.",
    });
  }
});

app.post("/api/crop-image", async (req, res) => {
  try {
    const { image, mimeType, crop } = req.body;

    if (!image || !mimeType) {
      return res.status(400).json({
        error: "Kripya fasal ki photo upload karein."
      });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({
        error: "JPG, PNG ya WEBP photo use karein."
      });
    }

    if (Buffer.from(image, "base64").length > 5 * 1024 * 1024) {
      return res.status(400).json({
        error: "5 MB se chhoti photo upload karein."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: image
          }
        },
        {
          text: `You are Kisan Mitra AI.
Farmer ki fasal ki photo ko dhyan se dekho.
Fasal: ${crop || "Pata nahi"}.
Simple Hindi mein batao:
1. Photo mein kya dikh raha hai.
2. Sambhavit samasya kya ho sakti hai.
3. Kaun si safe, general care ki ja sakti hai.
4. Kab local Krishi Vigyan Kendra ya agriculture expert se sampark karein.
Sirf photo se pakka diagnosis mat do.
Bina verified diagnosis ke pesticide ya uski dose recommend mat karo.
Agar photo se samasya samajh nahi aati, to saaf batao.`
        }
      ]
    });

    res.json({ answer: response.text });
  } catch (error) {
    console.error("Image analysis error:", error.message);
    res.status(500).json({
      error: "Photo analyze nahi ho payi. Dobara try karein."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Kisan Mitra AI server running on port ${PORT}`);
});