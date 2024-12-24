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
            let obj = JSON.parse(line);
            if( obj['event_type'] == 'stats' ){
                continue;
              
            }
            const response = await axios.post('http://localhost:5000/add_log', JSON.parse(line));
            console.log(`Status: ${response.status} - ${JSON.stringify(response.data)}`);

            let data = response.data;
            if( data['anomaly'] == -1 ){
                fs.appendFile('../server/demoData/anomaly.json', line + "\n", (err) => {
                    if (err) throw err;
                });
            }else {
                fs.appendFile('../server/demoData/normal.json', line + "\n", (err) => {
                    if (err) throw err;
                });
            }

            
        } catch (error) {
            console.error(`Error: ${error.message} - ${error.response.data}`);
        }
    }
}

sendData();