import React, { useState } from "react";
import { SuricataXDPInterface, SuricataInterface } from "lib";
import { TextInput, Checkbox, Select, Button, Label } from "flowbite-react";

interface XDPInterfaceFormProps {
    onSubmit: (xdpInterface: SuricataInterface) => void;
}

const XDPInterfaceForm: React.FC<XDPInterfaceFormProps> = ({ onSubmit }) => {
    const [xdpInterface, setXDPInterface] = useState<SuricataXDPInterface>({
        interface: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setXDPInterface((prevState) => {
            const newState = {
                ...prevState,
                [name as keyof SuricataXDPInterface]: type === "checkbox" ? e.target.checked : value,
            };
            if ((type === "checkbox" && !e.target.checked) || value === "") {
                delete newState[name as keyof SuricataXDPInterface];
            }
            return newState;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(xdpInterface);
    };

    return (
        <div className="flex justify-center items-center">
            <form onSubmit={handleSubmit} className="w-1/3 flex gap-2 flex-col">
                <div>
                    <Label>Interface</Label>
                    <TextInput type="text" name="interface" value={xdpInterface.interface} onChange={handleChange} required />
                </div>
                <div>
                    <Label>Threads</Label>
                    <TextInput type="number" name="threads" value={xdpInterface.threads || ""} onChange={handleChange} />
                </div>
                <div className="flex gap-3">
                    <Checkbox name="disable-promisc" checked={xdpInterface["disable-promisc"] || false} onChange={handleChange} />
                    <Label>Disable Promisc</Label>
                </div>
                <div>
                    <Label>Force XDP Mode</Label>
                    <Select name="force-xdp-mode" value={xdpInterface["force-xdp-mode"] || ""} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="drv">DRV</option>
                        <option value="skb">SKB</option>
                        <option value="none">None</option>
                    </Select>
                </div>
                <div>
                    <Label>Force Bind Mode</Label>
                    <Select name="force-bind-mode" value={xdpInterface["force-bind-mode"] || ""} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="zero">Zero</option>
                        <option value="copy">Copy</option>
                        <option value="none">None</option>
                    </Select>
                </div>
                <div className="flex gap-3">
                    <Checkbox name="mem-unaligned" checked={xdpInterface["mem-unaligned"] || false} onChange={handleChange} />
                    <Label>Mem Unaligned</Label>
                </div>
                <div className="flex gap-3">
                    <Checkbox name="enable-busy-poll" checked={xdpInterface["enable-busy-poll"] || false} onChange={handleChange} />
                    <Label>Enable Busy Poll</Label>
                </div>
                <div>
                    <Label>Busy Poll Time</Label>
                    <TextInput type="number" name="busy-poll-time" value={xdpInterface["busy-poll-time"] || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>Busy Poll Budget</Label>
                    <TextInput type="number" name="busy-poll-budget" value={xdpInterface["busy-poll-budget"] || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>GRO Flush Timeout</Label>
                    <TextInput type="number" name="gro-flush-timeout" value={xdpInterface["gro-flush-timeout"] || ""} onChange={handleChange} />
                </div>
                <div>
                    <Label>NAPI Defer Hard IRQ</Label>
                    <TextInput type="number" name="napi-defer-hard-irq" value={xdpInterface["napi-defer-hard-irq"] || ""} onChange={handleChange} />
                </div>
                <Button type="submit">Submit</Button>
            </form>
        </div>
    );
};

export default XDPInterfaceForm;
