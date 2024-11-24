import React from "react";
import { useEve } from "../Providers/EveProvider";

const Home: React.FC = () => {
    const { value, setValue } = useEve();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to the Home Page</h1>
            <p className="text-lg text-gray-600">This is a simple home page using Tailwind CSS.</p>
            <button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Get Started</button>
        </div>
    );
};

export default Home;
