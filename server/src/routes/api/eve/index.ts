import { Request, Response } from "express";
import { createReadStream } from "fs";
import readline from "readline";
import suricata from "../../../utils/suricataService";
export const GET = [
    async (req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");

        let stream = createReadStream(suricata.getEVELogPath(), { encoding: "utf8" });
        const rl = readline.createInterface({
            input: stream,
            crlfDelay: Infinity,
        });

        const jsonArray: any[] = [];

        rl.on("line", (line) => {
            try {
                const json = JSON.parse(line);
                jsonArray.push(json);
            } catch (error) {
                console.error("Error parsing JSON line:", error);
            }
        });
        rl.on("close", () => {
            res.json(jsonArray);
        });

        stream.on("error", (error) => {
            console.error("Error reading eve.json file:", error);
            res.status(500).json({ error: "Could not read eve.json file" });
        });
    },
];
