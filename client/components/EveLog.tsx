"use client";

import React from "react";
import { SuricataEveLog } from "../../types/EveLogs";
import { format } from "date-fns";
import { useState } from "react";

export function EveLog({ log }: { log: SuricataEveLog }) {
    const [showDetails, setShowDetails] = useState(false);

    if (!log) {
        return null;
    }

    return (
        <>
            <tr
                onClick={() => setShowDetails(!showDetails)}
                className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 ease-in-out transition-all"
            >
                <td className="border px-4 py-2">{format(new Date(log.timestamp), "MMMM dd, yyyy, hh:mm:ss a")}</td>
                <td className="border px-4 py-2">{log.in_iface}</td>
                <td className="border px-4 py-2">{log.event_type}</td>
                <td className="border px-4 py-2">{log.src_ip}</td>
                <td className="border px-4 py-2">{log.src_port}</td>
                <td className="border px-4 py-2">{log.dest_ip}</td>
                <td className="border px-4 py-2">{log.dest_port}</td>
                <td className="border px-4 py-2">{log?.proto || ""}</td>
            </tr>
            {showDetails && (
                <tr>
                    <td colSpan={8} className="border px-4 py-2">
                        <div className="text-gray-700 dark:text-gray-400">
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
                        <h3 className="">Raw Log:</h3>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">{JSON.stringify(log, null, 4)}</pre>
                    </td>
                </tr>
            )}
        </>
    );
}
