import { SelectFrom } from "@/components/FilterSelect";
import PageTitle from "@/components/PageTitle";
import { TaggedEveLog } from "@/components/TaggedEveLog";
import { Tabs, TextInput, Button, Spinner, Accordion } from "flowbite-react";
import { SuricataEveLog } from "lib";
import React, { useEffect, useState, useMemo } from "react";

type Props = {};

function Tagged({}: Props) {
    const [taggedLogs, setTaggedLogs] = useState<SuricataEveLog[]>([]);
    const [allTags, setAllTags] = useState<string[]>(["default"]);
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage, setLogsPerPage] = useState(25);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchTaggedLogs() {
            setLoading(true);
            const res = await fetch("/api/eve/tag/all");
            const data = await res.json();
            setTaggedLogs(data);
            const tags = new Set<string>();
            data.forEach((log: SuricataEveLog) => {
                if (log.tag) {
                    tags.add(log.tag);
                }
            });
            setAllTags(Array.from(tags));
            setLoading(false);
        }
        fetchTaggedLogs();
    }, []);

    const updateTaggedLogs = async (flowId: number, newTag: string) => {
        setLoading(true);
        const res = await fetch(`/api/eve/tag?flowId=${flowId}&tag=${newTag}`, {
            method: "POST",
        });
        const data = await res.json();
        setTaggedLogs(data);
        const tags = new Set<string>();
        data.forEach((log: SuricataEveLog) => {
            if (log.tag) {
                tags.add(log.tag);
            }
        });
        setAllTags(Array.from(tags));
        setLoading(false);
    };

    const deleteTag = async (flowId: number) => {
        setLoading(true);
        const res = await fetch(`/api/eve/tag?flowId=${flowId}`, {
            method: "DELETE",
        });
        const data = await res.json();
        setTaggedLogs(data);
        const tags = new Set<string>();
        data.forEach((log: SuricataEveLog) => {
            if (log.tag) {
                tags.add(log.tag);
            }
        });
        setAllTags(Array.from(tags));
        setLoading(false);
    };

    const addTag = async (newTag: string) => {
        setAllTags([...allTags, newTag]);
    };

    const memoizedTaggedLogs = useMemo(() => {
        return taggedLogs;
    }, [taggedLogs]);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * logsPerPage;
        const endIndex = startIndex + logsPerPage;
        return memoizedTaggedLogs.slice(startIndex, endIndex);
    }, [memoizedTaggedLogs, currentPage, logsPerPage]);

    const totalPages = Math.ceil(memoizedTaggedLogs.length / logsPerPage);

    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="flex-1 justify-center flex-col gap-1">
                <PageTitle
                    title="Tagged Eve Logs"
                    stats={[
                        {
                            info: `Tagged Logs: ${taggedLogs.length}`,
                        },
                    ]}
                />
                <div className="overflow-auto h-4"></div>
                <div className="p-4">
                    <Accordion collapseAll>
                        <Accordion.Panel key={""}>
                            <Accordion.Title>Add Tag</Accordion.Title>
                            <Accordion.Content>
                                <TextInput
                                    type="text"
                                    placeholder="New Tag"
                                    className="w-full"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            addTag(e.currentTarget.value);
                                            e.currentTarget.value = "";
                                        }
                                    }}
                                />
                            </Accordion.Content>
                        </Accordion.Panel>
                    </Accordion>
                </div>
                <Tabs className="w-full">
                    <Tabs.Item title="All">
                        <table className="w-full bg-white dark:bg-gray-800">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2">Timestamp</th>
                                    <th className="px-4 py-2">Interface</th>
                                    <th className="px-4 py-2">Event Type</th>
                                    <th className="px-4 py-2">Source IP</th>
                                    <th className="px-4 py-2">Source Port</th>
                                    <th className="px-4 py-2">Dest IP</th>
                                    <th className="px-4 py-2">Dest Port</th>
                                    <th className="px-4 py-2">Protocol</th>
                                    <th className="px-4 py-2">Tag</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLogs.map((log, i) => (
                                    <TaggedEveLog key={i} log={log} tags={allTags} updateTaggedLog={updateTaggedLogs} deleteTag={deleteTag} showTag />
                                ))}
                            </tbody>
                        </table>
                        <div className="flex gap-6 justify-center items-center mt-4">
                            <Button
                                className="text-gray-800 dark:text-white"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-gray-800 dark:text-white">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                className="text-gray-800 dark:text-white"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                            <div className="items-end">
                                <SelectFrom
                                    label="Logs Per Page"
                                    options={["25", "50", "100", "500", "1000", "5000", "10000"]}
                                    onChange={(value: string) => setLogsPerPage(parseInt(value))}
                                />
                            </div>
                            {loading && <Spinner>Loading...</Spinner>}
                        </div>
                    </Tabs.Item>
                    {allTags.map((tag) => (
                        <Tabs.Item key={tag} title={tag}>
                            <table className="w-full bg-white dark:bg-gray-800">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2">Timestamp</th>
                                        <th className="px-4 py-2">Interface</th>
                                        <th className="px-4 py-2">Event Type</th>
                                        <th className="px-4 py-2">Source IP</th>
                                        <th className="px-4 py-2">Source Port</th>
                                        <th className="px-4 py-2">Dest IP</th>
                                        <th className="px-4 py-2">Dest Port</th>
                                        <th className="px-4 py-2">Protocol</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {taggedLogs
                                        .filter((log) => log.tag == tag)
                                        .map((log, i) => (
                                            <TaggedEveLog
                                                key={i}
                                                log={log}
                                                tags={allTags}
                                                updateTaggedLog={updateTaggedLogs}
                                                deleteTag={deleteTag}
                                                showTag={false}
                                            />
                                        ))}
                                </tbody>
                            </table>
                        </Tabs.Item>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}

export default Tagged;
