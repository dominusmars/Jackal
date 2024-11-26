import React from "react";
import { ExtendedSuricataRule } from "../../types/suricata";
import { useRules } from "../Providers/RulesProvider";
import { Button } from "flowbite-react";
type Props = {
    rule: ExtendedSuricataRule;
};

function Rule({ rule }: Props) {
    const { removeRule } = useRules();
    const [showDetails, setShowDetails] = React.useState(false);
    let direction;
    switch (rule.direction) {
        case "<>":
            direction = "both";
            break;
        case "->":
            direction = "to";
            break;
        case "<-":
            direction = "from";
            break;
        default:
            direction = rule.direction;
    }

    return (
        <>
            <tr
                onClick={() => setShowDetails(!showDetails)}
                className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 ease-in-out transition-all p-5"
            >
                <td className="max-w-6 text-wrap text-center overflow-scroll border px-4 py-2">{rule.action}</td>
                <td className="max-w-6 text-wrap text-center overflow-scroll border px-4 py-2">{rule.protocol}</td>
                <td className="max-w-6 text-wrap text-center overflow-scroll border px-4 py-2">{rule.source}</td>
                <td className="max-w-6 text-wrap text-center overflow-scroll border px-4 py-2">{rule.source_port}</td>
                <td className="max-w-6 text-wrap text-center overflow-scroll border px-4 py-2">{direction}</td>
                <td className="max-w-6 text-wrap text-center overflow-scroll border px-4 py-2">{rule.destination}</td>
                <td className="max-w-6 text-wrap text-center overflow-scroll border px-4 py-2">{rule.destination_port}</td>
                <td className="max-w-6 text-wrap text-center overflow-scroll border px-4 py-2">{rule.options["msg"] || "No Message"}</td>
            </tr>
            {showDetails && ( // Show full rule text
                <tr className="bg-gray-300">
                    <td colSpan={8} className="p-5">
                        <h1 className="text-lg mb-1">Options</h1>
                        <div className="text-gray-700 dark:text-gray-400 mb-2">
                            {Object.entries(rule.options).map(([key, value], i) => (
                                <p key={i}>
                                    <strong>{key}:</strong> {value.toString()}
                                </p>
                            ))}
                        </div>
                        <h3 className="">Full Rule:</h3>

                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">{rule.full_text}</pre>
                        <div className="flex m-4 justify-end">
                            <Button onClick={() => removeRule(rule)}>Remove Rule</Button>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
export default Rule;
