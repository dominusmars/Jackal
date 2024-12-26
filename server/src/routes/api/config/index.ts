import { SuricataConfig } from "lib";
import { NextFunction, Request, Response } from "express";
import { SuricataService } from "@/utils/suricata/Service";

export const GET = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            let config = SuricataService.getSuricataConfig();
            res.json(config);
        } catch (error) {
            next(error);
        }
    },
];
export const POST = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // TO DO - Add validation
            const config: SuricataConfig = req.body;
            await SuricataService.writeSuricataConfig(config);
            res.json({ status: "okay" });
        } catch (error) {
            next(error);
        }
    },
];
