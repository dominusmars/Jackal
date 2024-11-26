const isDev = process.env.NODE_ENV === "development";
import { SuricataRule } from "../../types/SuricataRule";
import path from "path";
function getEVELogPath(): string {
    return isDev ? "eve.json" : "/var/log/suricata/eve.json";
}
function getStatsPath(): string {
    return isDev
        ? path.join(process.cwd(), "./stats.log")
        : "/var/log/suricata/stats.log";
}
function getServicePath(): string {
    return isDev
        ? path.join(process.cwd(), "./suricata.log")
        : "/var/log/suricata/suricata.log";
}

function getCurrentSuricataRules(): SuricataRule[] {
    return [];
}

function parseSuricataRule(rule: string): SuricataRule | false {
    const ruleParts = rule.match(
        /^(alert|pass|drop|reject|rejectsrc|rejectdst|rejectboth)\s(\w*)\s(!*(?<!\[)(?:any|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+)(?![^ \[]*\])|!*(?:\[(?:!*(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+),)+\s*!*(?:(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*)|\$\w+|(?:\[(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3},)+\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]))](?![^ \[]*\])))\s(!*(?:(?<!\[)(?:any|\d{1,5}|(?:\$\w+))(?![^ \[]*\]))|(?:\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*)+(?:(?:!*(?:any|\d{1,5}|(?:\$\w+)))*|!*\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*(?:any|\d{1,5}|(?:\$\w+)))])]))\s(<-|->|<>)\s(!*(?<!\[)(?:any|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+)(?![^ \[]*\])|!*(?:\[(?:!*(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+),)+\s*!*(?:(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*)|\$\w+|(?:\[(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3},)+\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]))](?![^ \[]*\])))\s(!*(?:(?<!\[)(?:any|\d{1,5}|(?:\$\w+))(?![^ \[]*\]))|(?:\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*)+(?:(?:!*(?:any|\d{1,5}|(?:\$\w+)))*|!*\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*(?:any|\d{1,5}|(?:\$\w+)))])]))\s\((\w*:.*;*|\w+;.*)+\)/
    );
    if (!ruleParts) return false;
    const [
        _,
        action,
        protocol,
        source,
        source_port,
        direction,
        destination,
        destination_port,
        options,
    ] = ruleParts;
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
        action: action as
            | "alert"
            | "pass"
            | "drop"
            | "reject"
            | "rejectsrc"
            | "rejectdst"
            | "rejectboth",
        protocol,
        source,
        source_port,
        direction,
        destination,
        destination_port,
        options: optionsDict,
    };
    return suricataRule;
}
function testSuricataRule(rule: string) {
    const regex =
        /^(alert|pass|drop|reject|rejectsrc|rejectdst|rejectboth)\s(\w*)\s(!*(?<!\[)(?:any|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+)(?![^ \[]*\])|!*(?:\[(?:!*(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+),)+\s*!*(?:(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*)|\$\w+|(?:\[(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3},)+\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]))](?![^ \[]*\])))\s(!*(?:(?<!\[)(?:any|\d{1,5}|(?:\$\w+))(?![^ \[]*\]))|(?:\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*)+(?:(?:!*(?:any|\d{1,5}|(?:\$\w+)))*|!*\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*(?:any|\d{1,5}|(?:\$\w+)))])]))\s(<-|->|<>)\s(!*(?<!\[)(?:any|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+)(?![^ \[]*\])|!*(?:\[(?:!*(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+),)+\s*!*(?:(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*)|\$\w+|(?:\[(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3},)+\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]))](?![^ \[]*\])))\s(!*(?:(?<!\[)(?:any|\d{1,5}|(?:\$\w+))(?![^ \[]*\]))|(?:\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*)+(?:(?:!*(?:any|\d{1,5}|(?:\$\w+)))*|!*\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*(?:any|\d{1,5}|(?:\$\w+)))])]))\s\((\w*:.*;*|\w+;.*)+\)/;
    return regex.test(rule);
}

function makeSuricataRuleString(rule: SuricataRule): string {
    const options = Object.entries(rule.options)
        .map(([key, value]) => `${key}:${value}`)
        .join(";");
    return `${rule.action} ${rule.protocol} ${rule.source} ${rule.source_port} ${rule.direction} ${rule.destination} ${rule.destination_port} (${options})`;
}

export {
    getEVELogPath,
    getServicePath,
    getStatsPath,
    parseSuricataRule,
    makeSuricataRuleString,
    testSuricataRule,
};
