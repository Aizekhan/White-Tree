import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Gemini
const genAI = new GoogleGenAI(process.env.VITE_GEMINI_API_KEY || '');

app.use(cors());
app.use(express.json());

// Proxy endpoint for Gemini AI
app.post('/api/ai/generate', async (req, res) => {
    try {
        const { systemInstruction, prompt, responseProperties, requiredFields } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: responseProperties,
                    required: requiredFields
                }
            },
            systemInstruction: systemInstruction
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

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

        const model = genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
            systemInstruction: systemInstruction
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

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
