import React, { useEffect, useRef, useState } from "react";
import { EdgeOptions, Network, Options } from "vis-network";
import { useEve } from "../Providers/EveProvider";
import { VisEdge } from "vis-network/declarations/network/gephiParser";
import { MultiSelect } from "./FilterSelect";
import PageTitle from "./PageTitle";
import { v4 } from "uuid";

const NetworkMap = () => {
    const { EveLogs, sourceIps, destIps } = useEve();
    const [CurrentEveLogs, setCurrentEveLogs] = useState(EveLogs);
    const networkRef = useRef(null);
    const [networkData, setNetworkData] = useState<{
        nodes: { id: string; label: string }[];
        edges: VisEdge[];
    }>({ nodes: [], edges: [] });
    const [search, setSearch] = useState<{
        sourceIps: string[];
        destIps: string[];
    }>({
        sourceIps: [],
        destIps: [],
    });

    useEffect(() => {
        const nodesMap = new Map();
        const edges: VisEdge[] = [];

        CurrentEveLogs.forEach((log) => {
            const { src_ip, dest_ip } = log;
            if (!src_ip || !dest_ip) {
                return;
            }
            if (!search.sourceIps.includes(src_ip.trim()) || !search.destIps.includes(dest_ip)) {
                return;
            }

            if (!nodesMap.has(src_ip)) {
                nodesMap.set(src_ip, { id: src_ip, label: src_ip });
            }

            if (!nodesMap.has(dest_ip)) {
                nodesMap.set(dest_ip, { id: dest_ip, label: dest_ip });
            }

            edges.push({ id: v4(), from: src_ip, to: dest_ip, label: log.event_type, arrows: "to" });
        });

        const nodes = Array.from(nodesMap.values());
        setNetworkData({ nodes, edges });
    }, [EveLogs, search]);

    useEffect(() => {
        if (networkRef.current) {
            const options: Options = {
                nodes: {
                    shape: "dot",
                    size: 16,
                },
                edges: {
                    smooth: true,
                },

                physics: {
                    enabled: false,
                },
                layout: {
                    improvedLayout: true, // Disable improved layout for better performance
                    hierarchical: {
                        enabled: true,
                    },
                },
            };

            const network = new Network(networkRef.current, networkData, options);

            return () => {
                network.destroy();
            };
        }
    }, [networkData]);

    return (
        <div className="">
            <div className="flex-1 justify-start flex-col gap-1">
                <PageTitle
                    title="Connection Map"
                    stats={[
                        {
                            info: `Events: ${EveLogs.length}`,
                        },
                        {
                            info: `Nodes: ${networkData.nodes.length}`,
                        },
                        {
                            info: `Edges: ${networkData.edges.length}`,
                        },
                    ]}
                />

                <div className="flex justify-between items-center bg-gray-200 p-2 gap-1 flex-wrap">
                    <MultiSelect label="Source IP" options={sourceIps} onChange={(value: string[]) => setSearch({ ...search, sourceIps: value })} />
                    <MultiSelect label="Destination IP" options={destIps} onChange={(value: string[]) => setSearch({ ...search, destIps: value })} />
                </div>
            </div>
            <div className="min-h-lvh bg-slate-500 shadow-lg" style={{ height: "80em" }} ref={networkRef}></div>
        </div>
    );
};

export default NetworkMap;
