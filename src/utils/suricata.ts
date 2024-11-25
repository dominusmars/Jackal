const isDev = process.env.NODE_ENV === "development";
function getEVELogPath(): string {
    return isDev ? "eve.json" : "/var/log/suricata/eve.json";
}
export { getEVELogPath };
