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
import Tagged from "./pages/Tagged";
import Config from "./pages/Config";
import ServiceLogsPage from "./pages/Logs";
import Monitor from "./pages/Monitor";

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
                                <Route path="/logs" element={<ServiceLogsPage/>} />
                                <Route path="/rules" element={<Rules />} />
                                <Route path="/interfaces" element={<Interfaces />} />
                                <Route path="/config" element={<Config />} />
                                <Route path="/monitor" element={<Monitor/>}/>

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
