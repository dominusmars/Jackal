import React, { createContext, useState, useContext, ReactNode } from "react";
import { SuricataRule } from "../../types/SuricataRule";

interface RulesContextType {
    rules: SuricataRule[];
    addRule: (rule: SuricataRule) => Promise<void>;
    removeRule: (rule: SuricataRule) => Promise<void>;
}

const RulesContext = createContext<RulesContextType | undefined>(undefined);

export const RulesProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [rules, setRules] = useState<SuricataRule[]>([]);

    const addRule = async (rule: SuricataRule) => {
        let response = await fetch("/api/rules", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(rule),
        });
        if (!response.ok) {
            throw new Error("Failed to add rule");
        }

        setRules((prevRules) => [...prevRules, rule]);
    };

    const removeRule = async (rule: SuricataRule) => {
        setRules((prevRules) => prevRules.filter((r) => r !== rule));
    };

    return (
        <RulesContext.Provider value={{ rules, addRule, removeRule }}>
            {children}
        </RulesContext.Provider>
    );
};

export const useRules = (): RulesContextType => {
    const context = useContext(RulesContext);
    if (context === undefined) {
        throw new Error("useRules must be used within a RulesProvider");
    }
    return context;
};
