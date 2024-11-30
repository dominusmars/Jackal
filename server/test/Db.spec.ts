process.env.NODE_ENV = "development";
process.env.MONGO_URI = "192.168.1.14:27017";
import { SuricataEveFilter, SuricataEveSearch } from "lib";
import db from "../src/utils/db";
import suricata from "../src/utils/suricataService";

describe("Db", () => {
    beforeAll(async () => {
        await db.awaitReady();
    });

    it("should get latest logs", async () => {
        let logs = await db.getLatestLogs();
        expect(logs).not.toBeNull();
        expect(logs.length).toBeGreaterThan(0);
    });

    it("should get filters from db", async () => {
        let filters = await db.getFilters();
        expect(filters).not.toBeNull();
    });
    it("should be able to search logs", async () => {
        const query: SuricataEveSearch = {
            eventType: "dns",
            interface: "em0",
            sourceIp: "24.45.110.232",
            sourcePort: "44167",
            destIp: "192.55.83.30",
            destPort: "53",
            protocol: "UDP",
        };
        let logs = await db.searchLogs(query);
        expect(logs).not.toBeNull();
        expect(logs.length).toBeGreaterThan(0);
    });
    it("should be able to search logs port", async () => {
        const query: SuricataEveSearch = {
            sourcePort: "44167",
            destPort: "53",
        };
        let logs = await db.searchLogs(query);
        expect(logs).not.toBeNull();
        expect(logs.length).toBeGreaterThan(0);
    });
    it("should be able to search logs by search string", async () => {
        const query: SuricataEveSearch = {
            search: "wire",
        };
        let logs = await db.searchLogs(query);
        expect(logs).not.toBeNull();
        expect(logs.length).toBeGreaterThan(0);
    });
    it("shouldnt be able to execute a bad search", async () => {
        try {
            const query: SuricataEveSearch = {
                search: "');console.log('bad",
            };
            let logs = await db.searchLogs(query);
            expect(logs).toBeNull();
        } catch (error) {
            expect(error).not.toBeNull();
        }
    });

    afterAll(() => {
        db.close();
        suricata.stopListeningForEve();
    });
});
