type JackalConfig = {
    MONGO_URI: string;
    FULL_MONGO_URL: string;
    SURICATA_CONFIG: string;
    IS_DEV: boolean;
    MAX_LOGS: number;
};
// Gives back full mongodb uri
function parseMongo() {
    if (process.env.MONGO_URI?.startsWith("mongodb://")) {
        return process.env.MONGO_URI;
    } else return "mongodb://" + (process.env.MONGO_URI || "localhost:27017");
}

const config: JackalConfig = {
    MONGO_URI: process.env.MONGO_URI || "localhost:27017",
    FULL_MONGO_URL: parseMongo(),
    SURICATA_CONFIG: process.env.SURICATA_CONFIG || "/etc/suricata/suricata.yaml",
    IS_DEV: process.env.NODE_ENV === "development",
    MAX_LOGS: process.env.MAX_LOGS ? parseInt(process.env.MAX_LOGS) : false || 10000,
};

export default config;
