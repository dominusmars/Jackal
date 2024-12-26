type JackalConfig = {
    MONGO_URI: string;
    FULL_MONGO_URL: string;
    SURICATA_CONFIG: string;
    IS_DEV: boolean;
    MAX_LOGS: number;
    PORT: number;
    NETWORK_MONITOR: string;
    NETWORK_MONITOR_ACTIVE: boolean;
};
let portTest = /:((6[0-5]{2}[0-3][0-5])|(6[0-4][0-9]{3})|([1-5]?[0-9]{1,4}))$/;
// Gives back full mongodb uri
function parseMongoUri() {
    let defaultPort = "27017";
    let mongo_uri = process.env.MONGO_URI || "localhost";

    // if uri is already in the correct format
    if (mongo_uri.startsWith("mongodb://") && portTest.test(mongo_uri)) {
        return mongo_uri;
    }
    // add mongodb:// if not present
    if (!mongo_uri.startsWith("mongodb://")) {
        mongo_uri = "mongodb://" + mongo_uri;
    }
    if (!portTest.test(mongo_uri)) {
        mongo_uri += ":" + defaultPort;
    } else {
        // check if port is valid
        let targetPort = mongo_uri.split(":")[2];
        let targetPortInt = parseInt(targetPort);
        if (isNaN(targetPortInt) || targetPortInt < 1 || targetPortInt > 65535) {
            throw new Error("Invalid port number for DB");
        }
    }
    return mongo_uri;
}

const config: JackalConfig = {
    MONGO_URI: process.env.MONGO_URI || "localhost:27017",
    FULL_MONGO_URL: parseMongoUri(),
    SURICATA_CONFIG: process.env.SURICATA_CONFIG || "/etc/suricata/suricata.yaml",
    IS_DEV: process.env.NODE_ENV === "development",
    MAX_LOGS: parseInt(process.env.MAX_LOGS || "NaN") || 10000,
    PORT: parseInt(process.env.PORT || "NaN") || 3000,
    NETWORK_MONITOR: process.env.NETWORK_MONITOR || "http://localhost:5000",
    NETWORK_MONITOR_ACTIVE: !!process.env.NETWORK_MONITOR_ACTIVE || false,
};

export default config;
