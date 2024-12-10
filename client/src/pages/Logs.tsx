import PageTitle from "@/components/PageTitle";
import ViewFile from "@/components/ViewFile";
import { Accordion } from "flowbite-react";
import React from "react";

const ServiceLogsPage = () => {
    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="flex-1 justify-center flex-col gap-3">
                <PageTitle title="Suricata Service Logs" stats={[]} />
                <Accordion collapseAll>
                    <Accordion.Panel title="Fast">
                        <Accordion.Title>Fast</Accordion.Title>
                        <Accordion.Content>
                            <ViewFile fileUrl="/api/file/fast" />
                        </Accordion.Content>
                    </Accordion.Panel>
                    <Accordion.Panel title="Stats">
                        <Accordion.Title>Stats</Accordion.Title>
                        <Accordion.Content>
                            <ViewFile fileUrl="/api/file/stats" />
                        </Accordion.Content>
                    </Accordion.Panel>
                    <Accordion.Panel title="Service">
                        <Accordion.Title>Service</Accordion.Title>
                        <Accordion.Content>
                            <ViewFile fileUrl="/api/file/service" />
                        </Accordion.Content>
                    </Accordion.Panel>
                </Accordion>
            </div>
        </div>
    );
};

export default ServiceLogsPage;
