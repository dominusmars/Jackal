import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { SuricataEveLog } from "lib";
import debounce from "lodash.debounce";
import { set } from "date-fns";

interface EveContextProps {
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
        inverseSearch?: string;
    }) => void;
    pauseLogs: (pause: boolean) => void;
    filteredLogs: SuricataEveLog[];
    EveLogs: SuricataEveLog[];
    isPaused: boolean;
}

const EveContext = createContext<EveContextProps | undefined>(undefined);

export const EveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const logsRef = useRef<SuricataEveLog[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const paused = useRef(false);
    const pausedLogs = useRef<SuricataEveLog[]>([]);
    const pauseLogs = (pause: boolean) => {
        setIsPaused(pause);
        paused.current = pause;
        if (!pause) {
            logsRef.current = [...pausedLogs.current, ...logsRef.current];
            pausedLogs.current = [];
        }
    };

    const [filters, setFilters] = useState({
        eventTypes: new Set<string>(),
        interfaces: new Set<string>(),
        sourceIps: new Set<string>(),
        sourcePorts: new Set<string>(),
        destIps: new Set<string>(),
        destPorts: new Set<string>(),
        protocols: new Set<string>(),
    });
    const searchRef = useRef<{
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
        inverseSearch?: string;
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
        search: "",
        inverseSearch: "",
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
                inverseSearch?: string;
            }) => {
                const regex = filters.search && filters.search != "" ? new RegExp(filters.search, "i") : null;
                const regexInverse = filters.inverseSearch && filters.inverseSearch != "" ? new RegExp(filters.inverseSearch, "i") : null;
                setFilteredLogs(
                    logsRef.current.filter((log) => {
                        const logTime = new Date(log.timestamp).getTime();
                        const startTime = filters.startTime ? new Date(filters.startTime).getTime() : null;
                        const endTime = filters.endTime ? new Date(filters.endTime).getTime() : null;
                        // might want to append text to log to stop needing to stringify every time
                        let stringify = JSON.stringify(log);
                        return (
                            (!filters.eventType || log.event_type === filters.eventType) &&
                            (!filters.interface || log.in_iface === filters.interface) &&
                            (!filters.sourceIp || log.src_ip === filters.sourceIp) &&
                            (!filters.sourcePort || (log.src_port && log.src_port === parseInt(filters.sourcePort))) &&
                            (!filters.destIp || log.dest_ip === filters.destIp) &&
                            (!filters.destPort || log.dest_port === parseInt(filters.destPort)) &&
                            (!filters.protocol || log.proto === filters.protocol) &&
                            (!startTime || logTime >= startTime) &&
                            (!endTime || logTime <= endTime) &&
                            (!regex || regex.test(stringify)) &&
                            (!regexInverse || !regexInverse.test(stringify))
                        );
                    })
                );
            },
            300
        ),
        [logsRef.current, searchRef.current]
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
            inverseSearch?: string;
        }) => {
            searchRef.current = { ...searchRef.current, ...param };
            filterLogs(searchRef.current);
        },
        [filterLogs]
    );

    useEffect(() => {
        const getInitialLogs = async () => {
            const response = await fetch("/api/eve");
            const logs = await response.json();
            logsRef.current = logs;
            const newEventTypes = new Set(filters.eventTypes);
            const newInterfaces = new Set(filters.interfaces);
            const newSourceIps = new Set(filters.sourceIps);
            const newSourcePorts = new Set(filters.sourcePorts);
            const newDestIps = new Set(filters.destIps);
            const newDestPorts = new Set(filters.destPorts);
            const newProtocols = new Set(filters.protocols);

            logs.forEach((log: SuricataEveLog) => {
                if (log.event_type !== undefined) newEventTypes.add(log.event_type.trim());
                if (log.in_iface !== undefined) newInterfaces.add(log.in_iface.trim());
                if (log.src_ip !== undefined) newSourceIps.add(log.src_ip.trim());
                if (log.src_port !== undefined) newSourcePorts.add(log.src_port.toString());
                if (log.dest_ip !== undefined) newDestIps.add(log.dest_ip.trim());
                if (log.dest_port !== undefined) newDestPorts.add(log.dest_port.toString());
                if (log.proto) newProtocols.add(log.proto.trim());
            });
            setFilters({
                eventTypes: newEventTypes,
                interfaces: newInterfaces,
                sourceIps: newSourceIps,
                sourcePorts: newSourcePorts,
                destIps: newDestIps,
                destPorts: newDestPorts,
                protocols: newProtocols,
            });
            setSearch(searchRef.current);
        };

        getInitialLogs();
    }, []);

    useEffect(() => {
        const eventSource = new EventSource("/api/eve/stream");
        const handleEvent = (event: MessageEvent) => {
            const newEvent: SuricataEveLog = JSON.parse(event.data);

            if (paused.current) {
                pausedLogs.current = [newEvent, ...pausedLogs.current];
                return;
            } else if (pausedLogs.current.length > 0) {
                logsRef.current = [...pausedLogs.current, ...logsRef.current];
                pausedLogs.current = [];
            }

            logsRef.current = [newEvent, ...logsRef.current];
            try {
                setFilters((prevFilters) => {
                    const newEventTypes = new Set(prevFilters.eventTypes);
                    const newInterfaces = new Set(prevFilters.interfaces);
                    const newSourceIps = new Set(prevFilters.sourceIps);
                    const newSourcePorts = new Set(prevFilters.sourcePorts);
                    const newDestIps = new Set(prevFilters.destIps);
                    const newDestPorts = new Set(prevFilters.destPorts);
                    const newProtocols = new Set(prevFilters.protocols);

                    if (newEvent.event_type !== undefined) newEventTypes.add(newEvent.event_type.trim());
                    if (newEvent.in_iface !== undefined) newInterfaces.add(newEvent.in_iface.trim());
                    if (newEvent.src_ip !== undefined) newSourceIps.add(newEvent.src_ip.trim());
                    if (newEvent.src_port !== undefined) newSourcePorts.add(newEvent.src_port.toString());
                    if (newEvent.dest_ip !== undefined) newDestIps.add(newEvent.dest_ip.trim());
                    if (newEvent.dest_port !== undefined) newDestPorts.add(newEvent.dest_port.toString());
                    if (newEvent.proto) newProtocols.add(newEvent.proto.trim());

                    return {
                        eventTypes: newEventTypes,
                        interfaces: newInterfaces,
                        sourceIps: newSourceIps,
                        sourcePorts: newSourcePorts,
                        destIps: newDestIps,
                        destPorts: newDestPorts,
                        protocols: newProtocols,
                    };
                });

                setSearch(searchRef.current);
            } catch (error) {
                console.error("Error parsing log:", error);
            }
        };

        eventSource.onmessage = handleEvent;

        return () => {
            eventSource.close();
        };
    }, [isPaused]);

    return (
        <EveContext.Provider
            value={{
                EveLogs: logsRef.current,
                eventTypes: Array.from(filters.eventTypes),
                interfaces: Array.from(filters.interfaces),
                sourceIps: Array.from(filters.sourceIps),
                sourcePorts: Array.from(filters.sourcePorts),
                destIps: Array.from(filters.destIps),
                destPorts: Array.from(filters.destPorts),
                protocols: Array.from(filters.protocols),
                setSearch,
                pauseLogs,
                isPaused,
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
