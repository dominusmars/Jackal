import { SuricataAFInterface, SuricataCaptureType, SuricataDPDKInterface, SuricataPcapInterface, SuricataXDPInterface } from "lib";
import Joi from "joi";

export const SuricataAFInterfaceValidator = Joi.object<SuricataAFInterface>({
    interface: Joi.string().required(),
    "cluster-id": Joi.number().optional(),
    "cluster-type": Joi.string().valid("cluster_flow", "cluster_cpu", "cluster_qm", "cluster_ebpf").optional(),
    defrag: Joi.boolean().optional(),
    threads: Joi.alternatives().try(Joi.string().valid("auto"), Joi.number()).optional(),
    "use-mmap": Joi.boolean().optional(),
    "mmap-locked": Joi.boolean().optional(),
    "tpacket-v3": Joi.boolean().optional(),
    "ring-size": Joi.number().optional(),
    "block-size": Joi.number().optional(),
    "block-timeout": Joi.number().optional(),
    "use-emergency-flush": Joi.boolean().optional(),
    "buffer-size": Joi.number().optional(),
    "disable-promisc": Joi.boolean().optional(),
    "checksum-checks": Joi.string().valid("kernel", "yes", "no", "auto").optional(),
    "bpf-filter": Joi.string().optional(),
    "copy-mode": Joi.string().valid("ips", "tap").optional(),
    "copy-iface": Joi.string().optional(),
});

export const SuricataXDPInterfaceValidator = Joi.object<SuricataXDPInterface>({
    interface: Joi.string().required(),
    threads: Joi.alternatives().try(Joi.string().valid("auto"), Joi.number()).optional(),
    "disable-promisc": Joi.boolean().optional(),
    "force-xdp-mode": Joi.string().valid("drv", "skb", "none").optional(),
    "force-bind-mode": Joi.string().valid("zero", "copy", "none").optional(),
    "mem-unaligned": Joi.boolean().optional(),
    "enable-busy-poll": Joi.boolean().optional(),
    "busy-poll-time": Joi.number().optional(),
    "busy-poll-budget": Joi.number().optional(),
    "gro-flush-timeout": Joi.number().optional(),
    "napi-defer-hard-irq": Joi.number().optional(),
});

export const SuricataDPDKInterfaceValidator = Joi.object<SuricataDPDKInterface>({
    interface: Joi.string().required(),
    threads: Joi.alternatives().try(Joi.string().valid("auto"), Joi.number()).required(),
    promisc: Joi.boolean().required(),
    multicast: Joi.boolean().required(),
    "checksum-checks": Joi.boolean().required(),
    "checksum-checks-offload": Joi.boolean().required(),
    mtu: Joi.number().required(),
    "mempool-size": Joi.number().required(),
    "mempool-cache-size": Joi.alternatives().try(Joi.number(), Joi.string().valid("auto")).required(),
    "rx-descriptors": Joi.number().required(),
    "tx-descriptors": Joi.number().required(),
    "copy-mode": Joi.string().valid("none", "tap", "ips").required(),
    "copy-iface": Joi.string().required(),
});

export const SuricataPcapInterfaceValidator = Joi.object<SuricataPcapInterface>({
    interface: Joi.string().required(),
    "buffer-size": Joi.number().optional(),
    "bpf-filter": Joi.string().optional(),
    "checksum-checks": Joi.string().valid("yes", "no", "auto").optional(),
    threads: Joi.number().optional(),
    promisc: Joi.string().valid("yes", "no").optional(),
    snaplen: Joi.number().optional(),
});

export const SuricataCaptureTypeValidator = Joi.string<SuricataCaptureType>().valid("af-packet", "af-xdp", "dpdk", "pcap");
