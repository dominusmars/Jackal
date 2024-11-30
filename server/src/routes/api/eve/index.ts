import { NextFunction, Request, Response } from "express";
import { createReadStream } from "fs";
import readline from "readline";
import suricata from "../../../utils/suricataService";

import db from "@/utils/db";

export const GET = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const logs = await db.getLatestLogs();
            res.json(logs);
        } catch (error) {
            next(error);
        }
    },
];
