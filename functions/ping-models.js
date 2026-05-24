const fetch = require('node-fetch');

async function testModels() {
    const apiKey = process.argv[2];
    const combinations = [
        { v: 'v1', m: 'gemini-1.5-flash' },
        { v: 'v1', m: 'gemini-1.5-flash-latest' },
        { v: 'v1', m: 'gemini-2.0-flash' },
        { v: 'v1', m: 'gemini-1.5-pro' },
        { v: 'v1beta', m: 'gemini-1.5-flash' },
        { v: 'v1beta', m: 'gemini-1.5-flash-latest' },
        { v: 'v1beta', m: 'gemini-2.0-flash' },
        { v: 'v1beta', m: 'gemini-1.5-pro' }
    ];
    
    for (const combo of combinations) {
        console.log(`\nTesting ${combo.v} | ${combo.m} ...`);
        try {
            const url = `https://generativelanguage.googleapis.com/${combo.v}/models/${combo.m}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }] })
            });
            const data = await response.json();
            if (response.ok) {
                console.log(`>>> SUCCESS! ${combo.v} | ${combo.m}`);
                process.exit(0); // Found it!
            } else {
                console.log(`Failed: ${response.status} - ${data.error ? data.error.message : 'Unknown'}`);
            }
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
    }
}

testModels();
