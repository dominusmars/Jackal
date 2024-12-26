import { NextFunction, Request, Response } from "express";
import networkMonitor from "@/utils/networkMonitor";

export const POST = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const max = req.body.max;
            if (typeof max !== "number") {
                throw new Error("Invalid contamination value");
            }

            let metrics = await networkMonitor.setMaxLogs(max);
            res.json(metrics);
        } catch (error) {
            next(error);
        }
    },
];
