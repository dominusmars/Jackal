import axios from "axios";
import { SuricataEveLog } from "lib";

import config from "./jackalConfig";
import { log } from "./debug";

type NetworkMonitorMetrics = {
    retrain_threshold: number;
    contamination: number;
    max_logs: number;
    logs: {
        [event: string]: number;
    };
    health: boolean;
};
type NetworkMonitorAnalyzeResponse = {
    anomaly: boolean;
};

// If we need more services we might want to create a class for services. that would check available of a service and check health
export class NetworkMonitor {
    private static isHealthy: boolean = false;
    private static lastChecked: number = 0;
    private static checkInterval: number = 60000; // 1 minute

    // Check if the network monitor is available
    static async checkHealth() {
        try {
            await axios.get(`${config.NETWORK_MONITOR}/health`, { timeout: 1000 });
            this.isHealthy = true;
        } catch {
            this.isHealthy = false;
        } finally {
            this.lastChecked = Date.now();
        }
    }

    //  Check if the network monitor is available
    static async isAvailable() {
        const now = Date.now();
        if (now - this.lastChecked > this.checkInterval) {
            await this.checkHealth();
        }
        return this.isHealthy;
    }

    // Get metrics for the network monitor
    static async getMetrics(): Promise<NetworkMonitorMetrics> {
        if (!(await this.isAvailable())) {
            return {
                retrain_threshold: 0,
                contamination: 0,
                max_logs: 0,
                logs: {},
                health: false,
            };
        }
        try {
            const { data } = await axios.get(`${config.NETWORK_MONITOR}/metrics`);
            data.health = true;
            return data;
        } catch {
            throw new Error("Failed to get metrics");
        }
    }

    // Analyze a Suricata log
    static async analyze(eveLog: SuricataEveLog | string): Promise<NetworkMonitorAnalyzeResponse> {
        if (!(await this.isAvailable())) {
            return { anomaly: false };
        }
        try {
            const { data } = await axios.post(`${config.NETWORK_MONITOR}/analyze`, eveLog);
            return data;
        } catch {
            log("error", "Failed to analyze log");
            return { anomaly: false };
        }
    }

    // Set the retrain threshold
    static async setThreshold(threshold: number) {
        if (!(await this.isAvailable())) {
            return { status: "dummy" };
        }
        try {
            const { data } = await axios.post(`${config.NETWORK_MONITOR}/retrain_threshold`, { retrain_threshold: threshold });
            return data;
        } catch (error) {
            throw new Error("Failed to set threshold" + error);
        }
    }

    // Set the contamination
    static async setContamination(contamination: number) {
        if (!(await this.isAvailable())) {
            return { status: "dummy" };
        }
        try {
            const { data } = await axios.post(`${config.NETWORK_MONITOR}/contamination`, { contamination });
            return data;
        } catch (error) {
            throw new Error("Failed to set contamination" + error);
        }
    }

    // Set the max logs
    static async setMaxLogs(maxLogs: number) {
        if (!(await this.isAvailable())) {
            return { status: "dummy" };
        }
        try {
            const { data } = await axios.post(`${config.NETWORK_MONITOR}/max_logs`, { max_logs: maxLogs });
            return data;
        } catch (error) {
            throw new Error("Failed to set max logs" + error);
        }
    }
}

export default NetworkMonitor;
