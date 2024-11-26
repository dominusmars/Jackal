import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { EveProvider } from "./Providers/EveProvider";
import Home from "./pages/Home";
import MainNavBar from "./components/Navbar";
import "./styles.css";
import Map from "./pages/Map";
import ViewFile from "./components/ViewFile";
import Rules from "./pages/Rules";

const App: React.FC = () => {
    return (
        <Router>
            <EveProvider>
                <div className="">
                    <MainNavBar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/map" element={<Map />} />
                        <Route path="/stats" element={<ViewFile fileUrl="/api/file/stats" />} />
                        <Route path="/service" element={<ViewFile fileUrl="/api/file/service" />} />
                        <Route path="/rules" element={<Rules />} />
                        {/* <Route path="/about" element={} /> */}
                    </Routes>
                </div>
            </EveProvider>
        </Router>
    );
};

export default App;
