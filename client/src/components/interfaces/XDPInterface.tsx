import { SuricataXDPInterface } from "lib";
import React, { useState } from "react";
import { Label, TextInput, Checkbox, Select, Button } from "flowbite-react";

interface XDPInterfaceProps {
    interface_: SuricataXDPInterface;
    saveInterface: (interface_: SuricataXDPInterface) => void;
    deleteInterface: () => void;
}

const XDPInterface: React.FC<XDPInterfaceProps> = ({ interface_, saveInterface, deleteInterface }) => {
    const [state, setState] = useState<SuricataXDPInterface>(interface_);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setState((prevState) => {
            const newState = {
                ...prevState,
                [name as keyof SuricataXDPInterface]: type === "checkbox" ? (e.target as any).checked : value,
            };
            if (type === "checkbox" && !(e.target as any).checked) {
                delete newState[name as keyof SuricataXDPInterface];
            } else if (type !== "checkbox" && value === "") {
                delete newState[name as keyof SuricataXDPInterface];
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
                    <Checkbox id="disable-promisc" name="disable-promisc" checked={state["disable-promisc"] || false} onChange={handleChange} />
                    <Label htmlFor="disable-promisc">Disable Promisc</Label>
                </div>
                <div className="">
                    <Label htmlFor="force-xdp-mode">Force XDP Mode:</Label>
                    <Select id="force-xdp-mode" name="force-xdp-mode" value={state["force-xdp-mode"] || ""} onChange={handleChange}>
                        <option value="">Select XDP Mode</option>
                        <option value="drv">DRV</option>
                        <option value="skb">SKB</option>
                        <option value="none">None</option>
                    </Select>
                </div>
                <div className="">
                    <Label htmlFor="force-bind-mode">Force Bind Mode:</Label>
                    <Select id="force-bind-mode" name="force-bind-mode" value={state["force-bind-mode"] || ""} onChange={handleChange}>
                        <option value="">Select Bind Mode</option>
                        <option value="zero">Zero</option>
                        <option value="copy">Copy</option>
                        <option value="none">None</option>
                    </Select>
                </div>
                <div className="flex gap-3">
                    <Checkbox id="mem-unaligned" name="mem-unaligned" checked={state["mem-unaligned"] || false} onChange={handleChange} />
                    <Label htmlFor="mem-unaligned">Mem Unaligned</Label>
                </div>
                <div className="flex gap-3">
                    <Checkbox id="enable-busy-poll" name="enable-busy-poll" checked={state["enable-busy-poll"] || false} onChange={handleChange} />
                    <Label htmlFor="enable-busy-poll">Enable Busy Poll</Label>
                </div>
                <div className="">
                    <Label htmlFor="busy-poll-time">Busy Poll Time:</Label>
                    <TextInput
                        type="number"
                        id="busy-poll-time"
                        name="busy-poll-time"
                        value={state["busy-poll-time"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="">
                    <Label htmlFor="busy-poll-budget">Busy Poll Budget:</Label>
                    <TextInput
                        type="number"
                        id="busy-poll-budget"
                        name="busy-poll-budget"
                        value={state["busy-poll-budget"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="">
                    <Label htmlFor="gro-flush-timeout">GRO Flush Timeout:</Label>
                    <TextInput
                        type="number"
                        id="gro-flush-timeout"
                        name="gro-flush-timeout"
                        value={state["gro-flush-timeout"] || ""}
                        onChange={handleChange}
                    />
                </div>
                <div className="">
                    <Label htmlFor="napi-defer-hard-irq">NAPI Defer Hard IRQ:</Label>
                    <TextInput
                        type="number"
                        id="napi-defer-hard-irq"
                        name="napi-defer-hard-irq"
                        value={state["napi-defer-hard-irq"] || ""}
                        onChange={handleChange}
                    />
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

export default XDPInterface;
