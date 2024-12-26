process.env.NODE_ENV = "development";
import { SuricataRule } from "lib";
import { SuricataRuleClass } from "../src/utils/suricata/Rules";
import fs from "fs";
import { suricata, SuricataService } from "../src/utils/suricata/Service";

describe("Suricata Rules", () => {
    it("should get rules", async () => {
        let rules = await SuricataRuleClass.getRules();
        expect(rules).toBeDefined();
    });

    it("should add rule", async () => {
        let rule: SuricataRule = {
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
        };
        let suricataRule = new SuricataRuleClass(rule);

        await suricataRule.addRule();

        let rules = fs.readFileSync(SuricataService.getRulesPath(), "utf-8");
        expect(rules).toContain(
            `alert http any any -> any any (msg:"CVE-2006-2842; content:"../"; classtype:web-application-attack; sid:22006001; rev:1; metadata: from jackal;)`
        );
    });
    it("should remove rule", async () => {
        let rule: SuricataRule = {
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
        };
        let suricataRule = new SuricataRuleClass(rule);

        await suricataRule.removeRule();
        let rules = fs.readFileSync(SuricataService.getRulesPath(), "utf-8");
        expect(rules).not.toContain(
            `alert http any any -> any any (msg:"CVE-2006-2842; content:"../"; classtype:web-application-attack; sid:22006001; rev:1; metadata: from jackal;)`
        );
    });
    afterAll(() => {
        suricata.stopListeningForEve();
    });
});
