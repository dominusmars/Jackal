import { EventEmitter } from "events";
import { SuricataConfig, SuricataEveLog } from "lib";
import tail from "tail";
import { log } from "@utils/debug";
import fs from "fs";
import yaml from "yaml";
import config from "@utils/jackalConfig";
import NetworkMonitor from "@utils/networkMonitor";
import path from "path";
import si from "systeminformation";

const isDev = process.env.NODE_ENV === "development";
const SURICATA_CONFIG = process.env.SURICATA_CONFIG || "/etc/suricata/suricata.yaml";
const ACTIVE_MONITOR = config.NETWORK_MONITOR_ACTIVE;

export class SuricataService extends EventEmitter<{
    "eve-updated": string[]; // Already checked and trimmed
}> {
    static serviceConfig: SuricataConfig;
    eveTail: tail.Tail | undefined;
    static activeNetworkMonitor: boolean;
    constructor() {
        super();
        log("info", "Suricata Service Initialized");
        log("info", `Suricata Config Path: ${SuricataService.getConfigPath()}`);
        log("info", `EVE Log Path: ${SuricataService.getEVELogPath()}`);
        log("info", `Stats Log Path: ${SuricataService.getStatsPath()}`);
        log("info", `Fast Log Path: ${SuricataService.getFastPath()}`);
        log("info", `Service Log Path: ${SuricataService.getServicePath()}`);
        log("info", `Rules Path: ${SuricataService.getRulesPath()}`);
        this.listenForEve();
        SuricataService.activeNetworkMonitor = ACTIVE_MONITOR;
    }
    private static parseConfig(configString: string, options: yaml.ParseOptions): [SuricataConfig, Error | null] | [null, Error] {
        try {
            return [yaml.parse(configString, options), null];
        } catch (error) {
            return [null, error as Error];
        }
    }

    static getSuricataConfig(): SuricataConfig {
        try {
            let configString = fs.readFileSync(SuricataService.getConfigPath(), "utf-8");

            let [config, error] = this.parseConfig(configString, { prettyErrors: true });
            if (error) {
                log("warning", "Error while parsing Suricata Config, trying again", error.message);
                [config, error] = this.parseConfig(configString, { prettyErrors: true, uniqueKeys: false });
                if (error) {
                    log("error", "Error while parsing Suricata Config", error.message);
                    process.exit(1);
                }
            }
            if (!config) {
                log("error", "Error reading Suricata Config", "Config is null");
                process.exit(1);
            }
            this.serviceConfig = config;
            return config;
        } catch (error: any) {
            log("error", "Error reading Suricata Config", error);
            process.exit(1);
        }
    }
    stopNetworkMonitor() {
        SuricataService.activeNetworkMonitor = false;
    }
    startNetworkMonitor() {
        SuricataService.activeNetworkMonitor = true;
    }
    getNetworkMonitorStatus() {
        return SuricataService.activeNetworkMonitor;
    }

    stopListeningForEve() {
        if (this.eveTail) {
            this.eveTail.unwatch();
        }
    }
    private listenForEve() {
        log("info", "Listening for EVE Logs");
        const eveTail = new tail.Tail(SuricataService.getEVELogPath(), {
            follow: true,
            useWatchFile: process.platform == "win32",
        });
        // On windows this seems to happen on a interval of 1 second
        eveTail.on("line", async (line: string) => {
            const trimLine = line.trim();
            if (trimLine == "") return;

            // If the monitor is not active, we just emit the eve log
            if (!SuricataService.activeNetworkMonitor) {
                this.emit("eve-updated", trimLine);
                return;
            }

            // for now were just gonna json parse it and then stringify it again
            // Would rather have a faster way to do this
            try {
                let json = JSON.parse(trimLine) as SuricataEveLog;
                const analysis = await NetworkMonitor.analyze(json);
                json.anomaly = analysis.anomaly;
                this.emit("eve-updated", JSON.stringify(json));
            } catch (error) {
                return log("error", "Error parsing eve log");
            }
        });
        this.eveTail = eveTail;
        process.on("exit", () => {
            this.stopListeningForEve();
        });
    }
    static getConfigPath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/suricata.yaml") : SURICATA_CONFIG;
    }
    static getEVELogPath(): string {
        if (!this.serviceConfig) {
            this.getSuricataConfig();
        }
        const SURICATA_EVE = process.env.SURICATA_EVE || path.join(this.serviceConfig["default-log-dir"], "eve.json");
        return isDev ? path.join(process.cwd(), "./demoData/eve.json") : SURICATA_EVE;
    }
    static getStatsPath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/stats.log") : path.join(this.serviceConfig["default-log-dir"], "stats.log");
    }
    static getFastPath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/fast.log") : path.join(this.serviceConfig["default-log-dir"], "fast.log");
    }
    static getServicePath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/suricata.log") : path.join(this.serviceConfig["default-log-dir"], "suricata.log");
    }
    static getRulesPath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/suricata.rules") : path.join(this.serviceConfig["default-rule-path"], "suricata.rules");
    }
    static writeSuricataConfig(config: SuricataConfig) {
        this.serviceConfig = config;
        fs.writeFileSync(this.getConfigPath(), yaml.stringify(this.serviceConfig));
        log("info", "Suricata Config Updated");
    }
    async getServiceStats() {
        const serviceData = await si.services("suricata");
        return serviceData[0];
    }
}
export const suricata = new SuricataService();
