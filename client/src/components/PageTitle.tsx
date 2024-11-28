import React from "react";

type Props = {
    title: string;
    stats: {
        info: string;
        className?: string;
    }[];
    children?: React.ReactNode;
};

function PageTitle({ title, stats, children }: Props) {
    return (
        <div className="flex justify-between items-center bg-gray-200 p-2">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h1>

            <div className="flex gap-2">
                {stats.map((info, i) => (
                    <span className={info.className || "text-gray-800 dark:text-white"} key={i}>
                        {info.info}
                    </span>
                ))}
            </div>
            {children}
        </div>
    );
}

export default PageTitle;
