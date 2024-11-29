import React from "react";
import { SuricataCaptureType, SuricataDPDKInterface, SuricataInterface, SuricataPcapInterface } from "lib/suricata";
import AfPacketInterface from "./interfaces/AfPacketInterface";
import XDPInterface from "./interfaces/XDPInterface";
import DpdkInterface from "./interfaces/DPDKinterface";
import PCAPInterface from "./interfaces/PCAPInterface";

type Props = {
    interface_: SuricataInterface;
    captureType: SuricataCaptureType;
    deleteInterface: () => Promise<void>;
};

function Interface_({ interface_, captureType, deleteInterface }: Props) {
    const [error, setError] = React.useState<string | null>(null);
    const handleSave = async (e: SuricataInterface) => {
        let response = await fetch(`/api/interfaces?capture=${captureType}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(e),
        });
        if (response.ok) {
            console.log("Interface Updated");
            setError(null);
            return;
        }
        setError("Failed to update interface");
    };

    let interfaceComponent;
    switch (captureType as SuricataCaptureType) {
        case "af-packet":
            interfaceComponent = <AfPacketInterface interface_={interface_} saveInterface={handleSave} deleteInterface={deleteInterface} />;
            break;
        case "pcap":
            interfaceComponent = (
                <PCAPInterface interface_={interface_ as SuricataPcapInterface} saveInterface={handleSave} deleteInterface={deleteInterface} />
            );
            break;
        case "af-xdp":
            interfaceComponent = <XDPInterface interface_={interface_} saveInterface={handleSave} deleteInterface={deleteInterface} />;
            break;
        case "dpdk":
            interfaceComponent = (
                <DpdkInterface interface_={interface_ as SuricataDPDKInterface} saveInterface={handleSave} deleteInterface={deleteInterface} />
            );
            break;
        default:
            return <div>Invalid Capture Type</div>;
    }
    return (
        <div>
            {error && <div className="text-red-500">{error}</div>}
            {interfaceComponent}
        </div>
    );
}

export default Interface_;
