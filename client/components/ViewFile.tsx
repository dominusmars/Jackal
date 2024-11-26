import React, { useEffect, useState } from "react";

interface ViewFileProps {
    fileUrl: string;
}

const ViewFile: React.FC<ViewFileProps> = ({ fileUrl }) => {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [basename, setBasename] = useState<string | null>(
        fileUrl
            .split("/")
            .pop()
            ?.replace(/\b\w/g, (char) => char.toUpperCase()) || null
    );
    useEffect(() => {
        const fetchFile = async () => {
            try {
                const response = await fetch(fileUrl);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const text = await response.text();
                setFileContent(text);
            } catch (error: any) {
                setError(error.message);
            }
        };
        setFileContent(null);

        fetchFile();
        setBasename(
            fileUrl
                .split("/")
                .pop()
                ?.replace(/\b\w/g, (char) => char.toUpperCase()) || null
        );
    }, [fileUrl]);

    if (error) {
        return (
            <div className="p-4 bg-gray-100 rounded shadow-md">
                <div className="text-xl font-bold mb-4">Error: {error}</div>
            </div>
        );
    }

    if (fileContent === null) {
        return (
            <div className="p-4 bg-gray-100 rounded shadow-md">
                <div className="text-xl font-bold mb-4">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-100 rounded shadow-md">
            <h1 className="text-xl font-bold mb-4">{basename}</h1>
            <pre className="bg-white p-4 rounded border max-h-screen overflow-y-scroll">
                {fileContent}
            </pre>
        </div>
    );
};

export default ViewFile;
