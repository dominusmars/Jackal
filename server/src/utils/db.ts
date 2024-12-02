import { SuricataEveFilter, SuricataEveLog, SuricataEveSearch } from "lib";
import mongodb, { Filter, InsertOneResult, MongoClient } from "mongodb";
import suricata from "./suricataService";
import fs from "fs";
import readline from "readline";
import { log } from "./debug";
import sha256 from "sha256";
import { ChildProcess, fork } from "child_process";
import config from "./jackalConfig";

class DataBase {
    db: mongodb.Db;
    logCount: number;
    client: mongodb.MongoClient;
    ready: boolean;
    eveCollectionName: string;
    dbName: string;
    logChild: ChildProcess;

    constructor() {
        // cant decide if this should start with mongodb:// or not
        log("info", "Connecting to MongoDB at " + config.FULL_MONGO_URL);
        this.eveCollectionName = "eve";
        this.dbName = config.IS_DEV ? "jackal-dev" : "jackal";

        const client = new MongoClient(config.FULL_MONGO_URL, {});
        client.connect().then(() => {
            log("info", "Connected to MongoDB");
            // Might be a problem if there are too many logs, if this.updateLogs gets called too much it can cause a heap overflow
            suricata.on("eve-updated", (logs: string) => {
                this.addLogToDB(logs);
            });

            this.init();
            this.ready = true;
        });

        // Child process for queueing logs to the database, This allows for batch processing on a different thread
        this.logChild = fork(__dirname + "/eveProcess", {
            stdio: ["inherit", "inherit", "inherit", "ipc"],
        });
        this.logChild.on("error", (error: Error) => {
            log("error", "Error in child process: " + error);
        });
        this.logChild.on("exit", (code) => {
            log("error", "Child process exited with code: " + code);
        });

        this.client = client;
        this.db = client.db(this.dbName);

        this.logCount = 0;
        this.ready = false;
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
            config.IS_DEV && this.logCount % 1000 === 0 && log("info", "Processed " + this.logCount + " logs");
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

            this.logChild.send({ type: "eve-log", data: logs });
        } catch (error) {
            log("error", "Error parsing JSON line: " + error);
        }
    }
    getLatestLogs() {
        return this.db
            .collection(this.eveCollectionName)
            .find({}, { projection: { full_text: 0 } })
            .sort({ timestamp: -1 })
            .limit(config.MAX_LOGS)
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

        return await this.db
            .collection<SuricataEveLog>(this.eveCollectionName)
            .find(query, { projection: { full_text: 0 } })
            .sort({ timestamp: -1 })
            .limit(config.MAX_LOGS)
            .toArray();
    }
    close() {
        this.client.close();
    }
}

const db = new DataBase();

export default db;
