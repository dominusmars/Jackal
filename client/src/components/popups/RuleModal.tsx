import React, { useState } from "react";
import { SuricataRule, SuricataEveLog } from "lib";
import { Button, TextInput, Select, Modal } from "flowbite-react";
import RuleOptions from "../RuleOptions";
import { CiCircleInfo, CiSquareInfo } from "react-icons/ci";

interface RuleFormProps {
    addRule: (rule: SuricataRule) => Promise<void>;
    log: SuricataEveLog;
}

const RuleModal: React.FC<RuleFormProps> = ({ addRule, log }) => {
    const [rule, setRule] = useState<SuricataRule>({
        action: "",
        protocol: log.proto || "",
        source: log.src_ip || "",
        source_port: log?.src_port?.toString() || "",
        direction: "",
        destination: log.dest_ip || "",
        destination_port: log?.dest_port?.toString() || "",
        options: {},
    });
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRule((prevRule) => ({
            ...prevRule,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await addRule(rule);
            setIsOpen(false);
        } catch (err: any) {
            setError(err.message);
        }
        setRule({
            action: "",
            protocol: "",
            source: "",
            source_port: "",
            direction: "",
            destination: "",
            destination_port: "",
            options: {},
        });
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Create Rule</Button>
            <Modal show={isOpen} onClose={() => setIsOpen(false)}>
                <Modal.Header>
                    Create Rule{" "}
                    
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Select name="action" value={rule.action} onChange={handleChange} required>
                            <option value="">Select Action</option>
                            <option value="alert">Alert</option>
                            <option value="drop">Drop</option>
                            <option value="pass">Pass</option>
                            <option value="reject">Reject</option>
                            <option value="rejectsrc">Reject Source</option>
                            <option value="rejectdst">Reject Destination</option>
                            <option value="rejectboth">Reject Both</option>
                        </Select>
                        <TextInput
                            name="msg"
                            value={(rule.options["msg"] as string) || ""}
                            onChange={(e) => {
                                setRule((prevRule) => ({
                                    ...prevRule,
                                    options: { ...prevRule.options, msg: e.target.value },
                                }));
                            }}
                            placeholder="Message"
                            required
                        />
                        <TextInput name="protocol" value={rule.protocol} onChange={handleChange} placeholder="Protocol" required />
                        <TextInput name="source" value={rule.source} onChange={handleChange} placeholder="Source" required />
                        <TextInput name="source_port" value={rule.source_port} onChange={handleChange} placeholder="Source Port" required />
                        <Select name="direction" value={rule.direction} onChange={handleChange} required>
                            <option value="">Select Direction</option>
                            <option value="->">{"to"}</option>
                            <option value="<-">{"from"}</option>
                            <option value="<>">{"both"}</option>
                        </Select>
                        <TextInput name="destination" value={rule.destination} onChange={handleChange} placeholder="Destination" required />
                        <TextInput
                            name="destination_port"
                            value={rule.destination_port}
                            onChange={handleChange}
                            placeholder="Destination Port"
                            required
                        />
                        <RuleOptions
                            options={rule.options}
                            setOptions={(options) =>
                                setRule((prevRule) => ({
                                    ...prevRule,
                                    options: { ...options },
                                }))
                            }
                        />
                        {error && <p className="text-red-500">{error}</p>}
                        <Button type="submit">Create Rule</Button>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                <Button href="https://docs.suricata.io/en/latest/rules/intro.html" target="_blank">
                        <CiCircleInfo className="mr-3 h-4 w-4" />
                        More Info
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default RuleModal;
