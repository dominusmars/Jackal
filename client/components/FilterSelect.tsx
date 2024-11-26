import React, { useEffect } from "react";
import { Button, Checkbox, Select, TextInput } from "flowbite-react";

interface FilterSelectProps {
    label: string;
    options: string[];
    onChange: (value: string) => void;
}
interface FilterSelectMultiProps {
    label: string;
    options: string[];
    onChange: (value: string[]) => void;
}
const FilterSelect: React.FC<FilterSelectProps> = ({ label, options, onChange }) => (
    <>
        <TextInput
            list={`${label}-options`}
            className="text-gray-800 dark:text-white p-2 border-s-slate-950 dark:border-s-slate-950"
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
        />
        <datalist id={`${label}-options`}>
            {options.map((option, i) => (
                <option key={i} value={option}>
                    {option}
                </option>
            ))}
        </datalist>
    </>
);
const MultiSelect: React.FC<FilterSelectMultiProps> = ({ label, options, onChange }) => {
    const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
    const [regex, setRegex] = React.useState<string>("");

    useEffect(() => {
        onChange(selectedOptions);
    }, [selectedOptions]);

    const handleSelectAll = () => {
        setSelectedOptions(options);
    };

    const handleRegexSelect = () => {
        try {
            const regexPattern = new RegExp(regex);
            const matchedOptions = options.filter((option) => regexPattern.test(option));
            setSelectedOptions(matchedOptions);
        } catch (e) {
            console.error("Invalid regex pattern");
        }
    };

    return (
        <>
            <label className="block text-gray-700 dark:text-white">{label}</label>
            <div className="flex gap-3 p-2">
                <TextInput
                    className="mt-2 p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={`Type ${label} separated by commas`}
                    onChange={(e) => {
                        const typedOptions = e.target.value.split(",").map((opt) => opt.trim());
                        setSelectedOptions(typedOptions);
                    }}
                />
                <Button className="mt-2 p-2 bg-blue-500 text-white rounded-md" onClick={handleSelectAll}>
                    Select All
                </Button>
                <TextInput
                    className="mt-2 p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="(Regex)"
                    onChange={(e) => setRegex(e.target.value)}
                />
                <Button className="mt-2 p-2 bg-green-500 text-white rounded-md" onClick={handleRegexSelect}>
                    Select by Regex
                </Button>
            </div>
            <Select
                multiple
                value={selectedOptions}
                onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    setSelectedOptions(selected);
                }}
                className="block w-full mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                {options.map((option, i) => (
                    <option key={i} value={option}>
                        {option}
                    </option>
                ))}
            </Select>
        </>
    );
};
export { MultiSelect, FilterSelect };
