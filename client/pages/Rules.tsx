import React, { useState, useEffect } from "react";
import { useRules } from "../Providers/RulesProvider";
import RuleForm from "../components/RuleForm";
import { Accordion } from "flowbite-react";

const Rules: React.FC = () => {
    const { rules, addRule, removeRule } = useRules();

    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="flex-1 justify-start flex-col gap-1">
                <div className="flex justify-between items-center bg-gray-200 p-2">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Suricata Rules
                    </h1>
                    <div className="flex gap-2">
                        <span className="text-gray-800 dark:text-white">
                            Rules: {rules.length}
                        </span>
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
            </div>
        </div>
    );
};

export default Rules;
