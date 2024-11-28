import React, { useState } from "react";
import { SuricataPcapInterface, SuricataInterface } from "lib";
import { TextInput, Checkbox, Button, Label } from "flowbite-react";

interface PCAPInterfaceFormProps {
    onSubmit: (pcapInterface: SuricataInterface) => void;
}

const PCAPInterfaceForm: React.FC<PCAPInterfaceFormProps> = ({ onSubmit }) => {
    const [pcapInterface, setPcapInterface] = useState<SuricataPcapInterface>({
        interface: "",
        "buffer-size": 0,
        "bpf-filter": "",
        "checksum-checks": "auto",
        threads: 1,
        promisc: "no",
        snaplen: 65535,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setPcapInterface((prevState) => ({
            ...prevState,
            [name]: type === "checkbox" ? e.target.checked : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(pcapInterface);
    };

    return (
        <div className="flex justify-center items-center">
            <form onSubmit={handleSubmit} className="w-1/3 flex gap-2 flex-col">
                <div>
                    <Label>Interface</Label>
                    <TextInput type="text" name="interface" value={pcapInterface.interface} onChange={handleChange} required />
                </div>
                <div>
                    <Label>Buffer Size</Label>
                    <TextInput type="number" name="buffer-size" value={pcapInterface["buffer-size"]} onChange={handleChange} />
                </div>
                <div>
                    <Label>BPF Filter</Label>
                    <TextInput type="text" name="bpf-filter" value={pcapInterface["bpf-filter"]} onChange={handleChange} />
                </div>
                <div>
                    <Label>Checksum Checks</Label>
                    <TextInput type="text" name="checksum-checks" value={pcapInterface["checksum-checks"]} onChange={handleChange} />
                </div>
                <div>
                    <Label>Threads</Label>
                    <TextInput type="number" name="threads" value={pcapInterface.threads} onChange={handleChange} />
                </div>
                <div className="flex gap-3">
                    <Checkbox name="promisc" checked={pcapInterface.promisc === "yes"} onChange={handleChange} />
                    <Label>Promiscuous Mode</Label>
                </div>
                <div>
                    <Label>Snap Length</Label>
                    <TextInput type="number" name="snaplen" value={pcapInterface.snaplen} onChange={handleChange} />
                </div>
                <Button type="submit">Submit</Button>
            </form>
        </div>
    );
};

export default PCAPInterfaceForm;
