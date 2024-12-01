import { SuricataRule } from "lib/suricata";

// Regex for parsing suricata rules, its beutiful isnt it
const ruleRegex =
    /^(alert|pass|drop|reject|rejectsrc|rejectdst|rejectboth)\s(\w+)\s(!*(?<!\[)(?:any|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+)(?![^ \[]*\])|!*(?:\[(?:!*(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+),)+\s*!*(?:(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*)|\$\w+|(?:\[(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3},)+\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]))](?![^ \[]*\])))\s(!*(?:(?<!\[)(?:any|\d{1,5}|(?:\$\w+))(?![^ \[]*\]))|(?:\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*)+(?:(?:!*(?:any|\d{1,5}|(?:\$\w+)))*|!*\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*(?:any|\d{1,5}|(?:\$\w+)))])]))\s(<-|->|<>)\s(!*(?<!\[)(?:any|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+)(?![^ \[]*\])|!*(?:\[(?:!*(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*|\$\w+),)+\s*!*(?:(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{1,3})*)|\$\w+|(?:\[(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3},)+\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]))](?![^ \[]*\])))\s(!*(?:(?<!\[)(?:any|\d{1,5}|(?:\$\w+))(?![^ \[]*\]))|(?:\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*)+(?:(?:!*(?:any|\d{1,5}|(?:\$\w+)))*|!*\[(?:(?:any|\d{1,5}|(?:\$\w+))(?::|,)\s*(?:any|\d{1,5}|(?:\$\w+)))])]))\s\((\w+(?:;|:\s*.+);)\)/;

// Parse a suricata rule string into a SuricataRule object
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

// Test if a string is a valid suricata rule
function testSuricataRule(rule: string) {
    return ruleRegex.test(rule);
}

// Make a suricata rule string from a SuricataRule object
function makeSuricataRuleString(rule: SuricataRule): string {
    let hasTag = false;
    // Add metadata tag if it is not already present
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

export { parseSuricataRule, makeSuricataRuleString, testSuricataRule };
