import { SuricataAFInterface, SuricataCaptureType, SuricataDPDKInterface, SuricataInterface, SuricataPcapInterface, SuricataXDPInterface } from "lib";
import { SuricataService } from "./Service";
import { get } from "lodash";
abstract class StaticSuricataNetworkInterface<T> {
    constructor(_interface: T) {}
    /**
     * Gets the interfaces from the suricata config
     *
     * @returns {T[]} the interfaces
     */
    static getInterfaces() {
        return [] as any[];
        throw new Error("Method not implemented.");
    }
}

abstract class SuricataNetworkInterface<T> implements StaticSuricataNetworkInterface<T> {
    /**
     *  Updates the interface in the suricata config
     */
    abstract update(): Promise<void>;
    /**
     *  remove the interface from the suricata config
     */
    abstract remove(): Promise<void>;

    /**
     *  adds the interface from the suricata config
     */
    abstract add(): Promise<void>;
}

class DPDKInterface implements SuricataNetworkInterface<SuricataDPDKInterface> {
    interface: SuricataDPDKInterface;
    constructor(_interface: SuricataDPDKInterface) {
        this.interface = _interface;
    }

    static getInterfaces(): SuricataDPDKInterface[] {
        let config = SuricataService.getSuricataConfig();
        return config["dpdk"]?.interfaces || [];
    }
    async update(): Promise<void> {
        let config = SuricataService.getSuricataConfig();
        if (!config["dpdk"].interfaces) config["dpdk"].interfaces = [this.interface];
        else
            config["dpdk"].interfaces = config["dpdk"].interfaces.map((iface) => {
                if (iface.interface === this.interface.interface) {
                    return this.interface;
                }
                return iface;
            });

        SuricataService.writeSuricataConfig(config);
    }
    async remove(): Promise<void> {
        let config = SuricataService.getSuricataConfig();
        if (!config["dpdk"].interfaces) config["dpdk"].interfaces = [];
        config["dpdk"].interfaces = config["dpdk"].interfaces.filter((iface) => iface.interface !== this.interface.interface);
        SuricataService.writeSuricataConfig(config);
    }
    async add(): Promise<void> {
        let config = SuricataService.getSuricataConfig();
        if (!config["dpdk"].interfaces) config["dpdk"].interfaces = [];
        config["dpdk"].interfaces.push(this.interface);
        SuricataService.writeSuricataConfig(config);
    }
}
class PcapInterface implements SuricataNetworkInterface<SuricataPcapInterface> {
    interface: SuricataPcapInterface;
    constructor(_interface: SuricataPcapInterface) {
        this.interface = _interface;
    }

    static getInterfaces(): SuricataPcapInterface[] {
        let config = SuricataService.getSuricataConfig();
        return config["pcap"] || [];
    }
    async update(): Promise<void> {
        let config = SuricataService.getSuricataConfig();
        if (!config["pcap"]) config["pcap"] = [this.interface];
        else
            config["pcap"] = config["pcap"].map((iface) => {
                if (iface.interface === this.interface.interface) {
                    return this.interface;
                }
                return iface;
            });
        SuricataService.writeSuricataConfig(config);
    }
    async remove(): Promise<void> {
        let config = SuricataService.getSuricataConfig();
        if (!config["pcap"]) config["pcap"] = [];
        config["pcap"] = config["pcap"].filter((iface) => iface.interface !== this.interface.interface);

        SuricataService.writeSuricataConfig(config);
    }
    async add(): Promise<void> {
        let config = SuricataService.getSuricataConfig();
        if (!config["pcap"]) config["pcap"] = [];
        config["pcap"].push(this.interface);
        SuricataService.writeSuricataConfig(config);
    }
}
class AFInterface implements SuricataNetworkInterface<SuricataAFInterface> {
    interface: SuricataAFInterface;
    constructor(_interface: SuricataAFInterface) {
        this.interface = _interface;
    }

    static getInterfaces(): SuricataAFInterface[] {
        let config = SuricataService.getSuricataConfig();
        return config["af-packet"] || [];
    }
    async update(): Promise<void> {
        let config = SuricataService.getSuricataConfig();
        if (!config["af-packet"]) config["af-packet"] = [this.interface];
        else
            config["af-packet"] = config["af-packet"].map((iface) => {
                if (iface.interface === this.interface.interface) {
                    return this.interface;
                }
                return iface;
            });
        SuricataService.writeSuricataConfig(config);
    }
    async remove(): Promise<void> {
        let config = SuricataService.getSuricataConfig();
        if (!config["af-packet"]) config["af-packet"] = [];
        config["af-packet"] = config["af-packet"].filter((iface) => iface.interface !== this.interface.interface);
        SuricataService.writeSuricataConfig(config);
    }
    async add(): Promise<void> {
        let config = SuricataService.getSuricataConfig();
        if (!config["af-packet"]) config["af-packet"] = [];
        config["af-packet"].push(this.interface);
        SuricataService.writeSuricataConfig(config);
    }
}

class XDPInterface implements SuricataNetworkInterface<SuricataXDPInterface> {
    interface: SuricataXDPInterface;
    constructor(_interface: SuricataXDPInterface) {
        this.interface = _interface;
    }

    static getInterfaces(): SuricataXDPInterface[] {
        let config = SuricataService.getSuricataConfig();
        return config["af-xdp"] || [];
    }
    async update(): Promise<void> {
        let config = SuricataService.getSuricataConfig();
        if (!config["af-xdp"]) config["af-xdp"] = [this.interface];
        else
            config["af-xdp"] = config["af-xdp"].map((iface) => {
                if (iface.interface === this.interface.interface) {
                    return this.interface;
                }
                return iface;
            });
        SuricataService.writeSuricataConfig(config);
    }
    async remove(): Promise<void> {
        let config = SuricataService.getSuricataConfig();
        if (!config["af-xdp"]) config["af-xdp"] = [];
        config["af-xdp"] = config["af-xdp"].filter((iface) => iface.interface !== this.interface.interface);
        SuricataService.writeSuricataConfig(config);
    }
    async add(): Promise<void> {
        let config = SuricataService.getSuricataConfig();
        if (!config["af-xdp"]) config["af-xdp"] = [];
        config["af-xdp"].push(this.interface);
        SuricataService.writeSuricataConfig(config);
    }
}
const interfaceClasses = {
    dpdk: DPDKInterface,
    pcap: PcapInterface,
    "af-packet": AFInterface,
    "af-xdp": XDPInterface,
};

function getInterfaceClass<T = SuricataInterface>(captureType: SuricataCaptureType): new (_interface: T) => SuricataNetworkInterface<T> {
    const interfaceClass = interfaceClasses[captureType];
    if (!interfaceClass) {
        throw new Error(`Unknown interface type: ${captureType}`);
    }
    return interfaceClass as new (_interface: T) => SuricataNetworkInterface<T>;
}

function getStaticInterfaceClass<T = SuricataInterface>(captureType: SuricataCaptureType): typeof StaticSuricataNetworkInterface<T> {
    const interfaceClass = interfaceClasses[captureType];
    if (!interfaceClass) {
        throw new Error(`Unknown interface type: ${captureType}`);
    }
    return interfaceClass as typeof StaticSuricataNetworkInterface<T>;
}

function getInterface<T extends SuricataInterface>(captureType: SuricataCaptureType, _interface: T): SuricataNetworkInterface<T> {
    const InterfaceClass = getInterfaceClass<T>(captureType);
    return new InterfaceClass(_interface);
}

export { getStaticInterfaceClass, getInterface };
