import React, { useState, useEffect } from "react";

interface Rule {
    id: number;
    content: string;
}

const Rules: React.FC = () => {
    const [rules, setRules] = useState<Rule[]>([]);
    const [newRule, setNewRule] = useState<string>("");

    useEffect(() => {
        // Fetch rules from an API or local storage
        const fetchRules = async () => {
            // Replace with your API call
            const response = await fetch("/api/rules");
            const data = await response.json();
            setRules(data);
        };

        fetchRules();
    }, []);

    const addRule = async () => {
        if (newRule.trim() === "") return;

        // Replace with your API call
        const response = await fetch("/api/rules", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: newRule }),
        });

        const data = await response.json();
        setRules([...rules, data]);
        setNewRule("");
    };

    const deleteRule = async (id: number) => {
        // Replace with your API call
        await fetch(`/api/rules/${id}`, {
            method: "DELETE",
        });

        setRules(rules.filter((rule) => rule.id !== id));
    };

    return (
        <div>
            <h1>Suricata Rules</h1>
            <ul>
                {rules.map((rule) => (
                    <li key={rule.id}>
                        {rule.content}
                        <button onClick={() => deleteRule(rule.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <input type="text" value={newRule} onChange={(e) => setNewRule(e.target.value)} placeholder="Add new rule" />
            <button onClick={addRule}>Add Rule</button>
        </div>
    );
};

export default Rules;
