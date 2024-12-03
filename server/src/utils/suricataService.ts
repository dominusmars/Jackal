import {
    SuricataConfig,
    SuricataInterface,
    ExtendedSuricataRule,
    SuricataRule,
    SuricataCaptureType,
    SuricataDPDKInterface,
    SuricataAFInterface,
    SuricataPcapInterface,
    SuricataXDPInterface,
    SuricataEveLog,
} from "lib";
import si from "systeminformation";
import fs from "fs";
import yaml from "yaml";
import { makeSuricataRuleString, parseSuricataRule } from "@utils/suricataUtils";
import { getId } from "./id";
import path from "path";
import { log } from "./debug";
import { EventEmitter } from "events";
import tail from "tail";

const fromJackal = /from jackal/;
const isDev = process.env.NODE_ENV === "development";
const SURICATA_CONFIG = process.env.SURICATA_CONFIG || "/etc/suricata/suricata.yaml";

class Suricata extends EventEmitter<{
    "eve-updated": string[]; // Already checked and trimmed
}> {
    serviceConfig: SuricataConfig;
    eveTail: tail.Tail | undefined;
    constructor() {
        super();
        this.serviceConfig = this.getSuricataConfig();
        log("info", "Suricata Service Initialized");
        log("info", `Suricata Config Path: ${this.getConfigPath()}`);
        log("info", `EVE Log Path: ${this.getEVELogPath()}`);
        log("info", `Stats Log Path: ${this.getStatsPath()}`);
        log("info", `Fast Log Path: ${this.getFastPath()}`);
        log("info", `Service Log Path: ${this.getServicePath()}`);
        log("info", `Rules Path: ${this.getRulesPath()}`);
        this.listenForEve();
    }

    // Eve Parse function, listens to the eve.json file and emits an event when a new log is seen
    private listenForEve() {
        log("info", "Listening for EVE Logs");
        const eveTail = new tail.Tail(this.getEVELogPath(), {});
        // On windows this seems to happen on a interval of 1 second
        eveTail.on("line", (line: string) => {
            const trimLine = line.trim();
            if (trimLine == "") return;
            // elementary json check, ps terrible way to match json format
            // should be fine because we're taking it from the eve.json file...
            if (!(trimLine.startsWith("{") && trimLine.endsWith("}"))) return;
            this.emit("eve-updated", trimLine);
        });
        this.eveTail = eveTail;
    }
    stopListeningForEve() {
        if (this.eveTail) {
            this.eveTail.unwatch();
        }
    }

    // Warning: there might be an attack vector here if path is not sanitized, the paths can be changed to any path on the system using the frontend which can leak files info using the frontend
    getConfigPath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/suricata.yaml") : SURICATA_CONFIG;
    }
    getEVELogPath(): string {
        const SURICATA_EVE = process.env.SURICATA_EVE || path.join(this.serviceConfig["default-log-dir"], "eve.json");
        return isDev ? path.join(process.cwd(), "./demoData/eve.json") : SURICATA_EVE;
    }
    getStatsPath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/stats.log") : path.join(this.serviceConfig["default-log-dir"], "stats.log");
    }
    getFastPath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/fast.log") : path.join(this.serviceConfig["default-log-dir"], "fast.log");
    }
    getServicePath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/suricata.log") : path.join(this.serviceConfig["default-log-dir"], "suricata.log");
    }
    getRulesPath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/suricata.rules") : path.join(this.serviceConfig["default-rule-path"], "suricata.rules");
    }

    // addes a rule to the suricata.rules file
    async addRule(rule: SuricataRule) {
        let strRule = makeSuricataRuleString(rule);
        // id maded from the rule string
        let id = getId(strRule);

        fs.appendFileSync(this.getRulesPath(), strRule + "\n");
        log("info", `Rule Added: ${strRule}`);
        return { full_text: strRule, id, ...parseSuricataRule(strRule) };
    }
    // removes a rule from the suricata.rules file using a regex match
    async removeRule(rule: SuricataRule) {
        let rulesStr = fs.readFileSync(this.getRulesPath(), "utf-8");
        let rules = rulesStr.split(/\r\n|\n/gm).filter((r) => r.trim() !== makeSuricataRuleString(rule));
        log("info", `Rule Removed: ${makeSuricataRuleString(rule)}`);
        fs.writeFileSync(this.getRulesPath(), rules.join("\n"));
    }
    // gets all the rules from the suricata.rules file
    async getRules(): Promise<ExtendedSuricataRule[]> {
        let rulesString = fs.readFileSync(this.getRulesPath(), "utf-8");
        let rules = rulesString.split(/\r\n|\n/gm);
        return rules
            .map((rule) => {
                if (!fromJackal.test(rule)) return null;
                let parsedRule = parseSuricataRule(rule);
                if (!parsedRule) return null;
                return {
                    full_text: rule,
                    id: getId(rule),
                    ...parsedRule,
                };
            })
            .filter((rule) => rule !== null);
    }
    async getServiceStats() {
        const serviceData = await si.services("suricata");
        return serviceData[0];
    }

    getSuricataConfig(): SuricataConfig {
        try {
            let configString = fs.readFileSync(this.getConfigPath(), "utf-8");
            let config = yaml.parse(configString);
            return config;
        } catch (error: any) {
            log("error", "Error reading Suricata Config", error);
            process.exit(1);
        }
    }
    /**
     * Gets the interfaces from the suricata config
     *
     *  Interfaces are filtered based on the SuricataCaptureType in Request. Do not call this function without validating the capture type corisponding to the interface
     */
    async getInterfaces(captureType: SuricataCaptureType): Promise<SuricataInterface[]> {
        let config = this.getSuricataConfig();
        if (captureType === "dpdk") return config[captureType]?.interfaces || [];
        return config[captureType] || [];
    }
    /**
     *  Updates the interface in the suricata config
     *
     *  Interfaces are filtered based on the SuricataCaptureType in Request. Do not call this function without validating the capture type corisponding to the interface
     */
    async updateInterface(networkInterface: SuricataInterface, captureType: SuricataCaptureType) {
        let config = this.getSuricataConfig();
        if (captureType === "dpdk") {
            if (!config[captureType].interfaces) return [networkInterface];
            config[captureType].interfaces = config[captureType].interfaces.map((iface) => {
                if (iface.interface === networkInterface.interface) {
                    return networkInterface as SuricataDPDKInterface;
                }
                return iface;
            });
        } else {
            if (!config[captureType]) return [networkInterface];
            config[captureType] = config[captureType].map((iface) => {
                if (iface.interface === networkInterface.interface) {
                    return networkInterface;
                }
                return iface;
            }) as SuricataAFInterface[] & SuricataXDPInterface[] & SuricataPcapInterface[];
        }

        this.writeSuricataConfig(config);
    }
    /**
     *  adds the interface from the suricata config
     *
     *  Interfaces are filtered based on the SuricataCaptureType in Request. Do not call this function without validating the capture type corisponding to the interface
     */
    async addInterface(networkInterface: SuricataInterface, captureType: SuricataCaptureType) {
        let config = this.getSuricataConfig();
        if (captureType === "dpdk") {
            // TO DO when adding a DPPK interface, we need to add other configs to the other process
            if (!config[captureType].interfaces) config[captureType].interfaces = [];
            config[captureType].interfaces.push(networkInterface as SuricataDPDKInterface);
        } else {
            if (!config[captureType]) config[captureType] = [networkInterface as SuricataAFInterface & SuricataXDPInterface & SuricataPcapInterface];
            config[captureType].push(networkInterface as SuricataAFInterface & SuricataXDPInterface & SuricataPcapInterface);
        }
        this.writeSuricataConfig(config);
    }
    /**
     *  remove the interface from the suricata config
     *
     *  Interfaces are filtered based on the SuricataCaptureType in Request. Do not call this function without validating the capture type corresponding to the interface
     */
    async removeInterface(networkInterface: SuricataInterface, captureType: SuricataCaptureType) {
        let config = this.getSuricataConfig();
        if (captureType === "dpdk") {
            if (!config[captureType].interfaces) return;
            config[captureType].interfaces = config[captureType].interfaces.filter((iface) => iface.interface !== networkInterface.interface);
        } else {
            if (!config[captureType]) return;
            config[captureType] = config[captureType].filter((iface) => iface.interface !== networkInterface.interface) as SuricataAFInterface[] &
                SuricataXDPInterface[] &
                SuricataPcapInterface[];
        }

        this.writeSuricataConfig(config);
    }

    async writeSuricataConfig(config: SuricataConfig) {
        this.serviceConfig = config;
        fs.writeFileSync(this.getConfigPath(), yaml.stringify(this.serviceConfig));
        log("info", "Suricata Config Updated");
    }
}

const suricata = new Suricata();

export default suricata;
