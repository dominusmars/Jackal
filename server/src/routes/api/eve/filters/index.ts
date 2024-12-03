import { SuricataEveSearchFiltersValidators } from "@/requestValidators/searchValidator";
import db from "@/utils/db";
import { NextFunction, Request, Response } from "express";

export const GET = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const filters = await db.getFilters();
            res.json(filters);
        } catch (error) {
            next(error);
        }
    },
];
