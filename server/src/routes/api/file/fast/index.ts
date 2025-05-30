import { NextFunction, Request, Response } from "express";
import { SuricataService } from "@/utils/suricata/Service";
export const GET = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.sendFile(SuricataService.getFastPath());
        } catch (error) {
            next(error);
        }
    },
];
