import { Request, Response } from "express";
import { getStatsPath } from "../../../../utils/suricata";
export const GET = [
    async (req: Request, res: Response) => {
        res.sendFile(getStatsPath());
    },
];
