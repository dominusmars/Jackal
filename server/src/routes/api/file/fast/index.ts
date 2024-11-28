import { Request, Response } from "express";
import suricata from "../../../../utils/suricataService";
export const GET = [
    async (req: Request, res: Response) => {
        res.sendFile(suricata.getFastPath());
    },
];
