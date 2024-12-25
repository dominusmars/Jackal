import PageTitle from "@/components/PageTitle";
import { Accordion, Button, Spinner, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { CiCircleInfo } from "react-icons/ci";

type Props = {};

const Monitor = (props: Props) => {
    const [Metrics, SetMetrics] = useState<{
        retrain_threshold: number;
        contamination: number;
        max_logs: number;
        logs: {
            [event: string]: number;
        };
        health: boolean;
        active: boolean;
    } | null>(null);
    const [Error, SetError] = useState<string | null>(null);

    async function getMetrics() {
        const response = await fetch("/api/monitor/metrics");
        const data = await response.json();
        SetMetrics(data);
    }
    // Get metrics for the network monitor
    useEffect(() => {
        getMetrics();
        return () => {};
    }, []);

    if (!Metrics) {
        return <Spinner></Spinner>;
    }

    async function setMaxLogs(max: number) {
        SetError(null);

        const response = await fetch("/api/monitor/maxlogs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ max }),
        });
        if (response.status !== 200) {
            SetError("Invalid max logs value");
            return;
        }

        const data = await response.json();
        getMetrics();
    }
    async function setContamination(contamination: number) {
        SetError(null);

        const response = await fetch("/api/monitor/contamination", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ contamination }),
        });
        if (response.status !== 200) {
            SetError("Invalid contamination value");
            return;
        }

        const data = await response.json();
        getMetrics();
    }
    async function setRetrainThreshold(retrain_threshold: number) {
        SetError(null);
        const response = await fetch("/api/monitor/retrainthreshold", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ retrain_threshold }),
        });
        if (response.status !== 200) {
            SetError("Invalid retrain threshold value");
            return;
        }

        const data = await response.json();
        getMetrics();
    }

    async function setMonitoring(active: boolean) {
        SetError(null);
        const response = await fetch(`/api/monitor?active=${active}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status !== 200) {
            SetError("Invalid monitoring value");
            return;
        }
        getMetrics();
    }

    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="flex-1 justify-center flex-col gap-3">
                <PageTitle
                    title="Network Monitor"
                    stats={[
                        { info: `Max Logs: ${Metrics.max_logs}` },
                        { info: `Contamination: ${Metrics.contamination}` },
                        { info: `Retrain Threshold: ${Metrics.retrain_threshold}` },
                        { info: `Health: ${Metrics.health ? "Running" : "Stopped"}`, className: Metrics.health ? `text-green-500` : `text-red-500` },
                        { info: `Active: ${Metrics.active ? "Running" : "Stopped"}`, className: Metrics.active ? `text-green-500` : `text-red-500` },
                    ]}
                />
                <div className="mt-2 mb-2">
                    <Accordion collapseAll>
                        <Accordion.Panel key={""}>
                            <Accordion.Title>Max Logs</Accordion.Title>
                            <Accordion.Content>
                                <TextInput
                                    type="number"
                                    placeholder="Max Logs"
                                    className="w-full"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            setMaxLogs(Number(e.currentTarget.value));
                                            e.currentTarget.value = "";
                                        }
                                    }}
                                />
                                <div className="flex gap-1 mb-2 mt-2 items-center">
                                    <CiCircleInfo />
                                    <div>Max logs to keep for training per event</div>
                                </div>
                            </Accordion.Content>
                        </Accordion.Panel>
                        <Accordion.Panel key={""}>
                            <Accordion.Title>Contamination</Accordion.Title>
                            <Accordion.Content>
                                <TextInput
                                    type="number"
                                    placeholder="Contamination"
                                    className="w-full"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            setContamination(Number(e.currentTarget.value));
                                            e.currentTarget.value = "";
                                        }
                                    }}
                                />
                                <div className="flex gap-1 mb-2 mt-2 items-center">
                                    <CiCircleInfo />
                                    <div>Contamination value for the isolation forest algorithm, smaller can reduce false positives</div>
                                </div>
                            </Accordion.Content>
                        </Accordion.Panel>
                        <Accordion.Panel key={""}>
                            <Accordion.Title>Retrain</Accordion.Title>
                            <Accordion.Content>
                                <TextInput
                                    type="number"
                                    placeholder="Retrain Threshold"
                                    className="w-full"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            setRetrainThreshold(Number(e.currentTarget.value));
                                            e.currentTarget.value = "";
                                        }
                                    }}
                                />
                                <div className="flex gap-1 mb-2 mt-2 items-center">
                                    <CiCircleInfo />
                                    <div>Retrain threshold for how often to retrain the model</div>
                                </div>
                            </Accordion.Content>
                        </Accordion.Panel>
                        <Accordion.Panel key={""}>
                            <Accordion.Title>Active</Accordion.Title>
                            <Accordion.Content>
                                <div className="flex gap-1 mb-2 mt-2 items-center">
                                    <Button onClick={() => setMonitoring(!Metrics.active)} className="mr-2">
                                        {Metrics.active ? "Stop" : "Start"}
                                    </Button>
                                </div>
                            </Accordion.Content>
                        </Accordion.Panel>
                    </Accordion>
                    <div className="flex gap-1 mb-2 items-center p-2 bg-gray-200 rounded-lg mt-3">
                        <CiCircleInfo />
                        <div>
                            The network monitor observes network behavior based on a specified number of recent logs. Changes in network traffic are
                            not always indicative of threats; many are simply normal variations. However, they can signal unplanned network changes.
                        </div>
                    </div>

                    {Error && <div className="text-red-500">{Error}</div>}
                </div>
            </div>
        </div>
    );
};

export default Monitor;
