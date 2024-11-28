import React from "react";
import { SuricataCaptureType, SuricataInterface } from "lib/suricata";

type Props = {
    interface_: SuricataInterface;
    captureType: SuricataCaptureType;
};

function Interface_({ interface_, captureType }: Props) {

    // switch (captureType) {
    //     case "af-packet":
    //         return <AfPacketInterface interface_={interface_} />;
    //     case "dpdk":
    //         return <DpdkInterface interface_={interface_} />;
    //     default:
    //         return null;
    // }


    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{interface_.interface}</div>
                <div className="flex items-center gap-2">
                    <button className="btn btn-sm">Edit</button>
                    <button className="btn btn-sm">Delete</button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {/* <div className="text-sm text-gray-600">Type: {interface_["block-size"]}</div> */}
                {/* <div className="text-sm text-gray-600">Enabled: {interface_["cluster-id"] ? "Yes" : "No"}</div> */}
            </div>
        </div>
    );
}

export default Interface_;
