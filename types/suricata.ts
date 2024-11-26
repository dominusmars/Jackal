export interface SuricataConfig {
    "suricata-version": string;
    vars: {
        "address-groups": {
            HOME_NET: string;
            EXTERNAL_NET: string;
            HTTP_SERVERS: string;
            SMTP_SERVERS: string;
            SQL_SERVERS: string;
            DNS_SERVERS: string;
            TELNET_SERVERS: string;
            AIM_SERVERS: string;
            DC_SERVERS: string;
            DNP3_SERVER: string;
            DNP3_CLIENT: string;
            MODBUS_CLIENT: string;
            MODBUS_SERVER: string;
            ENIP_CLIENT: string;
            ENIP_SERVER: string;
        };
        "port-groups": {
            HTTP_PORTS: string;
            SHELLCODE_PORTS: string;
            ORACLE_PORTS: number;
            SSH_PORTS: number;
            DNP3_PORTS: number;
            MODBUS_PORTS: number;
            FILE_DATA_PORTS: string;
            FTP_PORTS: number;
            GENEVE_PORTS: number;
            VXLAN_PORTS: number;
            TEREDO_PORTS: number;
        };
    };
    "default-log-dir": string;
    stats: { enabled: boolean; interval: number };
    plugins: null;
    outputs: Array<{ [key: string]: any }>;
    logging: {
        "default-log-level": string;
        "default-output-filter": null;
        outputs: Array<{ [key: string]: any }>;
    };
    "af-packet": Array<SuricataInterface>;
    "af-xdp": Array<{ interface: string }>;
    dpdk: {
        "eal-params": { "proc-type": string };
        interfaces: Array<{ [key: string]: any }>;
    };
    pcap: Array<{ interface: string }>;
    "pcap-file": { "checksum-checks": string };
    "app-layer": {
        protocols: {
            [key: string]: any;
        };
    };
    "asn1-max-frames": number;
    datasets: { defaults: null; rules: null };
    security: {
        "limit-noproc": boolean;
        landlock: { enabled: boolean; directories: { [key: string]: any } };
        lua: null;
    };
    coredump: { "max-dump": string };
    "host-mode": string;
    "unix-command": { enabled: string };
    legacy: { uricontent: string };
    "exception-policy": string;
    "engine-analysis": { "rules-fast-pattern": boolean; rules: boolean };
    pcre: { "match-limit": number; "match-limit-recursion": number };
    "host-os-policy": {
        windows: string[];
        bsd: string[];
        "bsd-right": string[];
        "old-linux": string[];
        linux: string[];
        "old-solaris": string[];
        solaris: string[];
        hpux10: string[];
        hpux11: string[];
        irix: string[];
        macos: string[];
        vista: string[];
        windows2k3: string[];
    };
    defrag: {
        memcap: string;
        "hash-size": number;
        trackers: number;
        "max-frags": number;
        prealloc: boolean;
        timeout: number;
    };
    flow: {
        memcap: string;
        "hash-size": number;
        prealloc: number;
        "emergency-recovery": number;
    };
    vlan: { "use-for-tracking": boolean };
    livedev: { "use-for-tracking": boolean };
    "flow-timeouts": {
        default: {
            new: number;
            established: number;
            closed: number;
            bypassed: number;
            "emergency-new": number;
            "emergency-established": number;
            "emergency-closed": number;
            "emergency-bypassed": number;
        };
        tcp: {
            new: number;
            established: number;
            closed: number;
            bypassed: number;
            "emergency-new": number;
            "emergency-established": number;
            "emergency-closed": number;
            "emergency-bypassed": number;
        };
        udp: {
            new: number;
            established: number;
            bypassed: number;
            "emergency-new": number;
            "emergency-established": number;
            "emergency-bypassed": number;
        };
        icmp: {
            new: number;
            established: number;
            bypassed: number;
            "emergency-new": number;
            "emergency-established": number;
            "emergency-bypassed": number;
        };
    };
    stream: {
        memcap: string;
        "checksum-validation": boolean;
        inline: string;
        reassembly: {
            memcap: string;
            depth: string;
            "toserver-chunk-size": number;
            "toclient-chunk-size": number;
            "randomize-chunk-size": boolean;
        };
    };
    host: { "hash-size": number; prealloc: number; memcap: string };
    decoder: {
        teredo: { enabled: boolean; ports: string };
        vxlan: { enabled: boolean; ports: string };
        geneve: { enabled: boolean; ports: string };
    };
    detect: {
        profile: string;
        "custom-values": { "toclient-groups": number; "toserver-groups": number };
        "sgh-mpm-context": string;
        "inspection-recursion-limit": number;
        prefilter: { default: string };
        grouping: null;
        profiling: { grouping: { [key: string]: any } };
    };
    "mpm-algo": string;
    "spm-algo": string;
    threading: {
        "set-cpu-affinity": boolean;
        "cpu-affinity": Array<{ [key: string]: any }>;
        "detect-thread-ratio": number;
    };
    luajit: { states: number };
    profiling: {
        rules: {
            enabled: boolean;
            filename: string;
            append: boolean;
            limit: number;
            json: boolean;
        };
        keywords: { enabled: boolean; filename: string; append: boolean };
        prefilter: { enabled: boolean; filename: string; append: boolean };
        rulegroups: { enabled: boolean; filename: string; append: boolean };
        packets: {
            enabled: boolean;
            filename: string;
            append: boolean;
            csv: { [key: string]: any };
        };
        locks: { enabled: boolean; filename: string; append: boolean };
        "pcap-log": { enabled: boolean; filename: string; append: boolean };
    };
    nfq: null;
    nflog: Array<{
        group: number | string;
        "buffer-size"?: number;
        qthreshold?: number;
        qtimeout?: number;
        "max-size"?: number;
    }>;
    capture: null;
    netmap: Array<{ interface: string }>;
    pfring: Array<{
        interface: string;
        threads?: string;
        "cluster-id"?: number;
        "cluster-type"?: string;
    }>;
    ipfw: null;
    napatech: {
        streams: string[];
        "enable-stream-stats": boolean;
        "auto-config": boolean;
        "hardware-bypass": boolean;
        inline: boolean;
        ports: string[];
        hashmode: string;
    };
    "default-rule-path": string;
    "rule-files": string[];
    "classification-file": string;
    "reference-config-file": string;
}

export interface SuricataInterface {
    interface: string;
    "cluster-id"?: number;
    "cluster-type"?: "cluster_flow" | "cluster_cpu" | "cluster_qm" | "cluster_ebpf";
    defrag?: boolean;
    threads?: "auto" | number;
    "use-mmap"?: boolean;
    "mmap-locked"?: boolean;
    "tpacket-v3"?: boolean;
    "ring-size"?: number;
    "block-size"?: number;
    "block-timeout"?: number;
    "use-emergency-flush"?: boolean;
    "buffer-size"?: number;
    "disable-promisc"?: boolean;
    "checksum-checks"?: "kernel" | "yes" | "no" | "auto";
    "bpf-filter"?: string;
    "copy-mode"?: "ips" | "tap";
    "copy-iface"?: string;
}
export interface SuricataRule {
    action: "alert" | "pass" | "drop" | "reject" | "rejectsrc" | "rejectdst" | "rejectboth" | "";
    protocol: string;
    source: string;
    source_port: string;
    direction: string;
    destination: string;
    destination_port: string;
    options: { [key: string]: string | true };
}

export interface ExtendedSuricataRule extends SuricataRule {
    full_text: string;
    id: string;
}
