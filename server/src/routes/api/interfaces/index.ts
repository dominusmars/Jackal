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
    switch (capture) {
        case "af-packet":
            const { error } = SuricataAFInterfaceValidator.validate(req.body);
            if (error) {
                return res.status(400).send(error.message);
            }
            break;
        case "af-xdp":
            const { error: errorXDP } = SuricataXDPInterfaceValidator.validate(req.body);
            if (errorXDP) {
                return res.status(400).send(errorXDP.message);
            }
            break;
        case "dpdk":
            const { error: errorDPDK } = SuricataDPDKInterfaceValidator.validate(req.body);
            if (errorDPDK) {
                return res.status(400).send(errorDPDK.message);
            }
            break;
        case "pcap":
            const { error: errorPcap } = SuricataPcapInterfaceValidator.validate(req.body);
            if (errorPcap) {
                return res.status(400).send(errorPcap.message);
            }
            break;
        default:
            return res.status(400).send("Invalid capture type");
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
