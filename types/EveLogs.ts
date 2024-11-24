export interface SuricataEveLog {
    timestamp: string;
    event_type: string;
    src_ip: string;
    src_port?: number;
    dest_ip: string;
    dest_port?: number;
    proto?: string;
    alert?: {
        action: string;
        gid: number;
        signature_id: number;
        rev: number;
        signature: string;
        category: string;
        severity: number;
    };
    http?: {
        hostname: string;
        url: string;
        http_user_agent: string;
        http_method: string;
        protocol: string;
        status: number;
        length: number;
    };
    dns?: {
        type: string;
        id: number;
        rrname: string;
        rcode: string;
        rrtype: string;
        tx_id: number;
    };
    tls?: {
        subject: string;
        issuerdn: string;
        fingerprint: string;
        sni: string;
        version: string;
    };
    app_proto?: string;
    flow_id: number;
    in_iface: string;
    pcap_cnt: number;
    vlan?: [number];
    tx_id?: number;
    community_id?: string;
    icmp_type?: number;
    icmp_code?: number;
    event_severity?: number;
    proto_txt?: string;
}
