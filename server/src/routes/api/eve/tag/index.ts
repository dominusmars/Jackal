import db from "@/utils/db";
import { NextFunction, Request, Response } from "express";
export function tagValidator(req: Request, res: Response, next: NextFunction) {
    try {
        const { flowId } = req.query;

        if (!flowId) {
            return res.status(400).json({ message: "Flow ID is required" });
        }
        if (!(typeof flowId === "string")) {
            return res.status(400).json({ message: "Flow ID must be a string" });
        }
        if (isNaN(parseInt(flowId as string))) {
            return res.status(400).json({ message: "Flow ID must be a number" });
        }
        if (flowId.length > 21) {
            return res.status(400).json({ message: "Flow ID must be less than 21 characters" });
        }

        next();
    } catch (error) {
        next(error);
    }
}

export const POST = [
    tagValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { flowId, tag } = req.query;
            let flowInt = parseInt(flowId as string);
            await db.updateTag(flowInt, tag as string | undefined);

            res.json(await db.getTaggedLogs());
        } catch (error) {
            next(error);
        }
    },
];
export const DELETE = [
    tagValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { flowId } = req.query;
            let flowInt = parseInt(flowId as string);

            await db.unsetTag(flowInt as number);

            res.json(await db.getTaggedLogs());
        } catch (error) {
            next(error);
        }
    },
];
