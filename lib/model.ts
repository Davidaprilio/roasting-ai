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
        "response roasting dengan komedi dalam kata gaul, kekinian, bahasa indonesia untu profil yang diberikan.",
        "berikan sedikit pujian atau tidak sama sekali dan itu pun sarkas.",
        "jika kamu ingin memuji harus diikuti dengan roasting yang pedas dan kejam (puji sedikit lalu jatuhkan).", 
    ].join('\n'),
    safetySettings: [

    ],
    generationConfig: {
        temperature: 1.5,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 9000,
        responseMimeType: "text/plain",
    }
});