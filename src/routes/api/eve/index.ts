import { Request, Response } from "express";
import fs from "fs";
import { createReadStream } from "fs";
import readline from "readline";

export const GET = [
    async (req: Request, res: Response) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        let stream = createReadStream("eve.json", { encoding: "utf8" });
        let rl = readline.createInterface({
            input: stream,
            crlfDelay: Infinity,
        });

        const sendLine = (line: string) => {
            if (line.trim() !== "") {
                try {
                    res.write(`data: ${line.trim()}\n\n`);
                } catch (parseError) {
                    console.error("Error parsing line:", parseError);
                }
            }
        };

        rl.on("line", sendLine);

        rl.on("error", (error) => {
            console.error("Error reading eve.json file:", error);
            res.status(500).json({ error: "Could not read eve.json file" });
        });

        const watchFile = () => {
            fs.watch("eve.json", (eventType) => {
                if (eventType === "change") {
                    stream.close();
                    rl.close();

                    stream = createReadStream("eve.json", { encoding: "utf8" });
                    rl = readline.createInterface({
                        input: stream,
                        crlfDelay: Infinity,
                    });

                    rl.on("line", sendLine);
                    rl.on("error", (error) => {
                        console.error("Error reading eve.json file:", error);
                        res.status(500).json({
                            error: "Could not read eve.json file",
                        });
                    });
                }
            });
        };

        watchFile();

        req.on("close", () => {
            rl.close();
            stream.close();
        });
    },
];
