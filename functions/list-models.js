const fetch = require('node-fetch');

async function listModels() {
    const apiKey = process.argv[2];
    const versions = ['v1', 'v1beta'];
    
    for (const v of versions) {
        process.stdout.write(`\n--- ${v} ---\n`);
        try {
            const url = `https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.models) {
                data.models.forEach(m => process.stdout.write(`${m.name}\n`));
            } else {
                process.stdout.write(`Error: ${JSON.stringify(data)}\n`);
            }
        } catch (e) {
            process.stdout.write(`Fail: ${e.message}\n`);
        }
    }
}

listModels();
