import React, { useState } from "react";
import { useRules } from "../Providers/RulesProvider";
import RuleForm from "../components/RuleForm";
import { Accordion } from "flowbite-react";
import Rule from "../components/Rule";

const Rules: React.FC = () => {
    const { rules, addRule } = useRules();
    const [currentPage, setCurrentPage] = useState(1);
    const rulesPerPage = 50;

    // Calculate the current rules to display
    const indexOfLastRule = currentPage * rulesPerPage;
    const indexOfFirstRule = indexOfLastRule - rulesPerPage;
    const currentRules = rules.slice(indexOfFirstRule, indexOfLastRule);

    // Change page
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="flex-1 justify-start flex-col gap-1">
                <div className="flex justify-between items-center bg-gray-200 p-2">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Suricata Rules</h1>

                    <div className="flex gap-2">
                        <span className="text-gray-800 dark:text-white">Rules: {rules.length}</span>
                        <span className="text-yellow-800 dark:text-yellow-200">Not reflective of all rules</span>
                    </div>
                </div>
                <div className="p-4">
                    <Accordion collapseAll>
                        <Accordion.Panel key={""}>
                            <Accordion.Title>Add Rule</Accordion.Title>
                            <Accordion.Content>
                                <RuleForm addRule={addRule} />
                            </Accordion.Content>
                        </Accordion.Panel>
                    </Accordion>
                </div>
                <div className="flex flex-col gap-2 p-2">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white dark:bg-gray-800">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Action</th>
                                    <th className="px-4 py-2">Protocol</th>
                                    <th className="px-4 py-2">Source IP</th>
                                    <th className="px-4 py-2">Source Port</th>
                                    <th className="px-4 py-2">Direction</th>
                                    <th className="px-4 py-2">Destination IP</th>
                                    <th className="px-4 py-2">Destination Port</th>
                                    <th className="px-4 py-2">Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRules.map((rule, i) => (
                                    <Rule key={i} rule={rule} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-center mt-4">
                        <nav>
                            <ul className="flex list-none">
                                {Array.from({ length: Math.ceil(rules.length / rulesPerPage) }, (_, i) => (
                                    <li key={i} className="mx-1">
                                        <button
                                            onClick={() => paginate(i + 1)}
                                            className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-white text-blue-500"}`}
                                        >
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rules;
