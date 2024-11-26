import { Request, Response } from "express";
import { SuricataRule } from "../../../../types/SuricataRule";
import {
    makeSuricataRuleString,
    testSuricataRule,
} from "../../../utils/suricata";

export const GET = [
    (req: Request, res: Response) => {
        res.send("Hello World");
    },
];

export const POST = [
    (req: Request, res: Response) => {
        const body: SuricataRule = req.body;

        let stringedRule = makeSuricataRuleString(body);
        let isValid = testSuricataRule(stringedRule);
        if (!isValid) {
            return res.status(400).send("Invalid Rule");
        }
        // Add rule to suricata

        res.send("Rule Added");
    },
];
