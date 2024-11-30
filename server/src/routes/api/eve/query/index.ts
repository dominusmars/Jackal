import { SuricataEveSearchFiltersValidators } from "@/requestValidators/searchValidator";
import db from "@/utils/db";
import { NextFunction, Request, Response } from "express";

const filterSearchFilters = (req: Request, res: Response, next: NextFunction) => {
    const filters = req.query;
    const { error } = SuricataEveSearchFiltersValidators.validate(filters);
    if (error) {
        return res.status(400).json(error.message);
    }

    next();
};

export const GET = [
    filterSearchFilters,
    async (req: Request, res: Response, next: NextFunction) => {
        const filters = req.query;

        try {
            const logs = await db.searchLogs(filters);
            res.json(logs);
        } catch (error) {
            next(error);
        }
    },
];
