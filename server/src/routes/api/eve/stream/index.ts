import { NextFunction, Request, Response } from "express";
import suricata from "../../../../utils/suricataService";
import { log } from "@/utils/debug";

export const GET = [
    async (req: Request, res: Response, next: NextFunction) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        const sendLine = (line: string) => {
            if (line.trim() !== "") {
                try {
                    if (line.trim().startsWith("{") && line.trim().endsWith("}")) {
                        res.write(`data: ${line.trim()}\n\n`);
                    } else {
                        log("info", "EVE line not JSON:" + line);
                    }
                } catch (parseError) {
                    console.error("Error parsing line:", parseError);
                }
            }
        };
        suricata.on("eve-updated", sendLine);
    },
];
