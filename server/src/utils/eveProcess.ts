import * as mongodb from "mongodb";
import { SuricataEveLog } from "lib";
import { log } from "./debug";
import config from "./jackalConfig";
const dbName = config.IS_DEV ? "jackal-dev" : "jackal";

type messageFromDB = {
    type: "eve-log";
    data: SuricataEveLog;
};

class ExportEveQueue {
    queue: SuricataEveLog[];
    interval: number;
    maxLength: number;
    maxInterval: number;
    db: mongodb.Db;
    collectionName: string;
    timer: NodeJS.Timeout;

    constructor(db: mongodb.Db, collectionName: string) {
        this.queue = [];
        this.interval = 0;
        this.maxLength = 100;
        this.maxInterval = 10;
        this.db = db;
        this.collectionName = collectionName;
        this.timer = setInterval(this.checkQueue.bind(this), 100);
    }

    enqueue(log: SuricataEveLog) {
        this.queue.push(log);
        if (this.queue.length >= this.maxLength) {
            this.exportQueue();
        }
    }

    async exportQueue() {
        if (this.queue.length === 0) return;
        try {
            const currentQueue = this.queue.slice(0, this.queue.length);
            this.queue = [];
            await this.db.collection(this.collectionName).insertMany(currentQueue);
            this.interval = 0;
            log("info", "[eve-process] Exported queue " + currentQueue.length);
        } catch (error) {
            log("error", "[eve-process] Failed to export queue: " + error);
        }
    }

    checkQueue() {
        if (this.queue.length === 0) return;
        if (this.queue.length >= this.maxLength || this.interval >= this.maxInterval) {
            this.exportQueue();
        }
        this.interval++;
    }

    stop() {
        clearInterval(this.timer);
    }
}

async function startListening() {
    log("info", "[eve-process] Connecting to MongoDB at " + config.FULL_MONGO_URL);

    const client = new mongodb.MongoClient(config.FULL_MONGO_URL);
    await client.connect();
    const db = client.db(dbName);
    log("info", "[eve-process] Connected to MongoDB");

    const eveQueue = new ExportEveQueue(db, "eve");

    process.on("message", (message: messageFromDB) => {
        if (typeof message.data == "string") {
            log("error", "[eve-process] Invalid data type: " + typeof message.data);
            return;
        }
        if (message.type === "eve-log") {
            eveQueue.enqueue(message.data);
        }
    });
}

startListening();
