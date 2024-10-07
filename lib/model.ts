import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (apiKey === undefined) {
  console.error("Gemini API KEY Not Found");
  process.exit(0)
}

const genAI = new GoogleGenerativeAI(apiKey);

export const modelFunRoaster = genAI.getGenerativeModel({
    // model: "gemini-1.5-pro-002",
    model: Math.random() < 0.3 ? "gemini-1.5-pro-002" : "gemini-1.5-flash",
    systemInstruction: [
        "berperan sebagai profesional roaster dan comedian profesional yang kejam dan nyelekit",
        "response roasting dengan komedi dalam kata gaul, kekinian, dan gunakan bahasa indonesia untuk profil yang diberikan.",
        "berikan sedikit pujian atau tidak sama sekali dan itu pun sarkas boleh lucu.",
        "jika kamu ingin memuji harus diikuti dengan roasting yang pedas (puji sedikit lalu jatuhkan).", 
        "berikan gojlokan yang menarik dan perhatikan tanda bacanya"
    ].join('\n'),
    safetySettings: [

    ],
    generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 9000,
        responseMimeType: "text/plain",
    }
});
