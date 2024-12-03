import * as mongodb from "mongodb";
import { SuricataEveLog } from "lib";
import { log } from "./debug";
import config from "./jackalConfig";
import { throttle } from "lodash";
const dbName = config.IS_DEV ? "jackal-dev" : "jackal";

type messageFromDB = {
    type: "eve-log";
    data: SuricataEveLog;
};

async function startListening() {
    log("info", "[eve-process] Connecting to MongoDB at " + config.FULL_MONGO_URL);

    const client = new mongodb.MongoClient(config.FULL_MONGO_URL);
    await client.connect();
    const db = client.db(dbName);
    log("info", "[eve-process] Connected to MongoDB");
    const logQueue: SuricataEveLog[] = [];
    const exportQueue = throttle(async () => {
        const currentQueue = [...logQueue];
        logQueue.length = 0;
        await db.collection("eve").insertMany(currentQueue, { ordered: false });
        config.IS_DEV && log("info", "[eve-process] Exported queue " + currentQueue.length);
    }, 1000);

    process.on("message", (message: messageFromDB) => {
        if (typeof message.data == "string") {
            log("error", "[eve-process] Invalid data type: " + typeof message.data);
            return;
        }
        if (message.type === "eve-log") {
            logQueue.push(message.data);
            exportQueue();
        }
    });
}

startListening();
