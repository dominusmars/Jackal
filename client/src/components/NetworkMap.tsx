import React, { useEffect, useRef, useState } from "react";
import { EdgeOptions, Network } from "vis-network";
import { useEve } from "../Providers/EveProvider";
import { VisEdge } from "vis-network/declarations/network/gephiParser";
import { MultiSelect } from "./FilterSelect";
import PageTitle from "./PageTitle";
import { uuid } from "uuidv4";

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

            edges.push({ id: uuid(), from: src_ip, to: dest_ip, label: log.event_type, arrows: "to" });
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
