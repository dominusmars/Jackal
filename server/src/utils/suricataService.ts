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
} from "lib";
import si from "systeminformation";
import fs from "fs";
import yaml from "yaml";
import { makeSuricataRuleString, parseSuricataRule } from "@utils/suricataUtils";
import { getId } from "./id";

const fromJackal = /from jackal/;
const isDev = process.env.NODE_ENV === "development";
const SURICATA_CONFIG = process.env.SURICATA_CONFIG || "/etc/suricata/suricata.yaml";
import path from "path";
import { log } from "./debug";
class Suricata {
    serviceConfig: SuricataConfig;
    constructor() {
        this.serviceConfig = this.getSuricataConfig();
        log("info", "Suricata Service Initialized");
        log("info", `Suricata Config Path: ${this.getConfigPath()}`);
        log("info", `EVE Log Path: ${this.getEVELogPath()}`);
        log("info", `Stats Log Path: ${this.getStatsPath()}`);
        log("info", `Fast Log Path: ${this.getFastPath()}`);
        log("info", `Service Log Path: ${this.getServicePath()}`);
        log("info", `Rules Path: ${this.getRulesPath()}`);
    }

    // Warning: there might be an attack vector here if path is not sanitized, the paths can be changed to any path on the system using the frontend which can leak files info using the frontend
    getConfigPath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/suricata.yaml") : SURICATA_CONFIG;
    }
    getEVELogPath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/eve.json") : path.join(this.serviceConfig["default-log-dir"], "eve.json");
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

    async addRule(rule: SuricataRule) {
        let strRule = makeSuricataRuleString(rule);
        let id = getId(strRule);
        fs.appendFileSync(this.getRulesPath(), strRule + "\n");
        log("info", `Rule Added: ${strRule}`);
        return { full_text: strRule, id, ...parseSuricataRule(strRule) };
    }
    async removeRule(rule: SuricataRule) {
        let rulesStr = fs.readFileSync(this.getRulesPath(), "utf-8");
        let rules = rulesStr.split(/\r\n|\n/gm).filter((r) => r.trim() !== makeSuricataRuleString(rule));
        log("info", `Rule Removed: ${makeSuricataRuleString(rule)}`);
        fs.writeFileSync(this.getRulesPath(), rules.join("\n"));
    }
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
        let configString = fs.readFileSync(this.getConfigPath(), "utf-8");
        let config = yaml.parse(configString);
        return config;
    }
    async getInterfaces(captureType: SuricataCaptureType): Promise<SuricataInterface[]> {
        let config = this.getSuricataConfig();
        if (captureType === "dpdk") return config[captureType].interfaces;
        return config[captureType];
    }
    /**
     *  Updates the interface in the suricata config
     *
     *  Interfaces are filtered based on the SuricataCaptureType in Request. Do not call this function without validating the capture type corisponding to the interface
     */
    async updateInterface(networkInterface: SuricataInterface, captureType: SuricataCaptureType) {
        let config = this.getSuricataConfig();
        if (captureType === "dpdk") {
            config[captureType].interfaces = config[captureType].interfaces.map((iface) => {
                if (iface.interface === networkInterface.interface) {
                    return networkInterface as SuricataDPDKInterface;
                }
                return iface;
            });
        } else
            config[captureType] = config[captureType].map((iface) => {
                if (iface.interface === networkInterface.interface) {
                    return networkInterface;
                }
                return iface;
            }) as SuricataAFInterface[] & SuricataXDPInterface[] & SuricataPcapInterface[];
        this.writeSuricataConfig(config);
    }
    async addInterface(networkInterface: SuricataInterface, captureType: SuricataCaptureType) {
        let config = this.getSuricataConfig();
        if (captureType === "dpdk") {
            config[captureType].interfaces.push(networkInterface as SuricataDPDKInterface);
        } else config[captureType].push(networkInterface as any);
        this.writeSuricataConfig(config);
    }
    async removeInterface(networkInterface: SuricataInterface, captureType: SuricataCaptureType) {
        let config = this.getSuricataConfig();
        if (captureType === "dpdk")
            config[captureType].interfaces = config[captureType].interfaces.filter((iface) => iface.interface !== networkInterface.interface);
        else
            config[captureType] = config[captureType].filter((iface) => iface.interface !== networkInterface.interface) as SuricataAFInterface[] &
                SuricataXDPInterface[] &
                SuricataPcapInterface[];
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
