import React from "react";
import { SuricataCaptureType, SuricataInterface } from "lib/suricata";
import AfPacketInterface from "./interfaces/AfPacketInterface";
import XDPInterface from "./forms/interfaces/XDPInterface";

type Props = {
    interface_: SuricataInterface;
    captureType: SuricataCaptureType;
    deleteInterface: () => Promise<void>;
};

function Interface_({ interface_, captureType, deleteInterface }: Props) {
    const [error, setError] = React.useState<string | null>(null);
    const handleSubmit = async (e: SuricataInterface) => {
        let response = await fetch(`/api/interfaces?capture=${captureType}`, {
            method: "UPDATE",
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
    switch (captureType) {
        case "af-packet":
            interfaceComponent = (
                <AfPacketInterface
                    interface_={interface_}
                    saveInterface={handleSubmit}
                    deleteInterface={deleteInterface}
                />
            );
            break;
        // case "pcap":
        //     return <PcapInterface interface_={interface_} />;
        case "af-xdp":
            interfaceComponent = (
                <XDPInterface
                    interface_={interface_}
                    saveInterface={handleSubmit}
                    deleteInterface={deleteInterface}
                />
            );
        // case "dpdk":
        //     return <DpdkInterface interface_={interface_} />;
        default:
            return null;
    }
    return (
        <div>
            {error && <div className="text-red-500">{error}</div>}
            {interfaceComponent}
        </div>
    );
}

export default Interface_;
