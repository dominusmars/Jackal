import { SuricataEveFilter, SuricataEveLog, SuricataEveSearch } from "lib";
import mongodb, { Filter, InsertOneResult, MongoClient } from "mongodb";
import fs from "fs";
import readline from "readline";
import { log } from "./debug";
import sha256 from "sha256";
import { ChildProcess, fork, ProcessEnvOptions } from "child_process";
import config from "./jackalConfig";
import { suricata, SuricataService } from "./suricata/Service";

class DataBase {
    db: mongodb.Db;
    logCount: number;
    client: mongodb.MongoClient;
    ready: boolean;
    eveCollectionName: string;
    dbName: string;
    logChild!: ChildProcess;

    constructor() {
        log("info", "Connecting to MongoDB at " + config.FULL_MONGO_URL);
        this.eveCollectionName = "eve";
        this.dbName = config.IS_DEV ? "jackal-dev" : "jackal";

        const client = new MongoClient(config.FULL_MONGO_URL, {});

        client
            .connect()
            .then(() => {
                log("info", "Connected to MongoDB");
                // Might be a problem if there are too many logs, if this.updateLogs gets called too much it can cause a heap overflow
                suricata.on("eve-updated", async (logs: string) => {
                    await this.addLogToDB(logs);
                });

                this.init();
                this.ready = true;
            })
            .catch((error) => {
                // Mongodb handles reconnecting, so we don't need to do anything here
                log("error", "MongoDB error: " + error);
            });
        client.on("error", (error) => {
            // MongoDb handles reconnecting, so we don't need to do anything here
            log("error", "MongoDB error: " + error);
        });
        client.on("timeout", () => {
            log("error", "MongoDB timeout");
        });
        // Child process for queueing logs to the database, This allows for batch processing on a different thread
        this.client = client;
        this.db = client.db(this.dbName);
        this.logCount = 0;
        this.ready = false;
        this.spawnEveChild();
    }
    private getEveQueueProcess() {
        let files = fs.readdirSync(__dirname);
        let eveQueueName = "eveQueue";
        let eveQueueJS = eveQueueName + ".js";

        if (files.includes(eveQueueJS)) {
            return __dirname + "/" + eveQueueName;
        } else {
            // running in typescript doesn't work of jest tests
            return __dirname + "../../../dist/utils/" + eveQueueJS;
        }
    }
    spawnEveChild() {
        this.logChild = fork(this.getEveQueueProcess(), {
            stdio: ["inherit", "inherit", "inherit", "ipc"],
            env: process.env,
        });
        this.logChild.on("error", (error: Error) => {
            log("error", "Error in child process: " + error);
        });
        this.logChild.on("exit", (code) => {
            if (code !== 0) log("error", "Child process exited with code: " + code);
        });
    }
    // Initializes the database by checking the size of the log file and then processing it
    init() {
        // Speeds up the db search by creating indexes
        this.db.collection(this.eveCollectionName).createIndex({ hash: 1 }, { unique: false });
        this.db.collection(this.eveCollectionName).createIndex({ timestamp: -1 }, { unique: false });
        this.db.collection(this.eveCollectionName).createIndex({ in_iface: 1, timestamp: -1 }, { unique: false });
        this.db.collection(this.eveCollectionName).createIndex({ proto: 1, timestamp: -1 }, { unique: false });
        this.db.collection(this.eveCollectionName).createIndex({ event_type: 1, timestamp: -1 }, { unique: false });

        let stat = fs.statSync(SuricataService.getEVELogPath());
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
    // Used for initialization of the database
    // This function will not be called if the log file is too large
    processLogsToDB() {
        let stream = fs.createReadStream(SuricataService.getEVELogPath());
        let rl = readline.createInterface({
            input: stream,
            crlfDelay: Infinity,
        });
        rl.on("line", async (line) => {
            if (line.startsWith("{") && line.endsWith("}")) {
                await this.addLogToDB(line);
            }
        });
        rl.on("close", () => {
            log("info", "Finished processing logs");
        });
    }
    // Adds a log to the database
    private async addLogToDB(newLog: string) {
        try {
            const logs = JSON.parse(newLog) as SuricataEveLog;
            const hash = sha256(newLog);
            logs.hash = hash;

            logs.timestamp = new Date(logs.timestamp);
            logs.full_text = newLog;

            this.logChild.send({ type: "eve-log", data: logs });
        } catch (error) {
            log("error", "Error parsing JSON line: " + error);
        }
    }
    // Returns the latest logs from the database
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
            filter.eventTypes = data.eventType;
            filter.interfaces = data.interface;
            filter.sourceIps = data.sourceIp;
            filter.destIps = data.destIp;
            filter.sourcePorts = data.sourcePort;
            filter.destPorts = data.destPort;
            filter.protocols = data.protocol;
        }
        return filter;
    }
    // Tagged will be default on first insert, but can be updated later
    // Tagged will be based on the flow_id of the log, this includes all logs in the same flow based on how suricata logs are structured
    async updateTag(flowId: number, tag: string = "default") {
        return await this.db.collection<SuricataEveLog>(this.eveCollectionName).updateMany({ flow_id: flowId }, { $set: { tag: tag } });
    }
    // returns all logs that have a tag
    async getTaggedLogs() {
        return await this.db
            .collection<SuricataEveLog>(this.eveCollectionName)
            .find({ tag: { $exists: true } })
            .toArray();
    }
    // Unset tag for logs based on flow_id
    // doesn't matter how many times this is called, it will only unset the tag if it exists
    async unsetTag(flowId: number) {
        return await this.db.collection<SuricataEveLog>(this.eveCollectionName).updateMany({ flow_id: flowId }, { $unset: { tag: 1 } });
    }
    private buildLogSearchQuery(filters: SuricataEveSearch) {
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
        return query;
    }

    // Db search for logs based on filters
    async searchLogs(filters: SuricataEveSearch) {
        let query = this.buildLogSearchQuery(filters);
        return await this.db
            .collection<SuricataEveLog>(this.eveCollectionName)
            .find(query, { projection: { full_text: 0 } })
            .limit(config.MAX_LOGS)
            .sort({ timestamp: -1 })
            .toArray();
    }
    close() {
        this.client.close();
        this.logChild.send("exit");
    }
}

const db = new DataBase();

export default db;
