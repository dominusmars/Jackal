import { Accordion, Button, Checkbox, Label, Spinner, Textarea, TextInput } from "flowbite-react";
import { SuricataConfig } from "lib";
import React, { useEffect } from "react";

type Props = {};

function Config({}: Props) {
    const [SuricataConfig, setConfig] = React.useState<SuricataConfig | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    useEffect(() => {
        var fetchConfig = async () => {
            const response = await fetch("/api/config");
            const data = await response.json();
            setConfig(data);
            setLoading(false);
        };
        setLoading(true);
        fetchConfig();
    }, []);

    if (loading) {
        return <Spinner>Loading...</Spinner>;
    }
    if (SuricataConfig === null) {
        return <div>No config loaded...</div>;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (SuricataConfig) {
            const updatedConfig = { ...SuricataConfig, [key]: e.target.value };
            setConfig(updatedConfig);
        }
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

    return (
        <div className="flex flex-col justify-center gap-3 p-3">
            <Accordion collapseAll>
                <Accordion.Panel>
                    <Accordion.Title>Suricata Vars</Accordion.Title>
                    <Accordion.Content>
                        <div>
                            <Accordion collapseAll>
                                <Accordion.Panel>
                                    <Accordion.Title>Address Groups</Accordion.Title>
                                    <Accordion.Content>
                                        <div>
                                            {Object.keys(SuricataConfig.vars["address-groups"]).map((key) => (
                                                <div key={key}>
                                                    <Label htmlFor={key}>{key}:</Label>
                                                    <TextInput
                                                        id={key}
                                                        type="text"
                                                        value={
                                                            SuricataConfig.vars["address-groups"][
                                                                key as keyof SuricataConfig["vars"]["address-groups"]
                                                            ]
                                                        }
                                                        onChange={(e) => {
                                                            const updatedAddressGroups = {
                                                                ...SuricataConfig.vars["address-groups"],
                                                                [key]: e.target.value,
                                                            };
                                                            setConfig({
                                                                ...SuricataConfig,
                                                                vars: { ...SuricataConfig.vars, "address-groups": updatedAddressGroups },
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </Accordion.Content>
                                </Accordion.Panel>
                                <Accordion.Panel>
                                    <Accordion.Title>Port Groups</Accordion.Title>
                                    <Accordion.Content>
                                        {Object.keys(SuricataConfig.vars["port-groups"]).map((key) => (
                                            <div key={key}>
                                                <Label htmlFor={key}>{key}:</Label>
                                                <TextInput
                                                    type="text"
                                                    value={SuricataConfig.vars["port-groups"][key as keyof SuricataConfig["vars"]["port-groups"]]}
                                                    onChange={(e) => {
                                                        const updatedPortGroups = {
                                                            ...SuricataConfig.vars["port-groups"],
                                                            [key]: e.target.value,
                                                        };
                                                        setConfig({
                                                            ...SuricataConfig,
                                                            vars: { ...SuricataConfig.vars, "port-groups": updatedPortGroups },
                                                        });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </Accordion.Content>
                                </Accordion.Panel>
                            </Accordion>
                        </div>
                    </Accordion.Content>
                </Accordion.Panel>
                <Accordion.Panel>
                    <Accordion.Title>Default Log Dir</Accordion.Title>
                    <Accordion.Content>
                        <Label htmlFor="default-log-dir">Default Log Dir:</Label>
                        <TextInput
                            id="default-log-dir"
                            type="text"
                            value={SuricataConfig["default-log-dir"]}
                            onChange={(e) => handleInputChange(e, "default-log-dir")}
                        />
                    </Accordion.Content>
                </Accordion.Panel>
                <Accordion.Panel>
                    <Accordion.Title>Stats</Accordion.Title>
                    <Accordion.Content>
                        <div className="flex gap-30">
                            <div>
                                <Label htmlFor="stats-enabled">Enabled:</Label>
                                <Checkbox
                                    id="stats-enabled"
                                    checked={SuricataConfig.stats.enabled}
                                    onChange={(e) => {
                                        const updatedStats = { ...SuricataConfig.stats, enabled: e.target.checked };
                                        setConfig({ ...SuricataConfig, stats: updatedStats });
                                    }}
                                />
                            </div>
                            <div>
                                <Label htmlFor="stats-interval">Interval:</Label>
                                <TextInput
                                    id="stats-interval"
                                    type="number"
                                    value={SuricataConfig.stats.interval}
                                    onChange={(e) => {
                                        const updatedStats = { ...SuricataConfig.stats, interval: parseInt(e.target.value) };
                                        setConfig({ ...SuricataConfig, stats: updatedStats });
                                    }}
                                />
                            </div>
                        </div>
                    </Accordion.Content>
                </Accordion.Panel>
                <Accordion.Panel>
                    <Accordion.Title>Logging</Accordion.Title>
                    <Accordion.Content>
                        <Label htmlFor="default-log-level">Default Log Level:</Label>
                        <TextInput
                            id="default-log-level"
                            type="text"
                            value={SuricataConfig.logging["default-log-level"]}
                            onChange={(e) => handleInputChange(e, "default-log-level")}
                        />
                    </Accordion.Content>
                </Accordion.Panel>
                <Accordion.Panel>
                    <Accordion.Title>Host Mode</Accordion.Title>
                    <Accordion.Content>
                        <Label htmlFor="host-mode">Host Mode:</Label>
                        <TextInput
                            id="host-mode"
                            type="text"
                            value={SuricataConfig["host-mode"]}
                            onChange={(e) => handleInputChange(e, "host-mode")}
                        />
                    </Accordion.Content>
                </Accordion.Panel>
                <Accordion.Panel>
                    <Accordion.Title>Unix Command</Accordion.Title>
                    <Accordion.Content>
                        <Label htmlFor="unix-command">Unix Command:</Label>
                        <TextInput
                            id="unix-command"
                            type="text"
                            value={SuricataConfig["unix-command"].enabled}
                            onChange={(e) => {
                                const updatedUnixCommand = { ...SuricataConfig["unix-command"], enabled: e.target.value };
                                setConfig({ ...SuricataConfig, "unix-command": updatedUnixCommand });
                            }}
                        />
                    </Accordion.Content>
                </Accordion.Panel>
            </Accordion>

            <Button onClick={handleSubmit}>Save Config</Button>
        </div>
    );
}

export default Config;
