import { makeSuricataRuleString, parseSuricataRule } from "../src/utils/suricata";

describe("Suricata Utils", () => {
    it("should parse rule from string", () => {
        const rule = `alert http any any -> any any (msg:"CVE-2006-2842: Squirrelmail <=1.4.6 - Local File Inclusion"; content:"/src/redirect.php"; http_uri; content:"plugins[]="; nocase; http_uri; content:"../"; http_uri; classtype:web-application-attack; sid:22006001; rev:1;)`;
        const parsedRule = parseSuricataRule(rule);
        expect(parsedRule).toEqual({
            action: "alert",
            protocol: "http",
            source: "any",
            source_port: "any",
            direction: "->",
            destination: "any",
            destination_port: "any",
            options: {
                msg: '"CVE-2006-2842',
                content: '"../"',
                classtype: "web-application-attack",
                sid: "22006001",
                rev: "1",
            },
        });
    });
    it("should parse rule from Ip source and destination", () => {
        const rule = `alert http 10.100.100.2 any -> any any (msg:"CVE-2006-2842: Squirrelmail <=1.4.6 - Local File Inclusion"; content:"/src/redirect.php"; http_uri; content:"plugins[]="; nocase; http_uri; content:"../"; http_uri; classtype:web-application-attack; sid:22006001; rev:1;)`;
        const parsedRule = parseSuricataRule(rule);
        expect(parsedRule).toEqual({
            action: "alert",
            protocol: "http",
            source: "10.100.100.2",
            source_port: "any",
            direction: "->",
            destination: "any",
            destination_port: "any",
            options: {
                msg: '"CVE-2006-2842',
                content: '"../"',
                classtype: "web-application-attack",
                sid: "22006001",
                rev: "1",
            },
        });
    });
    it("should parse rule from port source and destination", () => {
        const rule = `alert http 10.100.100.2 53 -> any any (msg:"CVE-2006-2842: Squirrelmail <=1.4.6 - Local File Inclusion"; content:"/src/redirect.php"; http_uri; content:"plugins[]="; nocase; http_uri; content:"../"; http_uri; classtype:web-application-attack; sid:22006001; rev:1;)`;
        const parsedRule = parseSuricataRule(rule);
        expect(parsedRule).toEqual({
            action: "alert",
            protocol: "http",
            source: "10.100.100.2",
            source_port: "53",
            direction: "->",
            destination: "any",
            destination_port: "any",
            options: {
                msg: '"CVE-2006-2842',
                content: '"../"',
                classtype: "web-application-attack",
                sid: "22006001",
                rev: "1",
            },
        });
    });
    it("should return false if rule is invalid", () => {
        const rule = `alert http any any -> any any (msg:"CVE-2006-2842: Squirrelmail <=1.4.6 - Local File Inclusion"; content:"/src/redirect.php"; http_uri; content:"plugins[]="; nocase; http_uri; content:"../"; http_uri; classtype:web-application-attack; sid:22006001; rev:1;`;
        const parsedRule = parseSuricataRule(rule);
        expect(parsedRule).toBe(false);
    });
    it("should generate rule from suricataRule interface", () => {
        const rule = {
            action: "alert",
            protocol: "http",
            source: "any",
            source_port: "any",
            direction: "->",
            destination: "any",
            destination_port: "any",
            options: {
                msg: '"CVE-2006-2842"',
                content: '"../"',
                classtype: "web-application-attack",
                sid: "22006001",
                rev: "1",
            },
        };
        const ruleString = makeSuricataRuleString(rule);
        expect(ruleString).toEqual(
            `alert http any any -> any any (msg:"CVE-2006-2842";content:"../";classtype:web-application-attack;sid:22006001;rev:1)`
        );
    });
});
