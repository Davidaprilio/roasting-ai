import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (apiKey === undefined) {
  console.error("Gemini API KEY Not Found");
  process.exit(0)
}

const genAI = new GoogleGenerativeAI(apiKey);

// Google retires old models over time (1.5 and 2.5 are gone); override via GEMINI_MODEL if needed.
// The fallbacks take over when the main model is overloaded (comma separated, in order).
const modelNames = Array.from(new Set([
    process.env.GEMINI_MODEL || "gemini-3.8-flash",
    ...(process.env.GEMINI_FALLBACK_MODELS ?? "gemini-3.7-flash,gemini-3.6-flash,gemini-3.5-flash-lite").split(','),
].map((name) => name.trim()).filter(Boolean)))

const roasterModels = modelNames.map((model) => genAI.getGenerativeModel({
    model,
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
}));

// How long a model gets to start answering before the next one is tried
const FIRST_RESPONSE_TIMEOUT_MS = 10_000

// Streams the roast text. When a model is overloaded (503 "high demand"), hangs or has been
// retired, the next one is tried. Only safe while nothing has been sent yet, so a mid-stream
// failure is rethrown.
export async function* streamRoast(prompt: string) {
    let lastError: unknown
    let busy = false
    for (const model of roasterModels) {
        const controller = new AbortController()
        let timedOut = false
        const timer = setTimeout(() => {
            timedOut = true
            controller.abort()
        }, FIRST_RESPONSE_TIMEOUT_MS)
        let started = false
        try {
            const result = await model.generateContentStream(prompt, { signal: controller.signal })
            // The SDK also exposes the aggregated response; unhandled, its rejection crashes the server
            result.response.catch(() => {})
            for await (const chunk of result.stream) {
                clearTimeout(timer)
                const text = chunk.text()
                if (!text) continue
                started = true
                yield text
            }
            return
        } catch (err) {
            const status = (err as { status?: number } | null)?.status
            // 4xx is our own fault (bad request, quota) except 404, which means the model has been retired
            const clientError = status !== undefined && status >= 400 && status < 500
            if (started || (clientError && status !== 404 && !timedOut)) throw err
            lastError = err
            // Anything else is on Gemini's side: overloaded (5xx), hanging, or a broken stream
            busy ||= timedOut || !clientError
            console.warn(`${model.model} skipped:`, timedOut ? `no response within ${FIRST_RESPONSE_TIMEOUT_MS}ms` : err instanceof Error ? err.message : err)
        } finally {
            clearTimeout(timer)
        }
    }
    if (!busy) throw lastError
    // status 503 makes getRateLimitInfo treat it as the AI needing a rest
    throw Object.assign(new Error(`Gemini is unavailable on every model (${modelNames.join(', ')})`), { status: 503, cause: lastError })
}
