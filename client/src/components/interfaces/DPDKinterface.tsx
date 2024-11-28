import { SuricataDPDKInterface } from "lib";
import React, { useState } from "react";
import { Label, TextInput, Checkbox, Select, Button } from "flowbite-react";

interface DpdkInterfaceProps {
    interface_: SuricataDPDKInterface;
    saveInterface: (interface_: SuricataDPDKInterface) => void;
    deleteInterface: () => void;
}

const DpdkInterface: React.FC<DpdkInterfaceProps> = ({ interface_, saveInterface, deleteInterface }) => {
    const [state, setState] = useState<SuricataDPDKInterface>(interface_);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setState((prevState) => {
            const newState = {
                ...prevState,
                [name as keyof SuricataDPDKInterface]: type === "checkbox" ? (e.target as any).checked : value,
            };
            if (type === "checkbox" && !(e.target as any).checked) {
                delete newState[name as keyof SuricataDPDKInterface];
            } else if (type !== "checkbox" && value === "") {
                delete newState[name as keyof SuricataDPDKInterface];
            }
            return newState;
        });
    };

    return (
        <div className="flex justify-center items-center">
            <div className="flex flex-col gap-2 w-1/3">
                <div className="">
                    <Label htmlFor="threads">Threads:</Label>
                    <TextInput type="text" id="threads" name="threads" value={state.threads || ""} onChange={handleChange} />
                </div>
                <div className="flex gap-3">
                    <Checkbox id="promisc" name="promisc" checked={state.promisc || false} onChange={handleChange} />
                    <Label htmlFor="promisc">Promiscuous Mode</Label>
                </div>
                <div className="flex gap-3">
                    <Checkbox id="multicast" name="multicast" checked={state.multicast || false} onChange={handleChange} />
                    <Label htmlFor="multicast">Multicast</Label>
                </div>
                <div className="">
                    <Label htmlFor="checksum-checks">Checksum Checks:</Label>
                    <Checkbox id="checksum-checks" name="checksum-checks" checked={state["checksum-checks"] || false} onChange={handleChange} />
                </div>
                <div className="">
                    <Label htmlFor="checksum-checks-offload">Checksum Checks Offload:</Label>
                    <Checkbox
                        id="checksum-checks-offload"
                        name="checksum-checks-offload"
                        checked={state["checksum-checks-offload"] || false}
                        onChange={handleChange}
                    />
                </div>
                <div className="">
                    <Label htmlFor="mtu">MTU:</Label>
                    <TextInput type="number" id="mtu" name="mtu" value={state.mtu || ""} onChange={handleChange} />
                </div>
                <div className="">
                    <Label htmlFor="mempool-size">Mempool Size:</Label>
                    <TextInput type="number" id="mempool-size" name="mempool-size" value={state["mempool-size"] || ""} onChange={handleChange} />
                </div>
                <div className="">
                    <Label htmlFor="mempool-cache-size">Mempool Cache Size:</Label>
                    <TextInput
                        type="text"
                        id="mempool-cache-size"
                        name="mempool-cache-size"
                        value={state["mempool-cache-size"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="">
                    <Label htmlFor="rx-descriptors">RX Descriptors:</Label>
                    <TextInput
                        type="number"
                        id="rx-descriptors"
                        name="rx-descriptors"
                        value={state["rx-descriptors"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="">
                    <Label htmlFor="tx-descriptors">TX Descriptors:</Label>
                    <TextInput
                        type="number"
                        id="tx-descriptors"
                        name="tx-descriptors"
                        value={state["tx-descriptors"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="">
                    <Label htmlFor="copy-mode">Copy Mode:</Label>
                    <Select id="copy-mode" name="copy-mode" value={state["copy-mode"] || ""} onChange={handleChange}>
                        <option value="">Select Copy Mode</option>
                        <option value="none">None</option>
                        <option value="tap">TAP</option>
                        <option value="ips">IPS</option>
                    </Select>
                </div>
                <div className="">
                    <Label htmlFor="copy-iface">Copy Interface:</Label>
                    <TextInput type="text" id="copy-iface" name="copy-iface" value={state["copy-iface"] || ""} onChange={handleChange} />
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

export default DpdkInterface;
