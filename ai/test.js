const fs = require('fs');
const readline = require('readline');
const axios = require('axios');

async function sendData() {
    const fileStream = fs.createReadStream('../server/demoData/eve.json');
    
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        try {
            const response = await axios.post('http://localhost:5000/add_log', JSON.parse(line));
            console.log(`Status: ${response.status} - ${JSON.stringify(response.data)}`);
        } catch (error) {
            console.error(`Error: ${error.message} - ${error.response.data}`);
        }
    }
}

sendData();