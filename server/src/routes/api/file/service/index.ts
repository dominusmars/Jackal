import { NextFunction, Request, Response } from "express";
import suricata from "../../../../utils/suricataService";
export const GET = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.sendFile(suricata.getServicePath());
        } catch (error) {
            next(error);
        }
    },
];
