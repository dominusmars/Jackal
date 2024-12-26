import { NextFunction, Request, Response } from "express";
import { suricata } from "@/utils/suricata/Service";

export const GET = [
    async (req: Request, res: Response, next: NextFunction) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        const sendLine = (line: string) => {
            res.write(`data: ${line}\n\n`);
        };
        suricata.on("eve-updated", sendLine);
    },
];
