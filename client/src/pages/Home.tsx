import React, { useEffect, useMemo, useState } from "react";
import { useEve } from "../Providers/EveProvider";
import { EveLog } from "../components/EveLog";
import { Button, Spinner, TextInput } from "flowbite-react";
import { FilterSelect, SelectFrom } from "../components/FilterSelect";
import PageTitle from "../components/PageTitle";

const Home: React.FC = () => {
    const {
        EveLogs,
        eventTypes,
        interfaces,
        sourceIps,
        sourcePorts,
        destIps,
        destPorts,
        protocols,
        setSearch,
        filteredLogs,
        isPaused,
        pauseLogs,
        loading,
    } = useEve();

    const [ascending, setAscending] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage, setLogsPerPage] = useState(25);

    const memoizedFilteredLogs = useMemo(() => {
        const sortedLogs = [...filteredLogs].sort((a, b) => {
            if (ascending) {
                return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            } else {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            }
        });
        return sortedLogs;
    }, [filteredLogs, ascending]);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * logsPerPage;
        const endIndex = startIndex + logsPerPage;
        return memoizedFilteredLogs.slice(startIndex, endIndex);
    }, [memoizedFilteredLogs, currentPage, logsPerPage]);

    useEffect(() => {
        setSearch(
            {
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
            },
            false
        );
    }, []);

    const totalPages = Math.ceil(memoizedFilteredLogs.length / logsPerPage);

    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="flex-1 justify-center flex-col gap-1">
                <PageTitle
                    title="Suricata Eve Logs"
                    stats={[
                        {
                            info: `Events: ${EveLogs.length}`,
                        },
                        {
                            info: `Event Types: ${eventTypes.length}`,
                        },
                        {
                            info: `Interfaces: ${interfaces.length}`,
                        },
                        {
                            info: `Source IPs: ${sourceIps.length}`,
                        },
                        {
                            info: `Destination IPs: ${destIps.length}`,
                        },
                    ]}
                />

                <div className="flex justify-between items-center bg-gray-200 p-2 gap-1 flex-wrap">
                    <FilterSelect label="Interfaces" options={interfaces} onChange={(value: string) => setSearch({ interface: value }, true)} />
                    <FilterSelect label="Event Type" options={eventTypes} onChange={(value: string) => setSearch({ eventType: value }, true)} />
                    <FilterSelect label="Protocol" options={protocols} onChange={(value: string) => setSearch({ protocol: value }, true)} />
                    <FilterSelect label="Source IP" options={sourceIps} onChange={(value: string) => setSearch({ sourceIp: value }, true)} />
                    <FilterSelect label="Source Port" options={sourcePorts} onChange={(value: string) => setSearch({ sourcePort: value }, true)} />
                    <FilterSelect label="Destination IP" options={destIps} onChange={(value: string) => setSearch({ destIp: value }, true)} />
                    <FilterSelect label="Destination Port" options={destPorts} onChange={(value: string) => setSearch({ destPort: value }, true)} />
                    <div className="flex gap-3 p-2">
                        <TextInput
                            className="text-gray-800 dark:text-white"
                            type="search"
                            onChange={(e) => setSearch({ search: e.target.value }, true)}
                            placeholder="Search (Regex)"
                        />
                        <TextInput
                            className="text-gray-800 dark:text-white"
                            type="search"
                            onChange={(e) => setSearch({ inverseSearch: e.target.value }, true)}
                            placeholder="Inverse Search (Regex)"
                        />
                    </div>
                    <div className="flex justify-center items-center gap-3">
                        <label className="text-gray-800 dark:text-white">Time Range</label>
                        <TextInput
                            className="text-gray-800 dark:text-white"
                            onChange={(e) => setSearch({ startTime: e.target.value }, true)}
                            type="datetime-local"
                            datatype="datetime-local"
                            placeholder="Start Time"
                        />
                        <TextInput
                            className="text-gray-800 dark:text-white"
                            onChange={(e) => setSearch({ endTime: e.target.value }, true)}
                            type="datetime-local"
                            datatype="datetime-local"
                            placeholder="End Time"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button
                            color={isPaused ? "green" : "red"}
                            className={`text-gray-800 dark:text-white}`}
                            onClick={() => {
                                let pause = !isPaused;
                                pauseLogs(pause);
                            }}
                        >
                            {isPaused ? "Unpause Live" : "Pause Live"}
                        </Button>
                        <Button className="text-gray-800 dark:text-white" onClick={() => setAscending(!ascending)}>
                            {ascending ? "Ascending" : "Descending"}
                        </Button>
                    </div>
                </div>
                <div className="flex gap-6 justify-center items-center mt-4">
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
                            options={["25", "50", "100", "500", "1000", "5000", "10000"]}
                            onChange={(value: string) => setLogsPerPage(parseInt(value))}
                        />
                    </div>
                    {loading && <Spinner>Loading...</Spinner>}
                </div>
                <div className="">
                    <table className="w-full bg-white dark:bg-gray-800">
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
                                <th className="px-4 py-2">Tag</th>
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
    );
};

export default Home;
