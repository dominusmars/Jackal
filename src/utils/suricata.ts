const isDev = process.env.NODE_ENV === "development";
import { SuricataRule } from "../../types/SuricataRule";
import path from "path";
function getEVELogPath(): string {
    return isDev ? "eve.json" : "/var/log/suricata/eve.json";
}
function getStatsPath(): string {
    return isDev ? path.join(process.cwd(), "./stats.log") : "/var/log/suricata/stats.log";
}
function getServicePath(): string {
    return isDev ? path.join(process.cwd(), "./suricata.log") : "/var/log/suricata/suricata.log";
}

const source =
    /(!*(?<!\[)(?:any|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+)(?![^ \[]*\])|!*(\[(?:!*(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+),)+\s*!*(?:(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*)|\$\w+|(?:\[(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3},)+\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]))](?![^ \[]*\])))/;

const port =
    /(!*(?:(?<!\[)(?:any|\d{1,5}|(?:\$\w+))(?![^ \[]*\]))|(?:\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*)+(?:(?:!*(?:any|\d{1,5}|(?:\$\w+)))*|!*\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*(?:any|\d{1,5}|(?:\$\w+)))])]))/;

function parseSuricataRule(rule: string): SuricataRule | false {
    const ruleParts = rule.match(
        /^(alert|pass|drop|reject|rejectsrc|rejectdst|rejectboth)\s(\w*)\s(any|(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|(?:\$\w+))\s(any|(?:\d+)|(?:\$\w))\s(<-|->)\s(any|(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}))\s(any|(?:\d+)|(?:\$\w))\s\((\w*:.*;)+\)/
    );
    if (!ruleParts) return false;
    const [_, action, protocol, source, source_port, direction, destination, destination_port, options] = ruleParts;
    const optionsDict: { [key: string]: string } = {};
    options.split(";").forEach((option) => {
        const [key, value] = option.split(":", 2);
        if (key && value) {
            optionsDict[key.trim()] = value.trim();
        }
    });
    const suricataRule = { action, protocol, source, source_port, direction, destination, destination_port, options: optionsDict };
    return suricataRule;
}
function makeSuricataRuleString(rule: SuricataRule): string {
    const options = Object.entries(rule.options)
        .map(([key, value]) => `${key}:${value}`)
        .join(";");
    return `${rule.action} ${rule.protocol} ${rule.source} ${rule.source_port} ${rule.direction} ${rule.destination} ${rule.destination_port} (${options})`;
}

export { getEVELogPath, getServicePath, getStatsPath, parseSuricataRule, makeSuricataRuleString };
