import { NextFunction, Request, Response } from "express";
import networkMonitor from "@/utils/networkMonitor";

export const GET = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            let health = await networkMonitor.isAvailable();
            res.json({ health: health });
        } catch (error) {
            next(error);
        }
    },
];
