"use client";

import { Card } from "flowbite-react";
import React from "react";
import { SuricataEveLog } from "../../types/EveLogs";
import { format } from "date-fns";

// export function EveLog({ log }: { log: SuricataEveLog }) {
//     if (!log) {
//         return null;
//     }

//     return (
//         <Card href="#" className="max-w-sm">
//             <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
//                 {format(log.timestamp, "MMMM dd, yyyy, hh:mm:ss a")}
//             </h5>
//             <h6 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
//                 {log.event_type}
//             </h6>

//             <p className="font-normal text-gray-700 dark:text-gray-400">
//                 {/* {JSON.stringify(log, null, 2)} */}
//             </p>
//         </Card>
//     );
// }
import { useState } from "react";

export function EveLog({ log }: { log: SuricataEveLog }) {
    const [showDetails, setShowDetails] = useState(false);

    if (!log) {
        return null;
    }

    return (
        <div className="max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {format(new Date(log.timestamp), "MMMM dd, yyyy, hh:mm:ss a")}
            </h5>
            <h6 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {log.event_type}
            </h6>
            <p className="font-normal text-gray-700 dark:text-gray-400">
                Source IP: {log.src_ip}, Source Port: {log.src_port},
                Destination IP: {log.dest_ip}, Destination Port: {log.dest_port}
            </p>
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-2 text-blue-500 hover:underline"
            >
                {showDetails ? "Hide Details" : "Show Details"}
            </button>
            {showDetails && (
                <div className="mt-2 text-gray-700 dark:text-gray-400">
                    <p>Source IP: {log.src_ip}</p>
                    {log.src_port && <p>Source Port: {log.src_port}</p>}
                    <p>Destination IP: {log.dest_ip}</p>
                    {log.dest_port && <p>Destination Port: {log.dest_port}</p>}
                    {log.proto && <p>Protocol: {log.proto}</p>}
                    {log.alert && (
                        <div>
                            <p>Alert Action: {log.alert.action}</p>
                            <p>Signature: {log.alert.signature}</p>
                            <p>Category: {log.alert.category}</p>
                            <p>Severity: {log.alert.severity}</p>
                        </div>
                    )}
                    {log.http && (
                        <div>
                            <p>HTTP Hostname: {log.http.hostname}</p>
                            <p>URL: {log.http.url}</p>
                            <p>User Agent: {log.http.http_user_agent}</p>
                            <p>Method: {log.http.http_method}</p>
                            <p>Status: {log.http.status}</p>
                        </div>
                    )}
                    {log.dns && (
                        <div>
                            <p>DNS Type: {log.dns.type}</p>
                            <p>RR Name: {log.dns.rrname}</p>
                            <p>RCode: {log.dns.rcode}</p>
                        </div>
                    )}
                    {log.tls && (
                        <div>
                            <p>TLS Subject: {log.tls.subject}</p>
                            <p>Issuer DN: {log.tls.issuerdn}</p>
                            <p>Fingerprint: {log.tls.fingerprint}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
