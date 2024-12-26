import { NextFunction, Request, Response } from "express";
import networkMonitor from "@/utils/networkMonitor";

export const POST = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const contamination = req.body.contamination;
            if (typeof contamination !== "number") {
                throw new Error("Invalid contamination value");
            }

            let metrics = await networkMonitor.setContamination(contamination);
            res.json(metrics);
        } catch (error) {
            next(error);
        }
    },
];
