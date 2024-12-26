process.env.NODE_ENV = "development";
import { suricata, SuricataService } from "../src/utils/suricata/Service";

describe("Suricata", () => {
    it("should get service stats", async () => {
        let stats = await suricata.getServiceStats();
        expect(stats).not.toBeNull();
    });
    it("should get suricata config", async () => {
        let config = await SuricataService.getSuricataConfig();
        expect(config).not.toBeNull();
    });

    it("should write suricata config", async () => {
        let config = SuricataService.getSuricataConfig();
        await SuricataService.writeSuricataConfig(config);
    });
});
