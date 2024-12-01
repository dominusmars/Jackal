import { SuricataEveFilter, SuricataEveLog, SuricataEveSearch } from "lib";
import mongodb, { Filter, InsertOneResult, MongoClient } from "mongodb";
import suricata from "./suricataService";
import fs from "fs";
import readline from "readline";
import { log } from "./debug";
import sha256 from "sha256";

const MONGO_URL = process.env.MONGO_URI || "localhost:27017";
const MAX_LOGS = process.env.MAX_LOGS ? parseInt(process.env.MAX_LOGS) : false || 10000;
const isDev = process.env.NODE_ENV === "development";
class ExportEveQueue {
    queue: SuricataEveLog[];
    interval: number;
    maxLength: number;
    maxInterval: number;
    db: mongodb.Db;
    collectionName: string;
    constructor(db: mongodb.Db, collectionName: string) {
        this.queue = [];
        this.interval = 0;
        setInterval(() => {
            if (this.queue.length == 0) return;
            if (this.queue.length > this.maxLength || this.interval > this.maxInterval) {
                this.exportQueue();
            }
            this.interval++;
        }, 100);
        this.maxLength = 100;
        this.maxInterval = 10;
        this.db = db;
        this.collectionName = collectionName;
    }

    enqueue(log: SuricataEveLog) {
        this.queue.push(log);
    }

    async exportQueue() {
        await this.db.collection(this.collectionName).insertMany(this.queue);
    }
}

class DataBase {
    db: mongodb.Db;
    logCount: number;
    client: mongodb.MongoClient;
    ready: boolean;
    eveCollectionName: string;
    dbName: string;
    logProcessQueue: Promise<InsertOneResult<Document>>[];
    maxProcessQueue: number;
    constructor() {
        // cant decide if this should start with mongodb:// or not
        const full_url = "mongodb://" + MONGO_URL;
        log("info", "Connecting to MongoDB at " + full_url);
        this.eveCollectionName = "eve";
        this.dbName = isDev ? "jackal-dev" : "jackal";

        const client = new MongoClient(full_url, {});
        client.connect().then(() => {
            this.db = client.db(this.dbName);
            log("info", "Connected to MongoDB");
            // Might be a problem if there are too many logs, if this.updateLogs gets called too much it can cause a heap overflow
            suricata.on("eve-updated", (logs: string) => {
                this.addLogToDB(logs);
            });
            this.init();
            this.ready = true;
        });

        this.client = client;
        this.db = client.db(this.dbName);

        this.logCount = 0;
        this.ready = false;
        this.logProcessQueue = [];
        this.maxProcessQueue = 100;
    }
    // Initializes the database by checking the size of the log file and then processing it
    init() {
        let stat = fs.statSync(suricata.getEVELogPath());
        let fileSize = stat.size;
        if (fileSize > 50 * 1024 * 1024) {
            log("error", "Log file is too large, skipping processing");
            log("info", "Log file size: " + fileSize);
            log("info", "Please use exporter to export logs to database");
            return;
        }
        this.processLogsToDB();
    }
    // Waits for the database to be ready, Useful for testing
    awaitReady() {
        return new Promise<void>((resolve) => {
            const checkReady = () => {
                if (this.ready) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }

    // Processes logs from the eve.json file and adds them to the database
    // This function will not be called if the log file is too large
    processLogsToDB() {
        let stream = fs.createReadStream(suricata.getEVELogPath());
        let rl = readline.createInterface({
            input: stream,
            crlfDelay: Infinity,
        });

        let buffer: string[] = [];
        const BATCH_SIZE = 10000;

        rl.on("line", async (line) => {
            if (line.startsWith("{") && line.endsWith("}")) {
                buffer.push(line);
                if (buffer.length >= BATCH_SIZE) {
                    rl.pause();
                    await this.processBatch(buffer);
                    rl.resume();
                    buffer = [];
                }
            }
        });

        rl.on("close", () => {
            if (buffer.length > 0) {
                this.processBatch(buffer);
            }
            log("info", "Finished processing logs");
        });
    }

    private async processBatch(batch: string[]) {
        for (const line of batch) {
            this.logCount++;
            isDev && this.logCount % 1000 === 0 && log("info", "Processed " + this.logCount + " logs");
            await this.addLogToDB(line);
        }
    }
    // Adds a log to the database
    private async addLogToDB(newLog: string) {
        try {
            const logs = JSON.parse(newLog) as SuricataEveLog;
            const hash = sha256(newLog);
            // Check if the log already exists in the database, uses the hash of the json,
            // hash is made from the log inside suricata eve.json not the one in the database
            const existingLog = await this.db.collection(this.eveCollectionName).findOne({ hash: hash });
            if (existingLog) {
                return;
            }
            logs.hash = hash;
            logs.timestamp = new Date(logs.timestamp);
            logs.full_text = newLog;
            if (this.logProcessQueue.length > this.maxProcessQueue) {
                await Promise.all(this.logProcessQueue);
                this.logProcessQueue = [];
                log("info", "Processed " + this.logCount + " logs");
            }
            this.logProcessQueue.push(this.db.collection(this.eveCollectionName).insertOne(logs));
        } catch (error) {
            log("error", "Error parsing JSON line: " + error);
        }
    }
    getLatestLogs() {
        return this.db
            .collection(this.eveCollectionName)
            .find({}, { projection: { full_text: 0 } })
            .sort({ timestamp: -1 })
            .limit(MAX_LOGS)
            .toArray();
    }
    // returns the keys of logs in the database to make them easier to search through
    async getFilters() {
        const filter = {} as SuricataEveFilter;

        const aggregationPipeline = [
            {
                $group: {
                    _id: null,
                    eventType: { $addToSet: "$event_type" },
                    interface: { $addToSet: "$in_iface" },
                    sourceIp: { $addToSet: "$src_ip" },
                    destIp: { $addToSet: "$dest_ip" },
                    sourcePort: { $addToSet: "$src_port" },
                    destPort: { $addToSet: "$dest_port" },
                    protocol: { $addToSet: "$proto" },
                },
            },
            {
                $project: {
                    _id: 0,
                    eventType: 1,
                    interface: 1,
                    sourceIp: 1,
                    destIp: 1,
                    sourcePort: 1,
                    destPort: 1,
                    protocol: 1,
                },
            },
        ];

        const result = await this.db.collection<SuricataEveLog>(this.eveCollectionName).aggregate(aggregationPipeline).toArray();
        if (result.length > 0) {
            const data = result[0];
            filter.eventType = data.eventType;
            filter.interface = data.interface;
            filter.sourceIp = data.sourceIp;
            filter.destIp = data.destIp;
            filter.sourcePort = data.sourcePort;
            filter.destPort = data.destPort;
            filter.protocol = data.protocol;
        }
        return filter;
    }

    // Db search for logs based on filters
    async searchLogs(filters: SuricataEveSearch) {
        const query: Filter<SuricataEveLog> = {};
        if (filters.startTime || filters.endTime) {
            query.timestamp = {};
            if (filters.startTime) {
                query.timestamp.$gte = new Date(filters.startTime);
            }
            if (filters.endTime) {
                query.timestamp.$lte = new Date(filters.endTime);
            }
        }
        if (filters.sourceIp) {
            query.src_ip = filters.sourceIp;
        }
        if (filters.destIp) {
            query.dest_ip = filters.destIp;
        }
        if (filters.sourcePort) {
            query.src_port = parseInt(filters.sourcePort);
        }
        if (filters.destPort) {
            query.dest_port = parseInt(filters.destPort);
        }
        if (filters.protocol) {
            query.proto = filters.protocol;
        }
        if (filters.eventType) {
            query.event_type = filters.eventType;
        }
        if (filters.interface) {
            query.in_iface = filters.interface;
        }
        if (filters.search) {
            let regex = new RegExp(filters.search, "i");
            query.full_text = { $regex: regex };
        }
        if (filters.inverseSearch) {
            let regex = new RegExp(filters.inverseSearch, "i");
            query.full_text = { $not: { $regex: regex } };
        }

        return await this.db.collection<SuricataEveLog>(this.eveCollectionName).find(query).limit(MAX_LOGS).toArray();
    }
    close() {
        this.client.close();
    }
}

const db = new DataBase();

export default db;
