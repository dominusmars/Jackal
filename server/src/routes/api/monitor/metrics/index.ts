import { NextFunction, Request, Response } from "express";
import networkMonitor from "@/utils/networkMonitor";
import { suricata } from "@/utils/suricata/Service";

export const GET = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            let metrics = await networkMonitor.getMetrics();
            let active = suricata.getNetworkMonitorStatus();

            res.json({ ...metrics, active });
        } catch (error) {
            next(error);
        }
    },
];
