import { SuricataConfig } from "lib/suricata";
import suricata from "../../../utils/suricataService";
import { Request, Response } from "express";

export const GET = [
    async (req: Request, res: Response) => {
        let config = await suricata.getSuricataConfig();
        res.json(config);
    },
];
export const POST = [
    async (req: Request, res: Response) => {
        const config: SuricataConfig = req.body;
        await suricata.writeSuricataConfig(config);
        res.json({ status: "okay" });
    },
];
