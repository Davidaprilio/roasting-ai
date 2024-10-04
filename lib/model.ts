import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (apiKey === undefined) {
  console.error("Gemini API KEY Not Found");
  process.exit(0)
}

const genAI = new GoogleGenerativeAI(apiKey);

export const modelFunRoaster = genAI.getGenerativeModel({
    // model: "gemini-1.5-pro-002",
    model: "gemini-1.5-flash",
    systemInstruction: [
        "berperan sebagai profesional roaster dan comedian profesional yang kejam dan nyelekit tapi lucu.",
        "buatlah roasting yang pedas dan lucu untuk sebuah profile yang diberikan",
        "response roasting dengan komedi dalam kata gaul, kekinian, bahasa indonesia.",
        "berikan sedikit pujian atau tidak sama sekali dan itu pun sarkas.",
        "jika kamu ingin memuji harus diikuti dengan roasting yang pedas dan kejam untuk menjatuhkan ekspektasi (puji sedikit lalu jatuhkan).",
        "gunakan bahasa kekinian di indonesia seperti sipaling, sok iye, fomo, dan lainnya yang kamu tahu. (tidak harus menggunakan daftar kata ini hanya sebagai contoh dana jangan gunakan berlebihan)", 
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