import suricata from "@/utils/suricataService";
import { NextFunction, Request, Response } from "express";

export const POST = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { active } = req.query;

            if (typeof active !== "string") {
                throw new Error("Invalid active value");
            }
            if (active === "true") {
                suricata.startMonitor();
            }
            if (active === "false") {
                suricata.stopMonitor();
            }
            if (active === "true" || active === "false") {
                res.json({ active: active });
            } else {
                throw new Error("Invalid active value");
            }
        } catch (error) {
            next(error);
        }
    },
];