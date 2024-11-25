import React, { useEffect, useRef, useState } from "react";
import { EdgeOptions, Network } from "vis-network";
import { useEve } from "../Providers/EveProvider";
import { VisEdge } from "vis-network/declarations/network/gephiParser";

const NetworkMap = () => {
    const { EveLogs } = useEve();
    const networkRef = useRef(null);
    const [networkData, setNetworkData] = useState<{
        nodes: { id: string; label: string }[];
        edges: VisEdge[];
    }>({ nodes: [], edges: [] });

    useEffect(() => {
        const nodesMap = new Map();
        const edges: VisEdge[] = [];

        EveLogs.forEach((log) => {
            const { src_ip, dest_ip } = log;

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
    }, [EveLogs]);

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

            const network = new Network(
                networkRef.current,
                networkData,
                options
            );

            return () => {
                network.destroy();
            };
        }
    }, [networkData, EveLogs]);

    return <div style={{ height: "800px" }} ref={networkRef}></div>;
};

export default NetworkMap;
