import { NextFunction, Request, Response } from "express";
import { SuricataCaptureType, SuricataInterface } from "lib/suricata";
import suricata from "../../../utils/suricataService";

const filterCaptureType = (req: Request, res: Response, next: NextFunction) => {
    const { capture } = req.query;

    if (typeof capture !== "string") {
        return res.status(400).send("Invalid capture type");
    }
    if (!["af-packet", "af-xdp", "dpdk", "pcap"].includes(capture)) {
        return res.status(400).send("Invalid capture type");
    }
    next();
};

export const GET = [
    filterCaptureType,
    async (req: Request, res: Response) => {
        const { capture } = req.query;

        let interfaces = await suricata.getInterfaces(capture as SuricataCaptureType);
        res.json(interfaces);
    },
];
export const POST = [
    filterCaptureType,
    async (req: Request, res: Response) => {
        const { capture } = req.query;

        const networkInterface: SuricataInterface = req.body;
        let addedInterface = await suricata.addInterface(networkInterface, capture as SuricataCaptureType);
        // Add interface to suricata
        res.json(addedInterface);
    },
];
export const UPDATE = [
    filterCaptureType,
    async (req: Request, res: Response) => {
        const { capture } = req.query;

        const networkInterface: SuricataInterface = req.body;

        await suricata.updateInterface(networkInterface, capture as SuricataCaptureType);
        // Update interface in suricata

        res.send("Interface Updated");
    },
];

export const DELETE = [
    filterCaptureType,
    async (req: Request, res: Response) => {
        const { capture } = req.query;

        const networkInterface: SuricataInterface = req.body;

        await suricata.removeInterface(networkInterface, capture as SuricataCaptureType);
        // Remove interface from suricata

        res.send("Interface Removed");
    },
];
