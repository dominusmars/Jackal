import React, { createContext, useContext, useState, ReactNode } from "react";

interface EveContextProps {
    value: string;
    setValue: (value: string) => void;
}

const EveContext = createContext<EveContextProps | undefined>(undefined);

export const EveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [value, setValue] = useState<string>("");

    return <EveContext.Provider value={{ value, setValue }}>{children}</EveContext.Provider>;
};

export const useEve = (): EveContextProps => {
    const context = useContext(EveContext);
    if (!context) {
        throw new Error("useEve must be used within an EveProvider");
    }
    return context;
};
