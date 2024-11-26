import React, { act, useState } from "react";
import { SuricataRule } from "../../types/SuricataRule";
import { Button, TextInput, Select } from "flowbite-react";
import RuleOptions from "./RuleOptions";
interface RuleFormProps {
    addRule: (rule: SuricataRule) => Promise<void>;
}

const RuleForm: React.FC<RuleFormProps> = ({ addRule }) => {
    const [rule, setRule] = useState<SuricataRule>({
        action: "",
        protocol: "",
        source: "",
        source_port: "",
        direction: "",
        destination: "",
        destination_port: "",
        options: {},
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Select
                name="action"
                value={rule.action}
                onChange={handleChange}
                required
            >
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
                name="protocol"
                value={rule.protocol}
                onChange={handleChange}
                placeholder="Protocol"
                required
            />
            <TextInput
                name="source"
                value={rule.source}
                onChange={handleChange}
                placeholder="Source"
                required
            />
            <TextInput
                name="source_port"
                value={rule.source_port}
                onChange={handleChange}
                placeholder="Source Port"
                required
            />
            <Select
                name="direction"
                value={rule.direction}
                onChange={handleChange}
                required
            >
                <option value="">Select Direction</option>
                <option value="->">{"to"}</option>
                <option value="<-">{"from"}</option>
                <option value="<>">{"both"}</option>
            </Select>
            <TextInput
                name="destination"
                value={rule.destination}
                onChange={handleChange}
                placeholder="Destination"
                required
            />
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
    );
};

export default RuleForm;
