import { SuricataConfig } from "lib/suricata";
import suricata from "../../../utils/suricataService";
import { NextFunction, Request, Response } from "express";

export const GET = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            let config = suricata.getSuricataConfig();
            res.json(config);
        } catch (error) {
            next(error);
        }
    },
];
export const POST = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const config: SuricataConfig = req.body;
            await suricata.writeSuricataConfig(config);
            res.json({ status: "okay" });
        } catch (error) {
            next(error);
        }
    },
];
