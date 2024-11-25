import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
    useRef,
    useCallback,
} from "react";
import { SuricataEveLog } from "../../types/EveLogs";
import debounce from "lodash.debounce";

interface EveContextProps {
    EveLogs: SuricataEveLog[];
    eventTypes: string[];
    interfaces: string[];
    sourceIps: string[];
    sourcePorts: string[];
    destIps: string[];
    destPorts: string[];
    protocols: string[];
    setSearch: (param: {
        eventType?: string;
        interface?: string;
        sourceIp?: string;
        sourcePort?: string;
        destIp?: string;
        destPort?: string;
        protocol?: string;
        startTime?: string;
        endTime?: string;
        search?: string;
    }) => void;
    filteredLogs: SuricataEveLog[];
    // filterLogs: (filters: {
    //     eventType?: string;
    //     interface?: string;
    //     sourceIp?: string;
    //     sourcePort?: string;
    //     destIp?: string;
    //     destPort?: string;
    //     protocol?: string;
    //     startTime?: string;
    //     endTime?: string;
    //     search?: string;
    // }) => void;
}

const EveContext = createContext<EveContextProps | undefined>(undefined);

export const EveProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [EveLogs, setEveLogs] = useState<SuricataEveLog[]>([]);
    const logsRef = useRef<SuricataEveLog[]>([]);
    const [eventTypes, setEventTypes] = useState<Set<string>>(new Set());
    const [interfaces, setInterfaces] = useState<Set<string>>(new Set());
    const [sourceIps, setSourceIps] = useState<Set<string>>(new Set());
    const [sourcePorts, setSourcePorts] = useState<Set<string>>(new Set());
    const [destIps, setDestIps] = useState<Set<string>>(new Set());
    const [destPorts, setDestPorts] = useState<Set<string>>(new Set());
    const [protocols, setProtocols] = useState<Set<string>>(new Set());

    const [searchParam, setSearchParam] = useState<{
        eventType?: string;
        interface?: string;
        sourceIp?: string;
        sourcePort?: string;
        destIp?: string;
        destPort?: string;
        protocol?: string;
        startTime?: string;
        endTime?: string;
        search?: string;
    }>({
        eventType: "",
        interface: "",
        sourceIp: "",
        sourcePort: "",
        destIp: "",
        destPort: "",
        protocol: "",
        startTime: "",
        endTime: "",
    });

    const [filteredLogs, setFilteredLogs] = useState<SuricataEveLog[]>([]);
    const filterLogs = useCallback(
        debounce(
            (filters: {
                eventType?: string;
                interface?: string;
                sourceIp?: string;
                sourcePort?: string;
                destIp?: string;
                destPort?: string;
                protocol?: string;
                startTime?: string;
                endTime?: string;
                search?: string;
            }) => {
                const regex = filters.search
                    ? new RegExp(filters.search, "i")
                    : null;
                setFilteredLogs(
                    logsRef.current.filter((log) => {
                        const logTime = new Date(log.timestamp).getTime();
                        const startTime = filters.startTime
                            ? new Date(filters.startTime).getTime()
                            : null;
                        const endTime = filters.endTime
                            ? new Date(filters.endTime).getTime()
                            : null;

                        return (
                            (!filters.eventType ||
                                log.event_type === filters.eventType) &&
                            (!filters.interface ||
                                log.in_iface === filters.interface) &&
                            (!filters.sourceIp ||
                                log.src_ip === filters.sourceIp) &&
                            (!filters.sourcePort ||
                                (log.src_port &&
                                    log.src_port ===
                                        parseInt(filters.sourcePort))) &&
                            (!filters.destIp ||
                                log.dest_ip === filters.destIp) &&
                            (!filters.destPort ||
                                log.dest_port === parseInt(filters.destPort)) &&
                            (!filters.protocol ||
                                log.proto === filters.protocol) &&
                            (!startTime || logTime >= startTime) &&
                            (!endTime || logTime <= endTime) &&
                            (!regex || regex.test(JSON.stringify(log)))
                        );
                    })
                );
            },
            300
        ),
        [logsRef, searchParam]
    );
    const setSearch = useCallback(
        (param: {
            eventType?: string;
            interface?: string;
            sourceIp?: string;
            sourcePort?: string;
            destIp?: string;
            destPort?: string;
            protocol?: string;
            startTime?: string;
            endTime?: string;
            search?: string;
        }) => {
            let newParam = { ...searchParam, ...param };
            setSearchParam((prev) => ({ ...prev, ...param }));
            filterLogs(newParam);
        },
        [filterLogs]
    );

    useEffect(() => {
        const getInitalLogs = async () => {
            const response = await fetch("/api/eve");
            const logs = await response.json();
            logsRef.current = logs;
            setEveLogs((prev) => [...prev, ...logs]);
            setFilteredLogs((prev) => [...prev, ...logs]);
            const newEventTypes = new Set(eventTypes);
            const newInterfaces = new Set(interfaces);
            const newSourceIps = new Set(sourceIps);
            const newSourcePorts = new Set(sourcePorts);
            const newDestIps = new Set(destIps);
            const newDestPorts = new Set(destPorts);
            const newProtocols = new Set(protocols);

            logs.forEach((log: SuricataEveLog) => {
                if (log.event_type !== undefined)
                    newEventTypes.add(log.event_type.trim());
                if (log.in_iface !== undefined)
                    newInterfaces.add(log.in_iface.trim());
                if (log.src_ip !== undefined)
                    newSourceIps.add(log.src_ip.trim());
                if (log.src_port !== undefined)
                    newSourcePorts.add(log.src_port.toString());
                if (log.dest_ip !== undefined)
                    newDestIps.add(log.dest_ip.trim());
                if (log.dest_port !== undefined)
                    newDestPorts.add(log.dest_port.toString());
                if (log.proto) newProtocols.add(log.proto.trim());
            });

            setEventTypes(newEventTypes);
            setInterfaces(newInterfaces);
            setSourceIps(newSourceIps);
            setSourcePorts(newSourcePorts);
            setDestIps(newDestIps);
            setDestPorts(newDestPorts);
            setProtocols(newProtocols);
        };

        getInitalLogs();
    }, []);
    useEffect(() => {
        const eventSource = new EventSource("/api/eve/stream");
        const handleEvent = (event: MessageEvent) => {
            const newEvent: SuricataEveLog = JSON.parse(event.data);
            logsRef.current = [newEvent, ...logsRef.current];
            try {
                setEventTypes((prevTypes) =>
                    newEvent.event_type !== undefined
                        ? new Set(prevTypes).add(newEvent.event_type.trim())
                        : prevTypes
                );
                setInterfaces((prevInterfaces) =>
                    newEvent.in_iface !== undefined
                        ? new Set(prevInterfaces).add(newEvent.in_iface.trim())
                        : prevInterfaces
                );
                setSourceIps((prevIps) =>
                    newEvent.src_ip !== undefined
                        ? new Set(prevIps).add(newEvent.src_ip.trim())
                        : prevIps
                );
                setSourcePorts((prevPorts) =>
                    newEvent.src_port !== undefined
                        ? new Set(prevPorts).add(newEvent.src_port.toString())
                        : prevPorts
                );
                setDestIps((prevIps) =>
                    newEvent.dest_ip !== undefined
                        ? new Set(prevIps).add(newEvent.dest_ip.trim())
                        : prevIps
                );
                setDestPorts((prevPorts) =>
                    newEvent.dest_port !== undefined
                        ? new Set(prevPorts).add(newEvent.dest_port.toString())
                        : prevPorts
                );
                setProtocols((prevProto) =>
                    newEvent.proto
                        ? new Set(prevProto).add(newEvent.proto.trim())
                        : prevProto
                );

                setEveLogs((prevLogs) => [newEvent, ...prevLogs]);
                filterLogs(searchParam);
            } catch (error) {
                console.error("Error parsing log:", error);
            }
        };

        eventSource.onmessage = handleEvent;

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <EveContext.Provider
            value={{
                EveLogs,
                eventTypes: Array.from(eventTypes),
                interfaces: Array.from(interfaces),
                sourceIps: Array.from(sourceIps),
                sourcePorts: Array.from(sourcePorts),
                destIps: Array.from(destIps),
                destPorts: Array.from(destPorts),
                protocols: Array.from(protocols),
                setSearch,
                // filterLogs,

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
