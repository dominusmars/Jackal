import { Request, Response } from "express";
import { SuricataRule } from "../../../../types/suricata";
import { makeSuricataRuleString, testSuricataRule } from "../../../utils/suricata";
import Suricata from "../../../utils/SuricataService";

const suricata = new Suricata();

export const GET = [
    async (req: Request, res: Response) => {
        let rules = await suricata.getRules();
        res.json(rules);
    },
];

export const POST = [
    async (req: Request, res: Response) => {
        const rule: SuricataRule = req.body;
        let stringedRule = makeSuricataRuleString(rule);
        let isValid = testSuricataRule(stringedRule);
        if (!isValid) {
            return res.status(400).send("Invalid Rule");
        }
        let addedRule = await suricata.addRule(rule);
        // Add rule to suricata
        res.json(addedRule);
    },
];
export const DELETE = [
    async (req: Request, res: Response) => {
        const rule: SuricataRule = req.body;

        let stringedRule = makeSuricataRuleString(rule);
        let isValid = testSuricataRule(stringedRule);
        if (!isValid) {
            return res.status(400).send("Invalid Rule");
        }

        await suricata.removeRule(rule);
        // Remove rule from suricata

        res.send("Rule Removed");
    },
];
