import { Request, Response } from "express";
import { getServicePath } from "../../../../utils/suricata";
import path from "path";
export const GET = [
    async (req: Request, res: Response) => {
        res.sendFile(getServicePath());
    },
];
