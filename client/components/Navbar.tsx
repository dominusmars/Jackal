import React from "react";
import { Navbar, Dropdown, Avatar } from "flowbite-react";

const MainNavBar: React.FC = () => {
    return (
        <Navbar fluid={true} rounded={true}>
            <Navbar.Brand href="/">
                <img
                    src="/public/icon.svg"
                    className="mr-3 h-6 sm:h-9"
                    alt="Flowbite Logo"
                />

                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                    Jackal
                </span>
            </Navbar.Brand>
            <div className="flex md:order-2">
                <Dropdown arrowIcon={false} inline={true}>
                    <Dropdown.Header>
                        <span className="block text-sm">Bonnie Green</span>
                        <span className="block truncate text-sm font-medium">
                            name@flowbite.com
                        </span>
                    </Dropdown.Header>
                    <Dropdown.Item>Dashboard</Dropdown.Item>
                    <Dropdown.Item>Settings</Dropdown.Item>
                    <Dropdown.Item>Earnings</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item>Sign out</Dropdown.Item>
                </Dropdown>
                <Navbar.Toggle />
            </div>
            <Navbar.Collapse>
                <Navbar.Link href="/" active={true}>
                    Home
                </Navbar.Link>
                <Navbar.Link href="/map">Map</Navbar.Link>
                <Navbar.Link href="/stats">Stats</Navbar.Link>
                <Navbar.Link href="/service">Service</Navbar.Link>

                {/* <Navbar.Link href="/pricing">Pricing</Navbar.Link>
                <Navbar.Link href="/contact">Contact</Navbar.Link> */}
            </Navbar.Collapse>
        </Navbar>
    );
};

export default MainNavBar;
