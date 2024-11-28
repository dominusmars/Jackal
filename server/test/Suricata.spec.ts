process.env.NODE_ENV = "development";
import suricata from "../src/utils/suricataService";
import fs from "fs";
import { SuricataRule } from "lib";

describe("Suricata", () => {
    it("should add a rule", async () => {
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
        await suricata.addRule(rule);

        let rules = fs.readFileSync(suricata.getRulesPath(), "utf-8");
        expect(rules).toContain(
            `alert http any any -> any any (msg:"CVE-2006-2842; content:"../"; classtype:web-application-attack; sid:22006001; rev:1; metadata: from jackal;)`
        );
    });
    it("should remove a rule", async () => {
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
        await suricata.removeRule(rule);
        let rules = fs.readFileSync(suricata.getRulesPath(), "utf-8");
        expect(rules).not.toContain(
            `alert http any any -> any any (msg:"CVE-2006-2842; content:"../"; classtype:web-application-attack; sid:22006001; rev:1; metadata: from jackal;)`
        );
    });
    it("should get rules", async () => {
        let rules = await suricata.getRules();
        expect(rules).not.toBeNull();
    });
    it("should get service stats", async () => {
        let stats = await suricata.getServiceStats();
        expect(stats).not.toBeNull();
    });
    it("should get suricata config", async () => {
        let config = await suricata.getSuricataConfig();
        expect(config).not.toBeNull();
    });
    it("should get interfaces", async () => {
        let interfaces = await suricata.getInterfaces("af-packet");
        expect(interfaces).not.toBeNull();
    });
    it("should add an interface", async () => {
        let networkInterface = {
            interface: "eth0",
            threads: 1,
            cluster_type: "cluster_flow",
        };
        await suricata.addInterface(networkInterface, "af-packet");

        let interfaces = await suricata.getInterfaces("af-packet");
        expect(interfaces).toStrictEqual([{ interface: "default" }, { cluster_type: "cluster_flow", interface: "eth0", threads: 1 }]);
    });
    it("should remove an interface", async () => {
        let networkInterface = {
            interface: "eth0",
            threads: 1,
            cluster_type: "cluster_flow",
        };
        await suricata.removeInterface(networkInterface, "af-packet");

        let interfaces = await suricata.getInterfaces("af-packet");
        expect(interfaces).toStrictEqual([{ interface: "default" }]);
    });
    it("should write suricata config", async () => {
        let config = await suricata.getSuricataConfig();
        await suricata.writeSuricataConfig(config);
    });
});
