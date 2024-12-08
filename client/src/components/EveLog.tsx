"use client";

import React from "react";
import { SuricataEveLog } from "lib";
import { format } from "date-fns";
import { useState } from "react";
import classnames from "classnames";
import { Badge, Button } from "flowbite-react";
import { CiFlag1 } from "react-icons/ci";
export function EveLog({ log }: { log: SuricataEveLog }) {
    const [showDetails, setShowDetails] = useState(false);
    const [flag, setFlag] = useState<string | undefined>(log.flag);
    if (!log) {
        return null;
    }
    function getRowColor() {
        if (!log.alert) {
            return "";
        }
        if (log.alert.action === "allowed") {
            return "bg-green-200 dark:bg-green-700";
        }
        if (log.alert.action === "drop") {
            return "bg-red-200 dark:bg-red-700";
        }
        if (log.alert.action === "reject") {
            return "bg-yellow-200 dark:bg-yellow-700";
        }
        return "";
    }
    async function postFlag() {
        await fetch(`/api/eve/flag?flowId=${log.flow_id}`, {
            method: "POST",
        });

        setFlag("default");
    }

    async function deleteFlag() {
        await fetch(`/api/eve/flag?flowId=${log.flow_id}`, {
            method: "DELETE",
        });

        setFlag(undefined);
    }

    return (
        <>
            <tr
                onClick={() => setShowDetails(!showDetails)}
                className={classnames(
                    "cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 ease-in-out transition-all",
                    getRowColor(),
                    showDetails ? " bg-gray-400 dark:bg-gray-700" : ""
                )}
            >
                <td className="border px-4 py-2">{format(new Date(log.timestamp), "MMMM dd, yyyy, hh:mm:ss a")}</td>
                <td className="border px-4 py-2">{log.in_iface}</td>
                <td className="border px-4 py-2">{log.event_type}</td>
                <td className="border px-4 py-2">{log.src_ip}</td>
                <td className="border px-4 py-2">{log.src_port}</td>
                <td className="border px-4 py-2">{log.dest_ip}</td>
                <td className="border px-4 py-2">{log.dest_port}</td>
                <td className="border px-4 py-2">{log?.proto || ""}</td>
                <td className="border">
                    <div className="flex justify-center transition-all">
                        {flag ? (
                            <Badge color="green" icon={CiFlag1} onClick={deleteFlag} />
                        ) : (
                            <Badge color="red" icon={CiFlag1} onClick={postFlag}></Badge>
                        )}
                    </div>
                </td>
            </tr>
            {showDetails && (
                <tr>
                    <td colSpan={8} className="border px-4 py-2 max-w-screen-lg">
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
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-balance">
                            {JSON.stringify({ ...log, full_text: undefined }, null, 4)}
                        </pre>
                    </td>
                </tr>
            )}
        </>
    );
}
