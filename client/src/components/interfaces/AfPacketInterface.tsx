import { SuricataAFInterface } from "lib";
import React, { useState } from "react";

interface AfPacketInterfaceProps {
    interface_: {
        interface: string;
        clusterId?: number;
        clusterType?:
            | "cluster_flow"
            | "cluster_cpu"
            | "cluster_qm"
            | "cluster_ebpf";
        defrag?: boolean;
        threads?: "auto" | number;
        useMmap?: boolean;
        mmapLocked?: boolean;
        tpacketV3?: boolean;
        ringSize?: number;
        blockSize?: number;
        blockTimeout?: number;
        useEmergencyFlush?: boolean;
        bufferSize?: number;
        disablePromisc?: boolean;
        checksumChecks?: "kernel" | "yes" | "no" | "auto";
        bpfFilter?: string;
        copyMode?: "ips" | "tap";
        copyIface?: string;
    };
    saveInterface: (interface_: SuricataAFInterface) => void;
    deleteInterface: () => void;
}

import { Label, TextInput, Checkbox, Select, Button } from "flowbite-react";

const AfPacketInterface: React.FC<AfPacketInterfaceProps> = ({
    interface_,
    saveInterface,
    deleteInterface,
}) => {
    const [state, setState] = useState<SuricataAFInterface>(interface_);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setState((prevState) => {
            const newState = {
                ...prevState,
                [name as keyof SuricataAFInterface]:
                    type === "checkbox" ? (e.target as any).checked : value,
            };
            if (type === "checkbox" && !(e.target as any).checked) {
                delete newState[name as keyof SuricataAFInterface];
            } else if (type !== "checkbox" && value === "") {
                delete newState[name as keyof SuricataAFInterface];
            }
            return newState;
        });
    };

    return (
        <div className="flex justify-center items-center">
            <div className="flex flex-col gap-2 w-1/3">
                <div className="">
                    <Label htmlFor="cluster-id">Cluster ID:</Label>
                    <TextInput
                        type="number"
                        id="cluster-id"
                        name="cluster-id"
                        value={state["cluster-id"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="">
                    <Label htmlFor="cluster-type">Cluster Type:</Label>
                    <Select
                        id="cluster-type"
                        name="cluster-type"
                        value={state["cluster-type"] || ""}
                        onChange={handleChange}
                    >
                        <option value="">Select Cluster Type</option>
                        <option value="cluster_flow">Cluster Flow</option>
                        <option value="cluster_cpu">Cluster CPU</option>
                        <option value="cluster_qm">Cluster QM</option>
                        <option value="cluster_ebpf">Cluster eBPF</option>
                    </Select>
                </div>
                <div className="flex gap-3">
                    <Checkbox
                        id="defrag"
                        name="defrag"
                        checked={state.defrag || false}
                        onChange={handleChange}
                    />
                    <Label htmlFor="defrag">Defrag</Label>
                </div>
                <div className="">
                    <Label htmlFor="threads">Threads:</Label>
                    <TextInput
                        type="text"
                        id="threads"
                        name="threads"
                        value={state.threads || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex gap-3">
                    <Checkbox
                        id="use-mmap"
                        name="use-mmap"
                        checked={state["use-mmap"] || false}
                        onChange={handleChange}
                    />
                    <Label htmlFor="use-mmap">Use MMAP</Label>
                </div>
                <div className="flex gap-3">
                    <Checkbox
                        id="mmap-locked"
                        name="mmap-locked"
                        checked={state["mmap-locked"] || false}
                        onChange={handleChange}
                    />
                    <Label htmlFor="mmap-locked">MMAP Locked</Label>
                </div>
                <div className="flex gap-3">
                    <Checkbox
                        id="tpacket-v3"
                        name="tpacket-v3"
                        checked={state["tpacket-v3"] || false}
                        onChange={handleChange}
                    />
                    <Label htmlFor="tpacket-v3">TPacket V3</Label>
                </div>
                <div className="">
                    <Label htmlFor="ring-size">Ring Size:</Label>
                    <TextInput
                        type="number"
                        id="ring-size"
                        name="ring-size"
                        value={state["ring-size"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="">
                    <Label htmlFor="block-size">Block Size:</Label>
                    <TextInput
                        type="number"
                        id="block-size"
                        name="block-size"
                        value={state["block-size"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="">
                    <Label htmlFor="block-timeout">Block Timeout:</Label>
                    <TextInput
                        type="number"
                        id="block-timeout"
                        name="block-timeout"
                        value={state["block-timeout"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex gap-3">
                    <Checkbox
                        id="use-emergency-flush"
                        name="use-emergency-flush"
                        checked={state["use-emergency-flush"] || false}
                        onChange={handleChange}
                    />
                    <Label htmlFor="use-emergency-flush">
                        Use Emergency Flush
                    </Label>
                </div>
                <div className="">
                    <Label htmlFor="buffer-size">Buffer Size:</Label>
                    <TextInput
                        type="number"
                        id="buffer-size"
                        name="buffer-size"
                        value={state["buffer-size"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex gap-3">
                    <Checkbox
                        id="disable-promisc"
                        name="disable-promisc"
                        checked={state["disable-promisc"] || false}
                        onChange={handleChange}
                    />
                    <Label htmlFor="disable-promisc">Disable Promisc</Label>
                </div>
                <div className="">
                    <Label htmlFor="checksum-checks">Checksum Checks:</Label>
                    <Select
                        id="checksum-checks"
                        name="checksum-checks"
                        value={state["checksum-checks"] || ""}
                        onChange={handleChange}
                    >
                        <option value="">Select Checksum Checks</option>
                        <option value="kernel">Kernel</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="auto">Auto</option>
                    </Select>
                </div>
                <div className="">
                    <Label htmlFor="bpf-filter">BPF Filter:</Label>
                    <TextInput
                        type="text"
                        id="bpf-filter"
                        name="bpf-filter"
                        value={state["bpf-filter"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="">
                    <Label htmlFor="copy-mode">Copy Mode:</Label>
                    <Select
                        id="copy-mode"
                        name="copy-mode"
                        value={state["copy-mode"] || ""}
                        onChange={handleChange}
                    >
                        <option value="">Select Copy Mode</option>
                        <option value="ips">IPS</option>
                        <option value="tap">TAP</option>
                    </Select>
                </div>
                <div className="">
                    <Label htmlFor="copy-iface">Copy Interface:</Label>
                    <TextInput
                        type="text"
                        id="copy-iface"
                        name="copy-iface"
                        value={state["copy-iface"] || ""}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex justify-end gap-10">
                    <Button color="failure" onClick={deleteInterface}>
                        Delete
                    </Button>

                    <Button
                        onClick={() => saveInterface(state)}
                        className="btn btn-sm"
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AfPacketInterface;
