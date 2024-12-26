process.env.NODE_ENV = "development";

import { SuricataCaptureType } from "lib";
import { getInterface, getStaticInterfaceClass } from "../src/utils/suricata/NetInterfaces";
import { suricata } from "../src/utils/suricata/Service";

describe("Suricata Network Interface", () => {
    const captureTypes: SuricataCaptureType[] = ["af-packet", "pcap", "dpdk", "af-xdp"];
    afterAll(() => {
        suricata.stopListeningForEve();
    });
    captureTypes.forEach((type) => {
        describe(`Capture type: ${type}`, () => {
            it(`should get interfaces for ${type}`, async () => {
                let interfaces = await getStaticInterfaceClass(type).getInterfaces();
                expect(interfaces).not.toBeNull();
            });

            it(`should add an interface for ${type}`, async () => {
                let interfacesClass = getStaticInterfaceClass(type);

                let networkInterface = {
                    interface: "eth0",
                    threads: 1,
                    cluster_type: "cluster_flow",
                };
                await getInterface(type, networkInterface).add();

                let interfaces = await interfacesClass.getInterfaces();
                expect(interfaces).toStrictEqual([{ interface: "default" }, { cluster_type: "cluster_flow", interface: "eth0", threads: 1 }]);
            });

            it(`should remove an interface for ${type}`, async () => {
                let interfacesClass = getStaticInterfaceClass(type);

                let networkInterface = {
                    interface: "eth0",
                    threads: 1,
                    cluster_type: "cluster_flow",
                };
                await getInterface(type, networkInterface).remove();

                let interfaces = await interfacesClass.getInterfaces();
                expect(interfaces).toStrictEqual([{ interface: "default" }]);
            });
        });
    });
});
