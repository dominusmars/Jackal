export interface SuricataRule {
    action:
        | "alert"
        | "pass"
        | "drop"
        | "reject"
        | "rejectsrc"
        | "rejectdst"
        | "rejectboth"
        | "";
    protocol: string;
    source: string;
    source_port: string;
    direction: string;
    destination: string;
    destination_port: string;
    options: { [key: string]: string | true };
}
