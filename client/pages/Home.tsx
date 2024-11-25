import React, { useMemo } from "react";
import { useEve } from "../Providers/EveProvider";
import { EveLog } from "../components/EveLog";
import { Button, TextInput } from "flowbite-react";
interface FilterSelectProps {
    label: string;
    options: string[];
    onChange: (value: string) => void;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
    label,
    options,
    onChange,
}) => (
    <>
        <TextInput
            list={`${label}-options`}
            className="text-gray-800 dark:text-white p-2 border-s-slate-950 dark:border-s-slate-950"
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
        />
        <datalist id={`${label}-options`}>
            {options.map((option, i) => (
                <option key={i} value={option}>
                    {option}
                </option>
            ))}
        </datalist>
    </>
);

const Home: React.FC = () => {
    const MAX_LOG = 500;

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
    } = useEve();

    const [ascending, setAscending] = React.useState(true);
    const memoizedFilteredLogs = useMemo(() => {
        const sortedLogs = [...filteredLogs].sort((a, b) => {
            if (ascending) {
                return (
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                );
            } else {
                return (
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                );
            }
        });
        return sortedLogs.slice(0, MAX_LOG);
    }, [filteredLogs, ascending]);

    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="flex-1 justify-start flex-col gap-1">
                <div className="flex justify-between items-center bg-gray-200 p-2">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Suricata EVE Logs
                    </h1>
                    <div className="flex gap-2">
                        <span className="text-gray-800 dark:text-white">
                            Events: {EveLogs.length}
                        </span>
                        <span className="text-gray-800 dark:text-white">
                            Event Types: {eventTypes.length}
                        </span>
                        <span className="text-gray-800 dark:text-white">
                            Interfaces: {interfaces.length}
                        </span>
                        <span className="text-gray-800 dark:text-white">
                            Source IPs: {sourceIps.length}
                        </span>
                        <span className="text-gray-800 dark:text-white">
                            Destination IPs: {destIps.length}
                        </span>
                    </div>
                </div>
                <div className="flex justify-between items-center bg-gray-200 p-2 gap-1 flex-wrap">
                    <FilterSelect
                        label="Interfaces"
                        options={interfaces}
                        onChange={(value: string) =>
                            setSearch({ interface: value })
                        }
                    />
                    <FilterSelect
                        label="Event Type"
                        options={eventTypes}
                        onChange={(value: string) =>
                            setSearch({ eventType: value })
                        }
                    />
                    <FilterSelect
                        label="Protocol"
                        options={protocols}
                        onChange={(value: string) =>
                            setSearch({ protocol: value })
                        }
                    />
                    <FilterSelect
                        label="Source IP"
                        options={sourceIps}
                        onChange={(value: string) =>
                            setSearch({ sourceIp: value })
                        }
                    />
                    <FilterSelect
                        label="Source Port"
                        options={sourcePorts}
                        onChange={(value: string) =>
                            setSearch({ sourcePort: value })
                        }
                    />
                    <FilterSelect
                        label="Destination IP"
                        options={destIps}
                        onChange={(value: string) =>
                            setSearch({ destIp: value })
                        }
                    />
                    <FilterSelect
                        label="Destination Port"
                        options={destPorts}
                        onChange={(value: string) =>
                            setSearch({ destPort: value })
                        }
                    />
                    <input
                        className="text-gray-800 dark:text-white"
                        type="search"
                        onChange={(e) => setSearch({ search: e.target.value })}
                        placeholder="Search (Regex)"
                    />
                    <label className="text-gray-800 dark:text-white">
                        Time Range
                    </label>
                    <input
                        className="text-gray-800 dark:text-white"
                        onChange={(e) =>
                            setSearch({ startTime: e.target.value })
                        }
                        type="datetime-local"
                        placeholder="Start Time"
                    />
                    <input
                        className="text-gray-800 dark:text-white"
                        onChange={(e) => setSearch({ endTime: e.target.value })}
                        type="datetime-local"
                        placeholder="End Time"
                    />
                    <Button
                        className="text-gray-800 dark:text-white"
                        onClick={() => setAscending(!ascending)}
                    >
                        {" "}
                        {ascending ? "Ascending" : "Descending"}
                    </Button>
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
                                    <th className="px-4 py-2">
                                        Destination IP
                                    </th>
                                    <th className="px-4 py-2">
                                        Destination Port
                                    </th>
                                    <th className="px-4 py-2">Protocol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {memoizedFilteredLogs.map((log, i) => (
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
