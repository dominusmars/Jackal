import { NextFunction, Request, Response } from "express";
import { SuricataRule } from "lib/suricata";
import { makeSuricataRuleString, testSuricataRule } from "../../../utils/suricataUtils";
import suricata from "../../../utils/suricataService";

export const GET = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            let rules = await suricata.getRules();
            res.json(rules);
        } catch (error) {
            next(error);
        }
    },
];

export const POST = [
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const rule: SuricataRule = req.body;
            let stringedRule = makeSuricataRuleString(rule);
            let isValid = testSuricataRule(stringedRule);
            if (!isValid) {
                return res.status(400).send("Invalid Rule");
            }
            let addedRule = await suricata.addRule(rule);
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
            const rule: SuricataRule = req.body;

            let stringedRule = makeSuricataRuleString(rule);
            let isValid = testSuricataRule(stringedRule);
            if (!isValid) {
                return res.status(400).send("Invalid Rule");
            }

            await suricata.removeRule(rule);
            // Remove rule from suricata

            res.send("Rule Removed");
        } catch (error) {
            next(error);
        }
    },
];
