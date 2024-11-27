import { SuricataConfig, SuricataInterface, ExtendedSuricataRule, SuricataRule } from "../../types/suricata";
import os from "os";
import si, { Systeminformation } from "systeminformation";
import fs from "fs";
import yaml from "yaml";
import { makeSuricataRuleString, parseSuricataRule } from "./suricataUtils";
import { getId } from "./id";

const fromJackal = /from jackal/;
const isDev = process.env.NODE_ENV === "development";
import path from "path";
class Suricata {
    serviceConfig: SuricataConfig;
    constructor() {
        this.serviceConfig = this.getSuricataConfig();
    }
    getConfigPath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/suricata.yaml") : "/etc/suricata/suricata.yaml";
    }
    getEVELogPath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/eve.json") : path.join(this.serviceConfig["default-log-dir"], "eve.json");
    }
    getStatsPath(): string {
        return isDev ? path.join(process.cwd(), "./demoData/stats.log") : path.join(this.serviceConfig["default-log-dir"], "stats.log");
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
        return { full_text: strRule, id, ...parseSuricataRule(strRule) };
    }
    async removeRule(rule: SuricataRule) {
        let rulesStr = fs.readFileSync(this.getRulesPath(), "utf-8");
        let rules = rulesStr.split(/\r\n|\n/gm).filter((r) => r.trim() !== makeSuricataRuleString(rule));
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
    async getInterfaces(): Promise<SuricataInterface[]> {
        let config = this.getSuricataConfig();
        return config["af-packet"];
    }
    async addInterface(networkInterface: SuricataInterface) {
        let config = this.getSuricataConfig();
        config["af-packet"].push(networkInterface);
        console.log(config);
        this.writeSuricataConfig(config);
    }
    async removeInterface(networkInterface: SuricataInterface) {
        let config = this.getSuricataConfig();
        config["af-packet"] = config["af-packet"].filter((iface) => iface.interface !== networkInterface.interface);
        this.writeSuricataConfig(config);
    }

    async writeSuricataConfig(config: SuricataConfig) {
        this.serviceConfig = config;
        fs.writeFileSync(this.getConfigPath(), yaml.stringify(this.serviceConfig));
    }
}

const suricata = new Suricata();

export default suricata;
