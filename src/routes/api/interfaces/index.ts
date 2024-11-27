import { Request, Response } from "express";
import { SuricataInterface } from "../../../../types/suricata";
import suricata from "../../../utils/suricataService";

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
