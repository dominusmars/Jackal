import React, { useState } from "react";
import { SuricataDPDKInterface, SuricataInterface } from "lib";
import { TextInput, Checkbox, Select, Button, Label } from "flowbite-react";

interface DPDKInterfaceFormProps {
    onSubmit: (dpdkInterface: SuricataInterface) => void;
}

const DPDKInterfaceForm: React.FC<DPDKInterfaceFormProps> = ({ onSubmit }) => {
    const [dpdkInterface, setDpdkInterface] = useState<SuricataDPDKInterface>({
        interface: "",
        threads: "auto",
        promisc: false,
        multicast: false,
        "checksum-checks": false,
        "checksum-checks-offload": false,
        mtu: 1500,
        "mempool-size": 2048,
        "mempool-cache-size": "auto",
        "rx-descriptors": 1024,
        "tx-descriptors": 1024,
        "copy-mode": "none",
        "copy-iface": "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setDpdkInterface((prevState) => {
            const newState = {
                ...prevState,
                [name as keyof SuricataDPDKInterface]: type === "checkbox" ? e.target.checked : value,
            };
            if ((type === "checkbox" && !e.target.checked) || value === "") {
                delete newState[name as keyof SuricataDPDKInterface];
            }
            return newState;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(dpdkInterface);
    };

    return (
        <div className="flex justify-center items-center">
            <form onSubmit={handleSubmit} className="w-1/3 flex gap-2 flex-col">
                <div>
                    <Label>Interface</Label>
                    <TextInput type="text" name="interface" value={dpdkInterface.interface} onChange={handleChange} required />
                </div>
                <div>
                    <Label>Threads</Label>
                    <TextInput type="number" name="threads" value={dpdkInterface.threads} onChange={handleChange} />
                </div>
                <div className="flex gap-3">
                    <Checkbox name="promisc" checked={dpdkInterface.promisc} onChange={handleChange} />
                    <Label>Promiscuous Mode</Label>
                </div>
                <div className="flex gap-3">
                    <Checkbox name="multicast" checked={dpdkInterface.multicast} onChange={handleChange} />
                    <Label>Multicast</Label>
                </div>
                <div className="flex gap-3">
                    <Checkbox name="checksum-checks" checked={dpdkInterface["checksum-checks"]} onChange={handleChange} />
                    <Label>Checksum Checks</Label>
                </div>
                <div className="flex gap-3">
                    <Checkbox name="checksum-checks-offload" checked={dpdkInterface["checksum-checks-offload"]} onChange={handleChange} />
                    <Label>Checksum Checks Offload</Label>
                </div>
                <div>
                    <Label>MTU</Label>
                    <TextInput type="number" name="mtu" value={dpdkInterface.mtu} onChange={handleChange} />
                </div>
                <div>
                    <Label>Mempool Size</Label>
                    <TextInput type="number" name="mempool-size" value={dpdkInterface["mempool-size"]} onChange={handleChange} />
                </div>
                <div>
                    <Label>Mempool Cache Size</Label>
                    <TextInput type="text" name="mempool-cache-size" value={dpdkInterface["mempool-cache-size"]} onChange={handleChange} />
                </div>
                <div>
                    <Label>RX Descriptors</Label>
                    <TextInput type="number" name="rx-descriptors" value={dpdkInterface["rx-descriptors"]} onChange={handleChange} />
                </div>
                <div>
                    <Label>TX Descriptors</Label>
                    <TextInput type="number" name="tx-descriptors" value={dpdkInterface["tx-descriptors"]} onChange={handleChange} />
                </div>
                <div>
                    <Label>Copy Mode</Label>
                    <Select name="copy-mode" value={dpdkInterface["copy-mode"]} onChange={handleChange}>
                        <option value="none">None</option>
                        <option value="tap">Tap</option>
                        <option value="ips">IPS</option>
                    </Select>
                </div>
                <div>
                    <Label>Copy Interface</Label>
                    <TextInput type="text" name="copy-iface" value={dpdkInterface["copy-iface"]} onChange={handleChange} />
                </div>
                <Button type="submit">Submit</Button>
            </form>
        </div>
    );
};

export default DPDKInterfaceForm;
