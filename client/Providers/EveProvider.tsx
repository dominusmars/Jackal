import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import { SuricataEveLog } from "../../types/EveLogs";

interface EveContextProps {
    EveLogs: SuricataEveLog[];
    eventTypes: string[];
    interfaces: string[];
    sourceIps: string[];
    destIps: string[];
    protocols: string[];
    filteredLogs: SuricataEveLog[];
    filterLogs: (filters: {
        eventType?: string;
        interface?: string;
        sourceIp?: string;
        destIp?: string;
        protocol?: string;
    }) => void;
}

const EveContext = createContext<EveContextProps | undefined>(undefined);

export const EveProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [EveLogs, setEveLogs] = useState<SuricataEveLog[]>([]);
    const logsRef = React.useRef<SuricataEveLog[]>([]);
    const [eventTypes, setEventTypes] = useState<string[]>([]);
    const [interfaces, setInterfaces] = useState<string[]>([]);
    const [sourceIps, setSourceIps] = useState<string[]>([]);
    const [destIps, setDestIps] = useState<string[]>([]);
    const [protocols, setProtocols] = useState<string[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<SuricataEveLog[]>([]);

    const filterLogs = (filters: {
        eventType?: string;
        interface?: string;
        sourceIp?: string;
        destIp?: string;
        protocol?: string;
    }) => {
        setFilteredLogs(
            logsRef.current.filter((log) => {
                return (
                    (!filters.eventType ||
                        log.event_type === filters.eventType) &&
                    (!filters.interface ||
                        log.in_iface === filters.interface) &&
                    (!filters.sourceIp || log.src_ip === filters.sourceIp) &&
                    (!filters.destIp || log.dest_ip === filters.destIp) &&
                    (!filters.protocol || log.proto === filters.protocol)
                );
            })
        );
    };

    useEffect(() => {
        const eventSource = new EventSource("/api/eve");
        eventSource.onmessage = (event) => {
            const newEvent: SuricataEveLog = JSON.parse(event.data);
            logsRef.current = [newEvent, ...logsRef.current];
            if (newEvent.event_type) {
                setEventTypes((prevTypes) =>
                    Array.from(
                        new Set([...prevTypes, newEvent.event_type.trim()])
                    )
                );
            }
            if (newEvent.in_iface) {
                setInterfaces((prevInterfaces) =>
                    Array.from(
                        new Set([...prevInterfaces, newEvent.in_iface.trim()])
                    )
                );
            }
            if (newEvent.src_ip) {
                setSourceIps((prevIps) =>
                    Array.from(new Set([...prevIps, newEvent.src_ip.trim()]))
                );
            }
            if (newEvent.dest_ip) {
                setDestIps((prevIps) =>
                    Array.from(new Set([...prevIps, newEvent.dest_ip.trim()]))
                );
            }
            if (newEvent.proto) {
                let proto = newEvent.proto.trim();
                setProtocols((prevProto) =>
                    Array.from(new Set([...prevProto, proto]))
                );
            }

            setEveLogs((prevLogs) => [newEvent, ...prevLogs]);
        };
        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <EveContext.Provider
            value={{
                EveLogs,
                eventTypes,
                interfaces,
                sourceIps,
                destIps,
                protocols,
                filterLogs,
                filteredLogs,
            }}
        >
            {children}
        </EveContext.Provider>
    );
};

export const useEve = (): EveContextProps => {
    const context = useContext(EveContext);
    if (!context) {
        throw new Error("useEve must be used within an EveProvider");
    }
    return context;
};
