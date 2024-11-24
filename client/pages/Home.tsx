import React from "react";
import { useEve } from "../Providers/EveProvider";
import { EveLog } from "../components/EveLog";

const Home: React.FC = () => {
    const {
        EveLogs,
        eventTypes,
        interfaces,
        sourceIps,
        destIps,
        protocols,
        filterLogs,
    } = useEve();

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
                <div className="flex justify-between items-center bg-gray-200 p-2">
                    <select
                        className="text-gray-800 dark:text-white"
                        onChange={(e) =>
                            filterLogs({ interface: e.target.value })
                        }
                    >
                        <option value="">Interfaces</option>
                        {interfaces.map((interf, i) => (
                            <option key={i} value={interf}>
                                {interf}
                            </option>
                        ))}
                    </select>
                    <select
                        className="text-gray-800 dark:text-white"
                        onChange={(e) =>
                            filterLogs({ eventType: e.target.value })
                        }
                    >
                        <option value="">Event Type</option>
                        {eventTypes.map((type, i) => (
                            <option key={i} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    <select
                        className="text-gray-800 dark:text-white"
                        onChange={(e) =>
                            filterLogs({ protocol: e.target.value })
                        }
                    >
                        <option value="">Procotol</option>
                        {protocols.map((type, i) => (
                            <option key={i} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    <select
                        className="text-gray-800 dark:text-white"
                        onChange={(e) =>
                            filterLogs({ sourceIp: e.target.value })
                        }
                    >
                        <option value="">Source IP</option>
                        {sourceIps.map((ip, i) => (
                            <option key={i} value={ip}>
                                {ip}
                            </option>
                        ))}
                    </select>
                    <select
                        className="text-gray-800 dark:text-white"
                        onChange={(e) => filterLogs({ destIp: e.target.value })}
                    >
                        <option value="">Destination IP</option>
                        {destIps.map((ip, i) => (
                            <option key={i} value={ip}>
                                {ip}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 justify-start flex-col gap-1">
                {EveLogs.map((log, i) => (
                    <EveLog key={i} log={log} />
                ))}
            </div>
        </div>
    );
};

export default Home;
