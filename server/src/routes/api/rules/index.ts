import { NextFunction, Request, Response } from "express";
import { SuricataRuleClass } from "@/utils/suricata/Rules";

export const GET = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            let rules = await SuricataRuleClass.getRules();
            res.json(rules);
        } catch (error) {
            next(error);
        }
    },
];

export const POST = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const rule = new SuricataRuleClass(req.body);

            let isValid = rule.isValid();
            if (!isValid) {
                return res.status(400).send("Invalid Rule");
            }
            let addedRule = await rule.addRule();
            // Add rule to suricata
            res.json(addedRule);
        } catch (error) {
            next(error);
        }
    },
];
export const DELETE = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const rule = new SuricataRuleClass(req.body);

            let isValid = rule.isValid();
            if (!isValid) {
                return res.status(400).send("Invalid Rule");
            }

            await rule.removeRule();
            // Remove rule from suricata

            res.send("Rule Removed");
        } catch (error) {
            next(error);
        }
    },
];
