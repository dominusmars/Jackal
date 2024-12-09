import PageTitle from "@/components/PageTitle";
import YamlEditor from "@focus-reactive/react-yaml";
import { Button, Spinner } from "flowbite-react";
import { SuricataConfig } from "lib";
import React, { useEffect, useState } from "react";

type Props = {};

function Config({}: Props) {
    const [SuricataConfig, setSuricataConfig] = useState<SuricataConfig | null>(null);
    const [Loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        var fetchConfig = async () => {
            setLoading(true);
            const response = await fetch("/api/config");
            const data = await response.json();
            setSuricataConfig(data);
            setLoading(false);
        };
        fetchConfig();
    }, []);
    const handleChange = ({ json, text }: { json: any; text: string }) => {
        setSuricataConfig(json);
    };

    const handleSubmit = async () => {
        if (SuricataConfig) {
            await fetch("/api/config", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(SuricataConfig),
            });
        }
    }; 
    const reloadConfig = async () => {
        var fetchConfig = async () => {
            setLoading(true);
            const response = await fetch("/api/config");
            const data = await response.json();
            setSuricataConfig(data);
            setLoading(false);
        };
        fetchConfig();
    }

    return (
        <div className="min-h-screen flex bg-gray-100">
            <div className="flex-1 justify-center flex-col gap-1">
                <PageTitle title="Suricata Yaml Config" stats={[]} />
                {Loading && <div className="flex justify-center items-center"><Spinner></Spinner></div>}
                {!Loading && (
                    <>
                        <div className="flex gap-2 justify-center items-center mt-2 mb-2">
                            <Button onClick={handleSubmit} className="btn btn-primary">Save</Button>
                            <Button onClick={() => reloadConfig()} className="btn btn-primary">Reload</Button>
                            <Button href="https://docs.suricata.io/en/latest/configuration/suricata-yaml.html" target="_blank" >
                            Suricata Config Documentation
                            </Button>
                        </div>
                       
                        <YamlEditor json={SuricataConfig || {}} onChange={handleChange} />
                   
                    </>
                )}
                
            </div>
        </div>
    );
}

export default Config;
