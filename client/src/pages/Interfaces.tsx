import React, { useEffect, useState } from "react";
import { SuricataCaptureType, SuricataInterface } from "lib/suricata";
import PageTitle from "@components/PageTitle";
import Interface_ from "../components/Interface_";
import { Tabs } from "flowbite-react";
type Props = {};

function Interfaces({}: Props) {
    const [interfaces, setInterfaces] = useState<SuricataInterface[]>([]);
    const [currentInterface, setCurrentInterface] = useState<SuricataInterface | null>(null);
    const [currentCaptureType, setCurrentCaptureType] = useState<SuricataCaptureType>("af-packet");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchInterfaces = async (captureType: SuricataCaptureType) => {
            let response = await fetch("/api/interfaces?" + `capture=${captureType}`);
            if (!response.ok) {
                throw new Error("Failed to fetch interfaces");
            }
            let data = await response.json();
            setInterfaces(data);
            setLoading(false);
        };
        setLoading(true);
        fetchInterfaces(currentCaptureType);
    }, [currentCaptureType]);
    const selectInterface = (interfaceName: string) => {
        let selectedInterface = interfaces.find((interface_) => interface_.interface === interfaceName);
        if (selectedInterface) {
            setCurrentInterface(selectedInterface);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="flex-1 justify-start flex-col gap-1">
                <PageTitle
                    title="Interfaces"
                    stats={[
                        {
                            info: `Interfaces: ${interfaces.length}`,
                        },
                    ]}
                />
                <div className="p-4">
                    <div className="overflow-x-auto">
                        <Tabs>
                            <Tabs.Item title="AF-Packet" onClick={() => {}}>
                                {loading && <div>Loading...</div>}
                                {!loading && interfaces.length === 0 && <div>No interfaces found</div>}
                                {!loading && interfaces.length > 0 && (
                                    <Tabs>
                                        {interfaces.map((interface_) => (
                                            <Tabs.Item
                                                key={interface_.interface}
                                                title={interface_.interface}
                                                onClick={() => {
                                                    selectInterface(interface_.interface);
                                                }}
                                                active={currentInterface?.interface === interface_.interface}
                                            >
                                                <Interface_ interface_={interface_} captureType={currentCaptureType} />
                                            </Tabs.Item>
                                        ))}
                                    </Tabs>
                                )}
                            </Tabs.Item>
                            <Tabs.Item title="AF-XDP" onClick={() => {}}>
                                <div>AF-XDP</div>
                            </Tabs.Item>
                            <Tabs.Item title="DPDK" onClick={() => {}}>
                                <div>DPDK</div>
                            </Tabs.Item>
                            <Tabs.Item title="PCAP" onClick={() => {}}>
                                <div>PCAP</div>
                            </Tabs.Item>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Interfaces;
