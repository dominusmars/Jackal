import { SuricataPcapInterface } from "lib";
import React, { useState } from "react";
import { Label, TextInput, Checkbox, Button } from "flowbite-react";

interface PCAPInterfaceProps {
    interface_: SuricataPcapInterface;
    saveInterface: (interface_: SuricataPcapInterface) => void;
    deleteInterface: () => void;
}

const PCAPInterface: React.FC<PCAPInterfaceProps> = ({ interface_, saveInterface, deleteInterface }) => {
    const [state, setState] = useState<SuricataPcapInterface>(interface_);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setState((prevState) => {
            const newState = {
                ...prevState,
                [name as keyof SuricataPcapInterface]: type === "checkbox" ? (e.target as any).checked : value,
            };
            if (type === "checkbox" && !(e.target as any).checked) {
                delete newState[name as keyof SuricataPcapInterface];
            } else if (type !== "checkbox" && value === "") {
                delete newState[name as keyof SuricataPcapInterface];
            }
            return newState;
        });
    };

    return (
        <div className="flex justify-center items-center">
            <div className="flex flex-col gap-2 w-1/3">
                <div className="">
                    <Label htmlFor="buffer-size">Buffer Size:</Label>
                    <TextInput type="number" id="buffer-size" name="buffer-size" value={state["buffer-size"] || ""} onChange={handleChange} />
                </div>
                <div className="">
                    <Label htmlFor="bpf-filter">BPF Filter:</Label>
                    <TextInput type="text" id="bpf-filter" name="bpf-filter" value={state["bpf-filter"] || ""} onChange={handleChange} />
                </div>
                <div className="flex gap-3">
                    <Checkbox id="checksum-checks" name="checksum-checks" checked={state["checksum-checks"] === "yes"} onChange={handleChange} />
                    <Label htmlFor="checksum-checks">Checksum Checks</Label>
                </div>
                <div className="">
                    <Label htmlFor="threads">Threads:</Label>
                    <TextInput type="number" id="threads" name="threads" value={state.threads || ""} onChange={handleChange} />
                </div>
                <div className="flex gap-3">
                    <Checkbox id="promisc" name="promisc" checked={state.promisc === "yes"} onChange={handleChange} />
                    <Label htmlFor="promisc">Promiscuous Mode</Label>
                </div>
                <div className="">
                    <Label htmlFor="snaplen">Snap Length:</Label>
                    <TextInput type="number" id="snaplen" name="snaplen" value={state.snaplen || ""} onChange={handleChange} />
                </div>
                <div className="flex justify-end gap-10">
                    <Button color="failure" onClick={deleteInterface}>
                        Delete
                    </Button>
                    <Button onClick={() => saveInterface(state)} className="btn btn-sm">
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PCAPInterface;
