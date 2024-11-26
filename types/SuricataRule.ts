export interface SuricataRule {
    action: string;
    protocol: string;
    source: string;
    source_port: string;
    direction: string;
    destination: string;
    destination_port: string;
    options: { [key: string]: string };
}
