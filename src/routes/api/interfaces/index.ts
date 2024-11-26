import { Request, Response } from "express";
import { SuricataInterface, SuricataRule } from "../../../../types/suricata";
import { makeSuricataRuleString, testSuricataRule } from "../../../utils/suricata";
import Suricata from "../../../utils/SuricataService";

const suricata = new Suricata();

export const GET = [
    async (req: Request, res: Response) => {
        let interfaces = await suricata.getInterfaces();
        res.json(interfaces);
    },
];
export const POST = [
    async (req: Request, res: Response) => {
        const networkInterface: SuricataInterface = req.body;
        let addedInterface = await suricata.addInterface(networkInterface);
        // Add interface to suricata
        res.json(addedInterface);
    },
];
export const DELETE = [
    async (req: Request, res: Response) => {
        const networkInterface: SuricataInterface = req.body;

        await suricata.removeInterface(networkInterface);
        // Remove interface from suricata

        res.send("Interface Removed");
    },
];
