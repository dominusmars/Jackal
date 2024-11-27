const isDev = process.env.NODE_ENV === "development";
import { SuricataRule } from "../../types/suricata";
import path from "path";

function getRulesPath(): string {
    return isDev ? path.join(process.cwd(), "./demoData/suricata.rules") : "/var/lib/suricata/rules/suricata.rules";
}

const ruleRegex =
    /^(alert|pass|drop|reject|rejectsrc|rejectdst|rejectboth)\s(\w+)\s(!*(?<!\[)(?:any|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+)(?![^ \[]*\])|!*(?:\[(?:!*(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+),)+\s*!*(?:(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*)|\$\w+|(?:\[(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3},)+\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]))](?![^ \[]*\])))\s(!*(?:(?<!\[)(?:any|\d{1,5}|(?:\$\w+))(?![^ \[]*\]))|(?:\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*)+(?:(?:!*(?:any|\d{1,5}|(?:\$\w+)))*|!*\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*(?:any|\d{1,5}|(?:\$\w+)))])]))\s(<-|->|<>)\s(!*(?<!\[)(?:any|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+)(?![^ \[]*\])|!*(?:\[(?:!*(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+),)+\s*!*(?:(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*)|\$\w+|(?:\[(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3},)+\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]))](?![^ \[]*\])))\s(!*(?:(?<!\[)(?:any|\d{1,5}|(?:\$\w+))(?![^ \[]*\]))|(?:\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*)+(?:(?:!*(?:any|\d{1,5}|(?:\$\w+)))*|!*\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*(?:any|\d{1,5}|(?:\$\w+)))])]))\s\((\w+(?:;|:\s*.+);)\)/;

function parseSuricataRule(rule: string): SuricataRule | false {
    try {
        const ruleParts = rule.match(ruleRegex);
        if (!ruleParts) return false;
        const [_, action, protocol, source, source_port, direction, destination, destination_port, options] = ruleParts;
        const optionsDict: { [key: string]: string | true } = {};
        options.split(";").forEach((option) => {
            const [key, value] = option.split(":", 2);
            if (key && value) {
                optionsDict[key.trim()] = value.trim();
            }
            if (key && !value) {
                optionsDict[key.trim()] = true;
            }
        });

        const suricataRule: SuricataRule = {
            action: action as "alert" | "pass" | "drop" | "reject" | "rejectsrc" | "rejectdst" | "rejectboth",
            protocol,
            source,
            source_port,
            direction,
            destination,
            destination_port,
            options: optionsDict,
        };
        return suricataRule;
    } catch (error) {
        return false;
    }
}
function testSuricataRule(rule: string) {
    return ruleRegex.test(rule);
}

function makeSuricataRuleString(rule: SuricataRule): string {
    let hasTag = false;
    let metadata = "metadata: from jackal";
    if (Object.entries(rule.options).length === 0) {
        return `${rule.action} ${rule.protocol} ${rule.source} ${rule.source_port} ${rule.direction} ${rule.destination} ${rule.destination_port} (${metadata};)`;
    }
    const options = Object.entries(rule.options)
        .map(([key, value]) => {
            if (key === "metadata" && value.toString().includes("from jackal")) {
                hasTag = true;
                return metadata;
            }
            if (value === true) return `${key}`;
            return `${key}:${value}`;
        })
        .join("; ");
    if (hasTag) {
        return `${rule.action} ${rule.protocol} ${rule.source} ${rule.source_port} ${rule.direction} ${rule.destination} ${rule.destination_port} (${options};)`;
    }
    return `${rule.action} ${rule.protocol} ${rule.source} ${rule.source_port} ${rule.direction} ${rule.destination} ${rule.destination_port} (${options}; ${metadata};)`;
}

export { parseSuricataRule, makeSuricataRuleString, testSuricataRule, getRulesPath };
