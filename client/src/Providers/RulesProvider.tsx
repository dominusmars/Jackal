import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { ExtendedSuricataRule, SuricataRule } from "lib";

interface RulesContextType {
    rules: ExtendedSuricataRule[];
    addRule: (rule: SuricataRule) => Promise<void>;
    removeRule: (rule: SuricataRule) => Promise<void>;
}

const RulesContext = createContext<RulesContextType | undefined>(undefined);

export const RulesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [rules, setRules] = useState<ExtendedSuricataRule[]>([]);

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
        let addedRule = (await response.json()) as ExtendedSuricataRule;
        setRules((prevRules) => [...prevRules, addedRule]);
    };

    const removeRule = async (rule: SuricataRule) => {
        let response = await fetch("/api/rules", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(rule),
        });
        if (!response.ok) {
            throw new Error("Failed to remove rule");
        }

        setRules((prevRules) => prevRules.filter((r) => r !== rule));
    };

    useEffect(() => {
        const fetchRules = async () => {
            let response = await fetch("/api/rules");
            if (!response.ok) {
                throw new Error("Failed to fetch rules");
            }
            let data = await response.json();
            setRules(data);
        };

        fetchRules();
    }, []);
    return <RulesContext.Provider value={{ rules, addRule, removeRule }}>{children}</RulesContext.Provider>;
};

export const useRules = (): RulesContextType => {
    const context = useContext(RulesContext);
    if (context === undefined) {
        throw new Error("useRules must be used within a RulesProvider");
    }
    return context;
};
