import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { EveProvider } from "./Providers/EveProvider";
import Home from "./pages/Home";

const App: React.FC = () => {
    return (
        <EveProvider>
            <Router>
                <Routes>
                    <Route path="/" Component={Home} />
                    {/* <Route path="/about" Component={} /> */}
                </Routes>
            </Router>
        </EveProvider>
    );
};

export default App;
