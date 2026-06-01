import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Get API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

console.log('[SERVER] Gemini API Key configured:', GEMINI_API_KEY ? 'YES ✓' : 'NO ✗');

app.use(cors());
app.use(express.json());

// Proxy endpoint for Gemini AI
app.post('/api/ai/generate', async (req, res) => {
    try {
        const { systemInstruction, prompt, responseProperties, requiredFields } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const result = await genAI.models.generateContent({
            model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
            contents: [{
                role: 'user',
                parts: [{ text: prompt }]
            }],
            systemInstruction: systemInstruction ? {
                role: 'system',
                parts: [{ text: systemInstruction }]
            } : undefined,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: responseProperties,
                    required: requiredFields
                }
            }
        });

        console.log('[DEBUG] Result keys:', Object.keys(result));
        console.log('[DEBUG] Result.text exists?', typeof result.text);

        // Try different ways to access the response
        let responseText;
        if (result.text) {
            responseText = result.text;
        } else if (result.response && typeof result.response.text === 'function') {
            responseText = result.response.text();
        } else if (result.candidates && result.candidates[0]) {
            responseText = result.candidates[0].content.parts[0].text;
        } else {
            console.error('[DEBUG] Full result:', JSON.stringify(result, null, 2).slice(0, 1000));
            throw new Error('Could not extract text from Gemini response');
        }

        console.log('[DEBUG] Response text (first 200 chars):', responseText.slice(0, 200));

        try {
            const jsonResponse = JSON.parse(responseText);
            res.json(jsonResponse);
        } catch (parseError) {
            console.error('Error parsing AI response:', responseText);
            res.status(500).json({ error: 'Failed to parse AI response as JSON' });
        }
    } catch (error) {
        console.error('AI Proxy Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Proxy for Resync Future History (Specific prompt-based logic)
app.post('/api/ai/resync', async (req, res) => {
    try {
        const { systemInstruction, prompt } = req.body;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const result = await genAI.models.generateContent({
            model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
            contents: [{
                role: 'user',
                parts: [{ text: prompt }]
            }],
            systemInstruction: systemInstruction ? {
                role: 'system',
                parts: [{ text: systemInstruction }]
            } : undefined
        });

        const responseText = result.text;

        res.json({ text: responseText });
    } catch (error) {
        console.error('AI Resync Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Proxy for Google Text-to-Speech
app.post('/api/tts', async (req, res) => {
    try {
        const { text, voiceId, languageCode } = req.body;

        const apiKey = process.env.VITE_GOOGLE_TTS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'TTS API Key missing' });
        }

        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: { text },
                voice: { languageCode, name: voiceId },
                audioConfig: { audioEncoding: 'MP3' }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'TTS API Error');
        }

        const data = await response.json();
        const audioBuffer = Buffer.from(data.audioContent, 'base64');

        res.set('Content-Type', 'audio/mpeg');
        res.send(audioBuffer);
    } catch (error) {
        console.error('TTS Proxy Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', branding: 'WhiteWrite BFF' });
});

app.listen(port, () => {
    console.log(`WhiteWrite BFF listening at http://localhost:${port}`);
});
