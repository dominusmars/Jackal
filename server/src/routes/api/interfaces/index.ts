import { NextFunction, Request, Response } from "express";
import { SuricataCaptureType } from "lib";
import {
    SuricataAFInterfaceValidator,
    SuricataDPDKInterfaceValidator,
    SuricataPcapInterfaceValidator,
    SuricataXDPInterfaceValidator,
} from "@validators/interfacesValidator";
import { getInterface, getStaticInterfaceClass } from "@/utils/suricata/NetInterfaces";
const filterCaptureType = (req: Request, res: Response, next: NextFunction) => {
    const { capture } = req.query;
    if (typeof capture !== "string") {
        return res.status(400).send("Invalid capture type");
    }
    if (!["af-packet", "af-xdp", "dpdk", "pcap"].includes(capture)) {
        return res.status(400).send("Invalid capture type");
    }

    if (req.method === "GET") {
        next();
        return;
    }
    let error;
    switch (capture) {
        case "af-packet":
            error = SuricataAFInterfaceValidator.validate(req.body).error;
            break;
        case "af-xdp":
            error = SuricataXDPInterfaceValidator.validate(req.body).error;
            break;
        case "dpdk":
            error = SuricataDPDKInterfaceValidator.validate(req.body).error;
            break;
        case "pcap":
            error = SuricataPcapInterfaceValidator.validate(req.body).error;
            break;
        default:
            return res.status(400).send("Invalid capture type");
    }
    if (error) {
        return res.status(400).send(error.message);
    }

    next();
};

export const GET = [
    filterCaptureType,
    async (req: Request, res: Response, next: NextFunction) => {
        const { capture } = req.query;
        try {
            let interfaceClass = getStaticInterfaceClass(capture as SuricataCaptureType);
            res.json(interfaceClass.getInterfaces());
        } catch (error) {
            next(error);
        }
    },
];
export const POST = [
    filterCaptureType,
    async (req: Request, res: Response, next: NextFunction) => {
        const { capture } = req.query;
        try {
            const networkInterface = getInterface(capture as SuricataCaptureType, req.body);

            let addedInterface = await networkInterface.add();
            // Add interface to suricata
            res.json(addedInterface);
        } catch (error) {
            next(error);
        }
    },
];
export const PATCH = [
    filterCaptureType,
    async (req: Request, res: Response, next: NextFunction) => {
        const { capture } = req.query;
        try {
            const networkInterface = getInterface(capture as SuricataCaptureType, req.body);

            await networkInterface.update();
            // Update interface in suricata

            res.send("Interface Updated");
        } catch (error) {
            next(error);
        }
    },
];

export const DELETE = [
    filterCaptureType,
    async (req: Request, res: Response, next: NextFunction) => {
        const { capture } = req.query;
        try {
            const networkInterface = getInterface(capture as SuricataCaptureType, req.body);

            await networkInterface.remove();
            // Remove interface from suricata

            res.send("Interface Removed");
        } catch (error) {
            next(error);
        }
    },
];
