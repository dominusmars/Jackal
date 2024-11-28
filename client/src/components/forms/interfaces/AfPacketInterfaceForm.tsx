import React, { useState } from "react";
import { SuricataAFInterface, SuricataInterface } from "lib";
import { TextInput, Checkbox, Select, Button, Label } from "flowbite-react";

interface AfPacketInterfaceFormProps {
    onSubmit: (afPacketInterface: SuricataInterface) => void;
}

const AfPacketInterfaceForm: React.FC<AfPacketInterfaceFormProps> = ({
    onSubmit,
}) => {
    const [afPacketInterface, setAfPacketInterface] =
        useState<SuricataAFInterface>({
            interface: "",
        });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setAfPacketInterface((prevState) => {
            const newState = {
                ...prevState,
                [name as keyof SuricataAFInterface]:
                    type === "checkbox" ? true : value,
            };
            if ((type === "checkbox" && !e.target.checked) || value === "") {
                delete newState[name as keyof SuricataAFInterface];
            }
            return newState;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(afPacketInterface);
    };

    return (
        <div className="flex justify-center items-center">
            <form onSubmit={handleSubmit} className="w-1/3">
                <div>
                    <Label>Interface</Label>
                    <TextInput
                        type="text"
                        name="interface"
                        value={afPacketInterface.interface}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <Label>Cluster ID</Label>
                    <TextInput
                        type="number"
                        name="cluster-id"
                        value={afPacketInterface["cluster-id"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <Label>Cluster Type</Label>
                    <Select
                        name="cluster-type"
                        value={afPacketInterface["cluster-type"] || ""}
                        onChange={handleChange}
                    >
                        <option value="">Select</option>
                        <option value="cluster_flow">Cluster Flow</option>
                        <option value="cluster_cpu">Cluster CPU</option>
                        <option value="cluster_qm">Cluster QM</option>
                        <option value="cluster_ebpf">Cluster eBPF</option>
                    </Select>
                </div>
                <div className="flex gap-3">
                    <Checkbox
                        name="defrag"
                        checked={afPacketInterface.defrag || false}
                        onChange={handleChange}
                    />
                    <Label>Defrag</Label>
                </div>
                <div>
                    <Label>Threads</Label>
                    <TextInput
                        type="number"
                        name="threads"
                        value={afPacketInterface.threads || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex gap-3">
                    <Checkbox
                        name="use-mmap"
                        checked={afPacketInterface["use-mmap"] || false}
                        onChange={handleChange}
                    />
                    <Label>Use MMAP</Label>
                </div>
                <div className="flex gap-3">
                    <Checkbox
                        name="mmap-locked"
                        checked={afPacketInterface["mmap-locked"] || false}
                        onChange={handleChange}
                    />
                    <Label>MMAP Locked</Label>
                </div>
                <div className="flex gap-3">
                    <Checkbox
                        name="tpacket-v3"
                        checked={afPacketInterface["tpacket-v3"] || false}
                        onChange={handleChange}
                    />
                    <Label>Tpacket V3</Label>
                </div>
                <div>
                    <Label>Ring Size</Label>
                    <TextInput
                        type="number"
                        name="ring-size"
                        value={afPacketInterface["ring-size"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <Label>Block Size</Label>
                    <TextInput
                        type="number"
                        name="block-size"
                        value={afPacketInterface["block-size"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <Label>Block Timeout</Label>
                    <TextInput
                        type="number"
                        name="block-timeout"
                        value={afPacketInterface["block-timeout"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex gap-3">
                    <Checkbox
                        name="use-emergency-flush"
                        checked={
                            afPacketInterface["use-emergency-flush"] || false
                        }
                        onChange={handleChange}
                    />
                    <Label>Use Emergency Flush</Label>
                </div>
                <div>
                    <Label>Buffer Size</Label>
                    <TextInput
                        type="number"
                        name="buffer-size"
                        value={afPacketInterface["buffer-size"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex gap-3">
                    <Checkbox
                        name="disable-promisc"
                        checked={afPacketInterface["disable-promisc"] || false}
                        onChange={handleChange}
                    />
                    <Label>Disable Promisc</Label>
                </div>
                <div>
                    <Label>Checksum Checks</Label>
                    <Select
                        name="checksum-checks"
                        value={afPacketInterface["checksum-checks"] || ""}
                        onChange={handleChange}
                    >
                        <option value="">Select</option>
                        <option value="kernel">Kernel</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="auto">Auto</option>
                    </Select>
                </div>
                <div>
                    <Label>BPF Filter</Label>
                    <TextInput
                        type="text"
                        name="bpf-filter"
                        value={afPacketInterface["bpf-filter"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <Label>Copy Mode</Label>
                    <Select
                        name="copy-mode"
                        value={afPacketInterface["copy-mode"] || ""}
                        onChange={handleChange}
                    >
                        <option value="">Select</option>
                        <option value="ips">IPS</option>
                        <option value="tap">Tap</option>
                    </Select>
                </div>
                <div>
                    <Label>Copy Interface</Label>
                    <TextInput
                        type="text"
                        name="copy-iface"
                        value={afPacketInterface["copy-iface"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <Button type="submit">Submit</Button>
            </form>
        </div>
    );
};

export default AfPacketInterfaceForm;
