import React from "react";
import { Navbar, Dropdown, Avatar } from "flowbite-react";
import { Link } from "react-router-dom";
const MainNavBar: React.FC = () => {
    return (
        <Navbar fluid={true} rounded={true}>
            <Navbar.Brand href="/">
                <img src="/public/icon.svg" className="mr-3 h-6 sm:h-9" alt="Flowbite Logo" />

                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Jackal</span>
            </Navbar.Brand>
            <div className="flex md:order-2">
                <Navbar.Toggle />
            </div>
            <Navbar.Collapse>
                <Link to="/">Home</Link>
                <Link to="/tagged">Tagged</Link>
                <Link to="/map">Map</Link>
                <Link to="/rules">Rules</Link>
                <Link to="/interfaces">Interfaces</Link>
                <Link to="/fast">Fast</Link>
                <Link to="/stats">Stats</Link>
                <Link to="/service">Service</Link>
                <Link to="/settings">Settings</Link>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default MainNavBar;
