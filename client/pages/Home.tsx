import React, { useEffect, useMemo, useState } from "react";
import { useEve } from "../Providers/EveProvider";
import { EveLog } from "../components/EveLog";
import { Button, TextInput } from "flowbite-react";
import { FilterSelect, SelectFrom } from "../components/FilterSelect";

const Home: React.FC = () => {
    const MAX_LOG = 100000;

    const { EveLogs, eventTypes, interfaces, sourceIps, sourcePorts, destIps, destPorts, protocols, setSearch, filteredLogs } = useEve();

    const [ascending, setAscending] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage, setLogsPerPage] = useState(50);

    const memoizedFilteredLogs = useMemo(() => {
        const sortedLogs = [...filteredLogs].sort((a, b) => {
            if (ascending) {
                return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            } else {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            }
        });
        return sortedLogs.slice(0, MAX_LOG);
    }, [filteredLogs, ascending]);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * logsPerPage;
        const endIndex = startIndex + logsPerPage;
        return memoizedFilteredLogs.slice(startIndex, endIndex);
    }, [memoizedFilteredLogs, currentPage, logsPerPage]);

    useEffect(() => {
        setSearch({
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
    }, []);

    const totalPages = Math.ceil(memoizedFilteredLogs.length / logsPerPage);

    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="flex-1 justify-start flex-col gap-1">
                <div className="flex justify-between items-center bg-gray-200 p-2">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Suricata EVE Logs</h1>
                    <div className="flex gap-2">
                        <span className="text-gray-800 dark:text-white">Events: {EveLogs.length}</span>
                        <span className="text-gray-800 dark:text-white">Event Types: {eventTypes.length}</span>
                        <span className="text-gray-800 dark:text-white">Interfaces: {interfaces.length}</span>
                        <span className="text-gray-800 dark:text-white">Source IPs: {sourceIps.length}</span>
                        <span className="text-gray-800 dark:text-white">Destination IPs: {destIps.length}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center bg-gray-200 p-2 gap-1 flex-wrap">
                    <FilterSelect label="Interfaces" options={interfaces} onChange={(value: string) => setSearch({ interface: value })} />
                    <FilterSelect label="Event Type" options={eventTypes} onChange={(value: string) => setSearch({ eventType: value })} />
                    <FilterSelect label="Protocol" options={protocols} onChange={(value: string) => setSearch({ protocol: value })} />
                    <FilterSelect label="Source IP" options={sourceIps} onChange={(value: string) => setSearch({ sourceIp: value })} />
                    <FilterSelect label="Source Port" options={sourcePorts} onChange={(value: string) => setSearch({ sourcePort: value })} />
                    <FilterSelect label="Destination IP" options={destIps} onChange={(value: string) => setSearch({ destIp: value })} />
                    <FilterSelect label="Destination Port" options={destPorts} onChange={(value: string) => setSearch({ destPort: value })} />
                    <div className="flex gap-3 p-2">
                        <TextInput
                            className="text-gray-800 dark:text-white"
                            type="search"
                            onChange={(e) => setSearch({ search: e.target.value })}
                            placeholder="Search (Regex)"
                        />
                        <TextInput
                            className="text-gray-800 dark:text-white"
                            type="search"
                            onChange={(e) => setSearch({ inverseSearch: e.target.value })}
                            placeholder="Inverse Search (Regex)"
                        />
                    </div>
                    <div className="flex justify-center items-center gap-3">
                        <label className="text-gray-800 dark:text-white">Time Range</label>
                        <TextInput
                            className="text-gray-800 dark:text-white"
                            onChange={(e) => setSearch({ startTime: e.target.value })}
                            type="datetime-local"
                            placeholder="Start Time"
                        />
                        <TextInput
                            className="text-gray-800 dark:text-white"
                            onChange={(e) => setSearch({ endTime: e.target.value })}
                            type="datetime-local"
                            placeholder="End Time"
                        />
                    </div>

                    <Button className="text-gray-800 dark:text-white" onClick={() => setAscending(!ascending)}>
                        {ascending ? "Ascending" : "Descending"}
                    </Button>
                </div>
                <div className="flex justify-center items-center mt-4 gap-6">
                    <Button
                        className="text-gray-800 dark:text-white"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-gray-800 dark:text-white">
                        Page {currentPage} of {totalPages}
                    </span>

                    <Button
                        className="text-gray-800 dark:text-white"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                    <div className="items-end">
                        <SelectFrom
                            label="Logs Per Page"
                            options={["10", "50", "100", "500", "1000", "5000", "10000"]}
                            onChange={(value: string) => setLogsPerPage(parseInt(value))}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2 p-2">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white dark:bg-gray-800">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Timestamp</th>
                                    <th className="px-4 py-2">Interface</th>
                                    <th className="px-4 py-2">Event Type</th>
                                    <th className="px-4 py-2">Source IP</th>
                                    <th className="px-4 py-2">Source Port</th>
                                    <th className="px-4 py-2">Dest IP</th>
                                    <th className="px-4 py-2">Dest Port</th>
                                    <th className="px-4 py-2">Protocol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLogs.map((log, i) => (
                                    <EveLog key={i} log={log} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
