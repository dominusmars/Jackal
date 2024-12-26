import { ExtendedSuricataRule, SuricataRule } from "lib";
import { makeSuricataRuleString, parseSuricataRule, testSuricataRule } from "./Utils";
import { getId } from "../id";
import fs from "fs";
import { log } from "../debug";
import { SuricataService } from "./Service";
const fromJackal = /from jackal/;

abstract class SuricataRulesInterface {
    // convert the rule to a string
    abstract toString(): string;
    abstract isValid(): boolean;
    // add a rule to the suricata.rules file
    abstract addRule(): Promise<ExtendedSuricataRule>;
    // remove the rule from the suricata.rules file
    abstract removeRule(): Promise<void>;
    // get all the rules from the suricata.rules file
    static getRules(): Promise<ExtendedSuricataRule[]> {
        throw new Error("Method not implemented.");
    }
}

export class SuricataRuleClass implements SuricataRulesInterface {
    rule: SuricataRule;
    constructor(rule: SuricataRule) {
        this.rule = rule;
    }
    // checks if the rule is valid
    isValid(): boolean {
        return testSuricataRule(this.toString());
    }
    // convert the rule to a string
    toString(): string {
        return makeSuricataRuleString(this.rule);
    }
    // add a rule to the suricata.rules file
    async addRule(): Promise<ExtendedSuricataRule> {
        let strRule = makeSuricataRuleString(this.rule);
        // id made from the rule string
        let id = getId(strRule);

        fs.appendFileSync(SuricataService.getRulesPath(), strRule + "\n");
        log("info", `Rule Added: ${strRule}`);

        let ruleObj = parseSuricataRule(strRule);
        if (!ruleObj) {
            throw new Error("Error parsing rule");
        }
        let extendedRule = { full_text: strRule, id, ...ruleObj } as ExtendedSuricataRule;

        return extendedRule;
    }
    // remove the rule from the suricata.rules file
    async removeRule(): Promise<void> {
        let rulesStr = fs.readFileSync(SuricataService.getRulesPath(), "utf-8");
        let rules = rulesStr.split(/\r\n|\n/gm).filter((r) => r.trim() !== makeSuricataRuleString(this.rule));
        log("info", `Rule Removed: ${makeSuricataRuleString(this.rule)}`);
        fs.writeFileSync(SuricataService.getRulesPath(), rules.join("\n"));
    }
    // get all the rules from the suricata.rules file
    static async getRules(): Promise<ExtendedSuricataRule[]> {
        let rulesString = fs.readFileSync(SuricataService.getRulesPath(), "utf-8");
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
}
