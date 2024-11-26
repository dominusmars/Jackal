import React, { useState } from "react";
import { TextInput, Button } from "flowbite-react";

interface RuleOptionsProps {
    options: { [key: string]: string | true };
    setOptions: React.Dispatch<
        React.SetStateAction<{ [key: string]: string | true }>
    >;
}

const RuleOptions: React.FC<RuleOptionsProps> = ({ options, setOptions }) => {
    const [key, setKey] = useState("");
    const [value, setValue] = useState("");

    const handleAddOption = () => {
        if (key && value) {
            setOptions({
                ...options,
                [key]: value,
            });
            setKey("");
            setValue("");
        }
        if (key && !value) {
            setOptions({
                ...options,
                [key]: true,
            });
            setKey("");
            setValue("");
        }
    };

    const handleRemoveOption = (optionKey: string) => {
        const newOptions = { ...options };
        delete newOptions[optionKey];
        setOptions(newOptions);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <TextInput
                    name="optionKey"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Option Key"
                />
                <TextInput
                    name="optionValue"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Option Value"
                />
                <Button onClick={handleAddOption}>Add Option</Button>
            </div>
            <div className="flex flex-col gap-3">
                {Object.entries(options).map(([optionKey, optionValue]) => (
                    <div
                        key={optionKey}
                        className="flex justify-between items-center"
                    >
                        <span>{`${optionKey}: ${optionValue}`}</span>
                        <Button
                            color="failure"
                            onClick={() => handleRemoveOption(optionKey)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RuleOptions;
