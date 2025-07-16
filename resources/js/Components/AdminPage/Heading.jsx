import React, { useState } from "react";
import {
    FaHome,
    FaTh,
    FaUser,
    FaLock,
    FaAddressBook,
    FaList,
    FaSignInAlt,
    FaSignOutAlt,
    FaBell,
    FaMapPin,
} from "react-icons/fa";
import { useAuth } from "../Auth/auth";

const Heading = ({ children }) => {
    const [expanded, setExpanded] = useState(false);
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    const menuItems = [
        {
            condition:
                user?.role === "super_admin" || user?.role === "technician",
            icon: <FaHome />,
            label: "Home",
            href: "/",
        },
        {
            condition: user?.role === "super_admin",
            icon: <FaAddressBook />,
            label: "Client List",
            href: route("client.list"),
        },
        {
            icon: <FaMapPin />,
            label: "Area",
            href: route("areas"),
        },
        { icon: <FaList />, label: "Unit List", href: route("daily.list") },
        { icon: <FaTh />, label: "Unit Request", href: route("request") },
        {
            condition: user?.role === "super_admin",
            icon: <FaUser />,
            label: "Allocation Settings",
            href: route("allocation.setting"),
        },
        {
            condition:
                user?.role === "super_admin" || user?.role === "technician",
            icon: <FaUser />,
            label: "Profile Settings",
            href: route("profile", { id: user.id }),
        },
        {
            condition: !user,
            icon: <FaSignInAlt />,
            label: "Login",
            onClick: async () => {
                window.location.href = "/login";
            },
        },
        {
            condition: user,
            icon: <FaSignOutAlt />,
            label: "Logout",
            onClick: async () => {
                try {
                    await axios.post(route("logout"));
                    window.location.href = "/login";
                } catch (error) {
                    console.error("Logout failed:", error);
                } finally {
                    window.location.href = "/login";
                }
            },
        },
    ];

    return (
        <div className="h-screen w-screen overflow-x-hidden relative">
            {/* DESKTOP Sidebar */}
            <div
                className={`bg-white h-full w-48 z-[100] transition-all duration-300 fixed top-0 left-0 shadow-md lg:md:block hidden ${
                    expanded ? "translate-x-0" : "-translate-x-[72%]"
                }`}
                onMouseEnter={() => setExpanded(true)}
                onMouseLeave={() => setExpanded(false)}
            >
                <div className="flex flex-col items-center py-4 space-y-4">
                    <img src="/logo_only.webp" alt="Logo" className="h-8" />
                    <div className="w-full mt-4">
                        {menuItems.map((item, index) =>
                            item?.condition === false ||
                            item?.condition === null ? null : (
                                <a
                                    href={item.href}
                                    key={index}
                                    className="flex items-center justify-between w-full gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
                                    onClick={
                                        item.onClick ? item.onClick : undefined
                                    }
                                >
                                    <span className="text-sm text-gray-700">
                                        {item.label}
                                    </span>
                                    <div className="text-xl">{item.icon}</div>
                                </a>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* PHONE Sidebar */}
            <div className="lg:md:hidden sm:visible">
                <div
                    className="p-3 py-4 flex flex-col gap-1 justify-center items-center bg-primary fixed top-5 right-5 z-[100] rounded-full"
                    onClick={() => setExpanded(!expanded)}
                >
                    <div
                        className={`bg-white w-7 h-1 transition duration-300 ${
                            expanded && "rotate-45 translate-y-2"
                        }`}
                    />
                    <div className="w-full flex justify-end">
                        <div
                            className={`bg-white w-5 h-1 transition duration-300 ${
                                expanded && "rotate-45 translate-y-1"
                            }`}
                        />
                    </div>
                    <div
                        className={`bg-white w-7 h-1 transition duration-300 ${
                            expanded && "-rotate-45 -translate-y-2"
                        }`}
                    />
                </div>
                <div
                    className={`bg-white h-full w-48 z-[100] transition-all duration-300 fixed top-0 left-0 shadow-md ${
                        expanded ? "translate-x-0" : "-translate-x-[100%]"
                    }`}
                >
                    <div className="flex flex-col items-center py-4 space-y-4">
                        <img src="/logo_only.webp" alt="Logo" className="h-8" />
                        <div className="w-full mt-4">
                            {menuItems.map((item, index) =>
                                item?.condition === false ||
                                item?.condition === null ? null : (
                                    <a
                                        href={item.href}
                                        key={index}
                                        className="flex items-center justify-between w-full gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
                                        onClick={
                                            item.onClick
                                                ? item.onClick
                                                : undefined
                                        }
                                    >
                                        <span className="text-sm text-gray-700">
                                            {item.label}
                                        </span>
                                        <div className="text-xl">
                                            {item.icon}
                                        </div>
                                    </a>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col w-full relative lg:ps-10">
                {/* Top Header */}
                <div className="bg-white flex items-center justify-between px-6 pe-12 py-4 shadow sticky top-0 z-10">
                    <div className="h-8">
                        <img
                            src="/logo_horizontal.webp"
                            loading="lazy"
                            alt="Logo Sinerco"
                            className="h-full object-contain"
                        />
                    </div>
                    {/* <p className="text-gray-700 text-xl font-medium">
                        <FaBell />
                    </p> */}
                </div>

                {/* Page Content */}
                <main className="p-0 md:py-10 md:px-10 overflow-y-auto bg-[#f5f7f9]">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Heading;
