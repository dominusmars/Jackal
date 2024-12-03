import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { SuricataEveFilter, SuricataEveLog, SuricataEveSearch } from "lib";
import debounce from "lodash.debounce";
import { throttle } from "lodash";
interface EveContextProps {
    eventTypes: string[];
    interfaces: string[];
    sourceIps: string[];
    sourcePorts: string[];
    destIps: string[];
    destPorts: string[];
    protocols: string[];
    setSearch: (param: SuricataEveSearch, queryDb: boolean) => void;
    pauseLogs: (pause: boolean) => void;
    filteredLogs: SuricataEveLog[];
    EveLogs: SuricataEveLog[];
    isPaused: boolean;
    loading: boolean;
}

const EveContext = createContext<EveContextProps | undefined>(undefined);
export const EveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const MAX_LOGS = 10000;
    const logsRef = useRef<SuricataEveLog[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const paused = useRef(false);
    const pausedLogs = useRef<SuricataEveLog[]>([]);
    const [loading, setLoading] = useState(false);

    const pauseLogs = (pause: boolean) => {
        setIsPaused(pause);
        paused.current = pause;
        if (!pause) {
            logsRef.current = [...pausedLogs.current, ...logsRef.current];
            pausedLogs.current = [];
        }
    };

    const [filters, setFilters] = useState<SuricataEveFilter>({
        eventTypes: [],
        interfaces: [],
        sourceIps: [],
        sourcePorts: [],
        destIps: [],
        destPorts: [],
        protocols: [],
    });
    const searchRef = useRef<SuricataEveSearch>({
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
        debounce(async (filters: SuricataEveSearch, dbQuery: boolean) => {
            const regex = filters.search && filters.search != "" ? new RegExp(filters.search, "i") : null;
            const regexInverse = filters.inverseSearch && filters.inverseSearch != "" ? new RegExp(filters.inverseSearch, "i") : null;
            if (dbQuery) {
                setLoading(true);
                let query = new URLSearchParams({ ...filters }).toString();

                let response = await fetch("/api/eve/query?" + query, {
                    method: "GET",
                });
                if (!response.ok) {
                    console.error("Failed to fetch logs");
                    return;
                }
                let logs = await response.json();
                logsRef.current = logs;
                setLoading(false);
            }
            setFilteredLogs(
                logsRef.current.filter((log) => {
                    const logTime = new Date(log.timestamp).getTime();
                    const startTime = filters.startTime ? new Date(filters.startTime).getTime() : null;
                    const endTime = filters.endTime ? new Date(filters.endTime).getTime() : null;
                    // might want to append text to log to stop needing to stringify every time
                    // DB has full_text field for this, but it might cause performance issues to send it over oppose to stringify the log every time
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
        }, 300),
        [logsRef.current, searchRef.current]
    );
    const setSearch = useCallback(
        (param: SuricataEveSearch, query: boolean) => {
            searchRef.current = { ...searchRef.current, ...param };
            filterLogs(searchRef.current, query);
        },
        [filterLogs]
    );

    useEffect(() => {
        const getInitialLogs = async () => {
            const response = await fetch("/api/eve");
            const logs = await response.json();
            logsRef.current = logs;

            const filterResponse = await fetch("/api/eve/filters");

            if (filterResponse.ok) {
                setFilters(await filterResponse.json());
            }

            setSearch(searchRef.current, false);
        };

        getInitialLogs();
    }, []);
    const debouncedCurrentFilters = useCallback(
        debounce(async () => {
            const newEventTypes = new Set<string>();
            const newInterfaces = new Set<string>();
            const newSourceIps = new Set<string>();
            const newSourcePorts = new Set<string>();
            const newDestIps = new Set<string>();
            const newDestPorts = new Set<string>();
            const newProtocols = new Set<string>();

            logsRef.current.forEach((log) => {
                if (log.event_type !== undefined) newEventTypes.add(log.event_type.trim());
                if (log.in_iface !== undefined) newInterfaces.add(log.in_iface.trim());
                if (log.src_ip !== undefined) newSourceIps.add(log.src_ip.trim());
                if (log.src_port !== undefined) newSourcePorts.add(log.src_port.toString());
                if (log.dest_ip !== undefined) newDestIps.add(log.dest_ip.trim());
                if (log.dest_port !== undefined) newDestPorts.add(log.dest_port.toString());
                if (log.proto !== undefined) newProtocols.add(log.proto.trim());
            });

            setFilters({
                eventTypes: Array.from(newEventTypes).toSorted((a, b) => a.localeCompare(b)),
                interfaces: Array.from(newInterfaces).toSorted((a, b) => a.localeCompare(b)),
                sourceIps: Array.from(newSourceIps).toSorted((a, b) => a.localeCompare(b)),
                sourcePorts: Array.from(newSourcePorts).toSorted((a, b) => a.localeCompare(b)),
                destIps: Array.from(newDestIps).toSorted((a, b) => a.localeCompare(b)),
                destPorts: Array.from(newDestPorts).toSorted((a, b) => a.localeCompare(b)),
                protocols: Array.from(newProtocols).toSorted((a, b) => a.localeCompare(b)),
            });
        }, 300),
        [logsRef.current]
    );

    // updating Current filters to reflect logs
    useEffect(() => {
        const eventSource = new EventSource("/api/eve/stream");

        const eventQueue: SuricataEveLog[] = [];

        // this updates the logsRef with the new logs
        // throttling this function is necessary to maintain performance
        const processQueue = throttle(() => {
            if (eventQueue.length === 0) return;

            const newEvents = [...eventQueue];
            eventQueue.length = 0;

            if (paused.current) {
                pausedLogs.current = [...newEvents, ...pausedLogs.current];
                pausedLogs.current = pausedLogs.current.slice(0, MAX_LOGS);
            } else {
                if (pausedLogs.current.length > 0) {
                    logsRef.current = [...pausedLogs.current, ...logsRef.current];
                    pausedLogs.current.length = 0;
                }
                logsRef.current = [...newEvents, ...logsRef.current];
                logsRef.current = logsRef.current.slice(0, MAX_LOGS);
                debouncedCurrentFilters();
                setSearch(searchRef.current, false);
            }
        }, 500);

        const handleEvent = (event: MessageEvent) => {
            try {
                const newEvent: SuricataEveLog = JSON.parse(event.data);
                eventQueue.push(newEvent);
                processQueue();
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
                EveLogs: logsRef.current,
                eventTypes: filters.eventTypes || [],
                interfaces: filters.interfaces || [],
                sourceIps: filters.sourceIps || [],
                sourcePorts: filters.sourcePorts || [],
                destIps: filters.destIps || [],
                destPorts: filters.destPorts || [],
                protocols: filters.protocols || [],
                setSearch,
                pauseLogs,
                isPaused,
                filteredLogs,
                loading,
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
