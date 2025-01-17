import React, { useEffect } from "react";
import { Button, Checkbox, Select, TextInput } from "flowbite-react";

interface FilterSelectProps {
    label: string;
    options: string[];
    onChange: (value: string) => void;
    defaultValue?: string;
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
const SelectFrom: React.FC<FilterSelectProps> = ({ label, options, onChange, defaultValue }) => (
    <>
        <label className="block text-gray-700 dark:text-white">{label}</label>
        <Select
            defaultValue={defaultValue}
            className="text-gray-800 dark:text-white p-2 border-s-slate-950 dark:border-s-slate-950"
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((option, i) => (
                <option key={i} value={option}>
                    {option}
                </option>
            ))}
        </Select>
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
            <label className="text-lg block text-gray-700 dark:text-white">{label}</label>
            <div className="flex gap-3 p-2 justify-center items-center">
                <Select
                    multiple
                    value={selectedOptions}
                    onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                        setSelectedOptions(selected);
                    }}
                    className="block max-w-xs mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    {options.map((option, i) => (
                        <option key={i} value={option}>
                            {option}
                        </option>
                    ))}
                </Select>
                <TextInput
                    className="mt-2 p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={`Type ${label} separated by commas`}
                    onChange={(e) => {
                        const typedOptions = e.target.value.split(",").map((opt) => opt.trim());
                        setSelectedOptions(typedOptions);
                    }}
                />
                <Button className="bg-blue-500 text-white" onClick={handleSelectAll}>
                    Select All
                </Button>
                <TextInput
                    className="mt-2 p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="(Regex)"
                    onChange={(e) => setRegex(e.target.value)}
                />
                <Button className="bg-green-500 text-white" onClick={handleRegexSelect}>
                    Select by Regex
                </Button>
            </div>
        </>
    );
};
export { MultiSelect, FilterSelect, SelectFrom };
