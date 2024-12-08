import db from "@/utils/db";
import { NextFunction, Request, Response } from "express";

export const GET = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.json(await db.getTaggedLogs());
        } catch (error) {
            next(error);
        }
    },
];
