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
        const logQueue: SuricataEveLog[] = [];
        const exportQueue = throttle(async () => {
            const currentQueue = [...logQueue];
            logQueue.length = 0;
            await db.collection("eve").insertMany(currentQueue, { ordered: false });
            config.IS_DEV && log("info", "Exported queue " + currentQueue.length);
        }, 1000);

        process.on("message", (message: messageFromDB) => {
            if ((message as any) == "exit") {
                process.exit(0);
            }

            if (typeof message.data == "string") {
                log("error", "Invalid data type: " + typeof message.data);
                return;
            }
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
