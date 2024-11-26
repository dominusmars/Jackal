import { SuricataConfig, SuricataInterface, ExtendedSuricataRule, SuricataRule } from "../../types/suricata";
import os from "os";
import si, { Systeminformation } from "systeminformation";
import fs from "fs";
import yaml from "yaml";
import { getConfigPath, getRulesPath, makeSuricataRuleString, parseSuricataRule } from "./suricata";
import { getId } from "./id";

const fromJackal = /from jackal/;

class Suricata {
    constructor() {}
    async addRule(rule: SuricataRule) {
        let strRule = makeSuricataRuleString(rule);
        let id = getId(strRule);
        fs.appendFileSync(getRulesPath(), strRule + "\n");
        return { full_text: strRule, id, ...parseSuricataRule(strRule) };
    }
    async removeRule(rule: SuricataRule) {
        let rulesStr = fs.readFileSync(getRulesPath(), "utf-8");
        let rules = rulesStr.split(/\r\n|\n/gm).filter((r) => r.trim() !== makeSuricataRuleString(rule));
        fs.writeFileSync(getRulesPath(), rules.join("\n"));
    }
    async getRules(): Promise<ExtendedSuricataRule[]> {
        let rulesString = fs.readFileSync(getRulesPath(), "utf-8");
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
    async getSuricataConfig(): Promise<SuricataConfig> {
        let configString = fs.readFileSync(getConfigPath(), "utf-8");
        let config = yaml.parse(configString);
        return config;
    }
    async getInterfaces(): Promise<SuricataInterface[]> {
        let config = await this.getSuricataConfig();
        return config["af-packet"];
    }
    async addInterface(networkInterface: SuricataInterface) {
        let config = await this.getSuricataConfig();
        config["af-packet"].push(networkInterface);
        console.log(config);
        this.writeSuricataConfig(config);
    }
    async removeInterface(networkInterface: SuricataInterface) {
        let config = await this.getSuricataConfig();
        config["af-packet"] = config["af-packet"].filter((iface) => iface.interface !== networkInterface.interface);
        this.writeSuricataConfig(config);
    }

    async writeSuricataConfig(config: SuricataConfig) {
        fs.writeFileSync(getConfigPath(), yaml.stringify(config));
    }
}

export default Suricata;
