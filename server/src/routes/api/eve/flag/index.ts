import db from "@/utils/db";
import { NextFunction, Request, Response } from "express";
export function flagValidator(req: Request, res: Response, next: NextFunction) {
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
    flagValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { flowId, flag } = req.query;
            let flagInt = parseInt(flowId as string);
            await db.updateFlag(flagInt, flag as string | undefined);

            res.json({ message: "Flag updated" });
        } catch (error) {
            next(error);
        }
    },
];
export const DELETE = [
    flagValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { flowId } = req.query;
            let flagInt = parseInt(flowId as string);

            await db.unsetFlag(flagInt as number);

            res.json({ message: "Flag removed" });
        } catch (error) {
            next(error);
        }
    },
];
