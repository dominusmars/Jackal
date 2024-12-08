import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { EveProvider } from "./Providers/EveProvider";
import Home from "./pages/Home";
import MainNavBar from "./components/Navbar";
import "./styles.css";
import Map from "./pages/Map";
import ViewFile from "./components/ViewFile";
import Rules from "./pages/Rules";
import { RulesProvider } from "./Providers/RulesProvider";
import { Footer } from "flowbite-react";
import Interfaces from "./pages/Interfaces";
import Settings from "./pages/Settings";
import Tagged from "./pages/Tagged";

const App: React.FC = () => {
    return (
        <Router>
            <EveProvider>
                <RulesProvider>
                    <div className="">
                        <MainNavBar />
                        <div className="p-6 bg-gray-100 min-h-screen">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/map" element={<Map />} />
                                <Route path="/tagged" element={<Tagged />} />
                                <Route path="/stats" element={<ViewFile fileUrl="/api/file/stats" />} />
                                <Route path="/service" element={<ViewFile fileUrl="/api/file/service" />} />
                                <Route path="/fast" element={<ViewFile fileUrl="/api/file/fast" />} />
                                <Route path="/rules" element={<Rules />} />
                                <Route path="/interfaces" element={<Interfaces />} />
                                <Route path="/settings" element={<Settings />} />

                                {/* <Route path="/about" element={} /> */}
                            </Routes>
                        </div>

                        <Footer />
                    </div>
                </RulesProvider>
            </EveProvider>
        </Router>
    );
};

export default App;
