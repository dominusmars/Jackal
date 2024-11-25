import { Request, Response } from "express";

import tail from "tail";
import { getEVELogPath } from "../../../../utils/suricata";

export const GET = [
    async (req: Request, res: Response) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        const sendLine = (line: string) => {
            if (line.trim() !== "") {
                try {
                    res.write(`data: ${line.trim()}\n\n`);
                } catch (parseError) {
                    console.error("Error parsing line:", parseError);
                }
            }
        };

        const eveTail = new tail.Tail(getEVELogPath());
        eveTail.on("line", sendLine);
    },
];
