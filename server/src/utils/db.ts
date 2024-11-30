import { SuricataEveFilter, SuricataEveLog, SuricataEveSearch } from "lib";
import mongodb, { Filter, MongoClient } from "mongodb";
import suricata from "./suricataService";
import fs from "fs";
import readline from "readline";
import { log } from "./debug";
import sha256 from "sha256";

const MONGO_URL = process.env.MONGO_URI || "localhost:27017";
const MAX_LOGS = process.env.MAX_LOGS ? parseInt(process.env.MAX_LOGS) : false || 10000;
const isDev = process.env.NODE_ENV === "development";
class DataBase {
    db: mongodb.Db;
    logCount: number;
    client: mongodb.MongoClient;
    ready: boolean;
    eveCollectionName: string;
    dbName: string;
    constructor() {
        const full_url = "mongodb://" + MONGO_URL;
        log("info", "Connecting to MongoDB at " + full_url);
        this.eveCollectionName = "eve";
        this.dbName = "jackal";
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
    }

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
    private async addLogToDB(newLog: string) {
        try {
            const logs = JSON.parse(newLog) as SuricataEveLog;
            const hash = sha256(newLog);
            const existingLog = await this.db.collection(this.eveCollectionName).findOne({ hash: hash });
            if (existingLog) {
                return;
            }
            logs.hash = hash;
            logs.timestamp = new Date(logs.timestamp);
            logs.full_text = newLog;
            this.db.collection(this.eveCollectionName).insertOne(logs);
            log("info", "New log added to database");
        } catch (error) {
            log("error", "Error parsing JSON line: " + error);
        }
    }
    getLatestLogs() {
        return this.db.collection(this.eveCollectionName).find().sort({ timestamp: -1 }).limit(MAX_LOGS).toArray();
    }

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

    async searchLogs(filters: SuricataEveSearch) {
        const query: Filter<SuricataEveLog> = {};
        if (filters.startTime && filters.endTime) {
            query.timestamp = {
                $gte: new Date(filters.startTime),
                $lte: new Date(filters.endTime),
            };
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
