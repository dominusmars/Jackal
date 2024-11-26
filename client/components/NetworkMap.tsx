import React, { useEffect, useRef, useState } from "react";
import { EdgeOptions, Network } from "vis-network";
import { useEve } from "../Providers/EveProvider";
import { VisEdge } from "vis-network/declarations/network/gephiParser";
import { MultiSelect } from "./FilterSelect";

const NetworkMap = () => {
    const { EveLogs, sourceIps, destIps } = useEve();
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

        EveLogs.forEach((log) => {
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

            edges.push({ id: crypto.randomUUID(), from: src_ip, to: dest_ip });
        });

        const nodes = Array.from(nodesMap.values());
        console.log(nodes);
        setNetworkData({ nodes, edges });
    }, [EveLogs, search]);

    useEffect(() => {
        if (networkRef.current) {
            const options = {
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
                    improvedLayout: false, // Disable improved layout for better performance
                },
            };

            const network = new Network(networkRef.current, networkData, options);

            return () => {
                network.destroy();
            };
        }
    }, [networkData]);

    return (
        <div className="w-screen">
            <div className="flex-1 justify-start flex-col gap-1">
                <div className="flex justify-between items-center bg-gray-200 p-2">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Network Map</h1>
                    <div className="flex gap-2">
                        <span className="text-gray-800 dark:text-white">Events: {EveLogs.length}</span>
                        <span className="text-gray-800 dark:text-white">Nodes: {networkData.nodes.length}</span>
                        <span className="text-gray-800 dark:text-white">Edges: {networkData.edges.length}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center bg-gray-200 p-2 gap-1 flex-wrap">
                    <MultiSelect label="Source IP" options={sourceIps} onChange={(value: string[]) => setSearch({ ...search, sourceIps: value })} />
                    <MultiSelect label="Destination IP" options={destIps} onChange={(value: string[]) => setSearch({ ...search, destIps: value })} />
                </div>
            </div>
            <div className="min-h-lvh w-screen bg-slate-500" style={{ height: "80em" }} ref={networkRef}></div>;
        </div>
    );
};

export default NetworkMap;
