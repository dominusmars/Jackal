import Config from "@/components/Config";
import PageTitle from "@/components/PageTitle";
import React from "react";

type Props = {};

function Settings({}: Props) {
    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="flex-1 justify-center flex-col gap-1">
                <PageTitle title="Suricata Settings" stats={[]} />
                <div className="flex-1">
                    <Config />
                </div>
            </div>
        </div>
    );
}

export default Settings;
