import React from "react";
import NetworkMap from "../components/NetworkMap";

const Map: React.FC = () => {
    return (
        <div className="min-h-screen flex bg-gray-100">
            {" "}
            <div>
                <h1>Network Map</h1>
                <NetworkMap />
            </div>
        </div>
    );
};

export default Map;
