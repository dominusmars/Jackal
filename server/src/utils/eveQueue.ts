import * as mongodb from "mongodb";
import { SuricataEveLog } from "lib";
import { log, setProcess } from "./debug";
import config from "./jackalConfig";
import { throttle } from "lodash";
const dbName = config.IS_DEV ? "jackal-dev" : "jackal";

type messageFromDB = {
    type: "eve-log";
    data: SuricataEveLog;
};

setProcess("eve-queue");

// This process listens for messages from the main process and exports them to MongoDB
// Used for exporting Suricata logs to the database and keeping the main process free
async function startListening() {
    log("info", "Connecting to MongoDB at " + config.FULL_MONGO_URL);
    try {
        const client = new mongodb.MongoClient(config.FULL_MONGO_URL, {});
        await client.connect();
        const db = client.db(dbName);
        log("info", "Connected to MongoDB");
        // Create the eve collection if it doesn't exist
        const logQueue: SuricataEveLog[] = [];

        // this function is used to export the queue to the database, it is throttled to 1 second
        // to prevent flooding the database with too many requests and imporves batching of the logs
        // this is important because the eve logs are generated at a high rate and we need to keep up with them
        const exportQueue = throttle(async () => {
            const currentQueue = [...logQueue];
            logQueue.length = 0;
            await db.collection("eve").insertMany(currentQueue, { ordered: false });
            config.IS_DEV && log("info", "Exported queue " + currentQueue.length);
        }, 1000);

        // Listen for messages from the main process
        process.on("message", (message: messageFromDB) => {
            if ((message as any) == "exit") {
                process.exit(0);
            }
            // Check if the message is valid
            if (typeof message.data == "string") {
                log("error", "Invalid data type: " + typeof message.data);
                return;
            }
            // Check if the message is a eve log
            if (message.type === "eve-log") {
                logQueue.push(message.data);
                exportQueue();
            }
        });
    } catch (error) {
        log("error", "Error" + error);
        startListening();
    }
}

startListening();
