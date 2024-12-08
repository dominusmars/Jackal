import PageTitle from "@/components/PageTitle";
import { SuricataEveLog } from "lib";
import React, { useEffect, useState } from "react";

type Props = {};

function Flagged({}: Props) {
    const [flaggedLogs, setFlaggedLogs] = useState<SuricataEveLog[]>([]);
    const [flags, setFlags] = useState<string[]>([]);

    useEffect(() => {
        async function fetchFlaggedLogs() {
            const res = await fetch("/api/eve/flag/all");
            const data = await res.json();
            setFlaggedLogs(data);
            const flags = new Set<string>();
            data.forEach((log: SuricataEveLog) => {
                if (log.flag) {
                    flags.add(log.flag);
                }
            });
            setFlags(Array.from(flags));
        }
        fetchFlaggedLogs();
    }, []);

    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="flex-1 justify-center flex-col gap-1">
                <PageTitle
                    title="Suricata Eve Logs"
                    stats={[
                        {
                            info: `Flagged Logs: ${flaggedLogs.length}`,
                        },
                    ]}
                />
            </div>
        </div>
    );
}

export default Flagged;
