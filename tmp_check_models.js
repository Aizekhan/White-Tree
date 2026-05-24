const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No GEMINI_API_KEY found");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // Since listModels is not directly on genAI in some versions, 
        // we use the fetch-based approach or check the docs.
        // In @google/generative-ai, listModels is not a common method on the main class.
        // It's usually handled via the discovery API.
        
        console.log("Checking model: gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hi");
        console.log("Success with gemini-1.5-flash!");
    } catch (e) {
        console.error("Failed with gemini-1.5-flash:", e.message);
    }

    try {
        console.log("Checking model: gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hi");
        console.log("Success with gemini-pro!");
    } catch (e) {
        console.error("Failed with gemini-pro:", e.message);
    }
}

listModels();
