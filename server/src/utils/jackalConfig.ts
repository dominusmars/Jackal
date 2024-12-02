type JackalConfig = {
    MONGO_URI: string;
    FULL_MONGO_URL: string;
    SURICATA_CONFIG: string;
    IS_DEV: boolean;
    MAX_LOGS: number;
};

const config: JackalConfig = {
    MONGO_URI: process.env.MONGO_URI || "localhost:27017",
    FULL_MONGO_URL: "mongodb://" + (process.env.MONGO_URI || "localhost:27017"),
    SURICATA_CONFIG: process.env.SURICATA_CONFIG || "/etc/suricata/suricata.yaml",
    IS_DEV: process.env.NODE_ENV === "development",
    MAX_LOGS: process.env.MAX_LOGS ? parseInt(process.env.MAX_LOGS) : false || 10000,
};

export default config;
