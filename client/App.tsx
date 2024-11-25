import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { EveProvider } from "./Providers/EveProvider";
import Home from "./pages/Home";
import MainNavBar from "./components/Navbar";
import "./styles.css";
import Map from "./pages/Map";

const App: React.FC = () => {
    return (
        <EveProvider>
            <div className="">
                <MainNavBar />
                <Router>
                    <Routes>
                        <Route path="/" Component={Home} />
                        <Route path="/map" Component={Map} />

                        {/* <Route path="/about" Component={} /> */}
                    </Routes>
                </Router>
            </div>
        </EveProvider>
    );
};

export default App;
