import { NextFunction, Request, Response } from "express";
import NetworkMonitor from "@/utils/networkMonitor";

export const POST = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const retrain = req.body.retrain;
            if (typeof retrain !== "number") {
                throw new Error("Invalid contamination value");
            }

            let metrics = await NetworkMonitor.setThreshold(retrain);
            res.json(metrics);
        } catch (error) {
            next(error);
        }
    },
];
