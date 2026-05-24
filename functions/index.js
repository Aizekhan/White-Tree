const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

/**
 * Clean AI response from markdown wrappers.
 */


/**
 * Clean AI response from markdown wrappers.
 * (Keeping it as a safety layer, but it should be redundant in JSON mode)
 */
function cleanAIResponse(text) {
    if (!text) return "";
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.substring(7);
    if (cleaned.startsWith("```")) cleaned = cleaned.substring(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.substring(0, cleaned.length - 3);
    return cleaned.trim();
}

/**
 * Safe JSON parser — 4-level recovery, never crashes.
 * Level 1: Normal parse
 * Level 2: Try to find complete JSON object (last '}')
 * Level 3: Try to find and close incomplete arrays/objects
 * Level 4: Return { rawText, parseError } as fallback
 */
function safeParseJSON(rawText, modelName) {
    const cleaned = cleanAIResponse(rawText);
    
    // Level 1: Normal parse
    try {
        const result = JSON.parse(cleaned);
        console.log(`[PARSE] Level 1 success for ${modelName}`);
        return result;
    } catch (err1) {
        console.warn(`[PARSE] Level 1 failed (${modelName}): ${err1.message.substring(0, 80)}`);
    }
    
    // Level 2: Find last closing brace
    try {
        const lastBrace = cleaned.lastIndexOf('}');
        if (lastBrace > 0) {
            const result = JSON.parse(cleaned.substring(0, lastBrace + 1));
            console.warn(`[PARSE] Level 2 success — truncated at pos ${lastBrace}`);
            return result;
        }
    } catch (err2) {
        console.warn(`[PARSE] Level 2 failed: ${err2.message.substring(0, 80)}`);
    }
    
    // Level 3: Try to close unclosed structure
    try {
        let attempt = cleaned;
        // Count unclosed braces and brackets
        let braces = 0, brackets = 0;
        let inString = false;
        for (let i = 0; i < attempt.length; i++) {
            const c = attempt[i];
            if (c === '"' && (i === 0 || attempt[i-1] !== '\\')) inString = !inString;
            if (!inString) {
                if (c === '{') braces++;
                else if (c === '}') braces--;
                else if (c === '[') brackets++;
                else if (c === ']') brackets--;
            }
        }
        // Close unclosed string first (if we're inside one)
        if (inString) attempt += '"';
        // Close arrays then objects
        attempt += ']'.repeat(Math.max(0, brackets));
        attempt += '}'.repeat(Math.max(0, braces));
        const result = JSON.parse(attempt);
        console.warn(`[PARSE] Level 3 success — added ${Math.max(0, brackets)} ']' and ${Math.max(0, braces)} '}'`);
        return result;
    } catch (err3) {
        console.warn(`[PARSE] Level 3 failed: ${err3.message.substring(0, 80)}`);
    }
    
    // Level 4: Return raw text as fallback — NEVER crash
    console.error(`[PARSE] All levels failed for ${modelName}. Returning rawText fallback.`);
    return { rawText: cleaned, parseError: true };
}

async function callGeminiREST(apiKey, prompt, systemInstruction, config = {}) {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY secret is missing or not configured.");
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    // Using v1 (stable) as mandated by README_TECHNICAL.md
    const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

    const body = {
        contents: [{
            role: "user",
            parts: [
                // [VER_22_LEGACY_STYLE] Double Prompt strategy for maximum quality
                { text: systemInstruction || "You are an expert Narrative Writer and Editor." },
                { text: `Ось текст користувача або ідея:\n\n${prompt}\n\nВиконай завдання, враховуючи всі інструкції та контекст вище.` }
            ]
        }],
        generationConfig: {
            temperature: (config && typeof config.temperature === 'number') ? config.temperature : 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 32768,
        }
    };

    console.log(`[REST/v1] Sending request to ${modelName} (Stable Flow)...`);

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error(`[REST/v1] Error ${res.status}: ${errText}`);
        
        if (res.status === 404) {
            throw new Error(`Модель ${modelName} не знайдена. Оновіть GEMINI_MODEL у секретах Firebase!`);
        }
        
        throw new Error(`Gemini API Error (${res.status}): ${errText}`);
    }

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
        const finishReason = json?.candidates?.[0]?.finishReason || "unknown";
        throw new Error(`Empty response from API. finishReason: ${finishReason}`);
    }
    
    console.log(`[REST/v1] SUCCESS with model: ${modelName}`);
    return { text, modelName };
}

/**
 * Verify Firebase ID Token.
 */
async function verifyAuth(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("[AUTH] Missing or malformed Authorization header.");
        return null;
    }
    const idToken = authHeader.split("Bearer ")[1];
    if (!idToken || idToken.trim() === "") {
        console.warn("[AUTH] Bearer token is empty.");
        return null;
    }
    try {
        return await admin.auth().verifyIdToken(idToken);
    } catch (e) {
        console.error("[AUTH] Token verification failed:", e.message);
        return null;
    }
}

exports.api = onRequest({
    secrets: ["GEMINI_API_KEY", "GOOGLE_TTS_API_KEY"],
    timeoutSeconds: 300,
    memory: "2GiB",
    cors: true
}, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;

    // FIX: Normalize path — strip leading /api prefix regardless of trailing slashes
    const rawPath = req.path || "/";
    const path = rawPath.replace(/^\/api/, '').replace(/\/$/, '') || '/';

    console.log(`[ROUTE] Method: ${req.method}, Path: "${path}"`);

    // Health endpoint — no auth needed
    if (path === '/health' || path === '' || path === '/') {
        const result = {
            status: 'ok',
            environment: 'production',
            v: 'VER_27_STABLE_FLOW',
            apiKeyConfigured: !!apiKey,
            timestamp: new Date().toISOString()
        };
        if (req.query.diag === 'true') {
            try {
                // [VER_25_GOLD] Passive diagnostic (pre-flight check).
                const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
                const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
                const testRes = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "hi" }] }] })
                });
                result.sdk_init = testRes.ok ? `OK (${model} v1 REST)` : `FAIL (${testRes.status})`;
            } catch (e) {
                result.sdk_error = e.message;
            }
        }
        return res.status(200).json(result);
    }

    // All non-health routes require auth
    const user = await verifyAuth(req);
    if (!user) {
        return res.status(401).json({
            error: 'Unauthorized',
            details: 'A valid Firebase ID token is required. Ensure you are logged in and the token is being sent.'
        });
    }

    // AI Generate
    if (path === '/ai/generate') {
        const { systemInstruction, prompt, projectId, config } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Bad Request', details: 'Missing required field: prompt' });
        }
        const temperature = (config && typeof config.temperature === 'number') ? config.temperature : 0.7;
        console.log(`[AI/GENERATE] ProjectId: ${projectId}, Temperature: ${temperature}, Prompt length: ${prompt.length}`);
        try {
            const { text, modelName } = await callGeminiREST(apiKey, prompt, systemInstruction, { temperature });
            console.log(`[AI/GENERATE] Raw response length: ${text.length}`);
            const parsed = safeParseJSON(text, modelName);
            return res.status(200).json(parsed);
        } catch (error) {
            console.error("[AI/GENERATE] Failed:", error.message);
            return res.status(500).json({ error: 'AI Error', details: error.message });
        }
    }

    // AI Resync
    if (path === '/ai/resync') {
        const { systemInstruction, prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Bad Request', details: 'Missing required field: prompt' });
        }
        try {
            const { text, modelName } = await callGeminiREST(apiKey, prompt, systemInstruction);
            const parsed = safeParseJSON(text, modelName);
            return res.status(200).json(parsed);
        } catch (error) {
            console.error("[AI/RESYNC] Failed:", error.message);
            return res.status(500).json({ error: 'AI Resync Error', details: error.message });
        }
    }

    // TTS
    if (path === '/tts' || path === '/tts/generate') {
        const { text, voiceId, languageCode } = req.body;
        const ttsKey = process.env.GOOGLE_TTS_API_KEY;
        if (!ttsKey) {
            return res.status(500).json({ error: 'GOOGLE_TTS_API_KEY secret is not configured.' });
        }
        if (!text) {
            return res.status(400).json({ error: 'Bad Request', details: 'Missing required field: text' });
        }
        try {
            const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: { text },
                    voice: { languageCode: languageCode || 'uk-UA', name: voiceId || 'uk-UA-Wavenet-A' },
                    audioConfig: { audioEncoding: 'MP3' }
                })
            });
            const data = await response.json();
            if (!data.audioContent) {
                console.error("[TTS] No audioContent in response:", JSON.stringify(data));
                return res.status(500).json({ error: 'TTS failed', details: data.error?.message || 'No audio returned' });
            }
            res.set('Content-Type', 'audio/mpeg');
            return res.send(Buffer.from(data.audioContent, 'base64'));
        } catch (e) {
            console.error("[TTS] Exception:", e.message);
            return res.status(500).json({ error: e.message });
        }
    }

    console.warn(`[ROUTE] No handler for path: "${path}"`);
    return res.status(404).json({ error: 'Route not found', path });
});
