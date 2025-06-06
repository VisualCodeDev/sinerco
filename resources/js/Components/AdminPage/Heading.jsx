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
} from "react-icons/fa";
import { useAuth } from "../Auth/auth";

const Heading = ({ children }) => {
    const [expanded, setExpanded] = useState(false);
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;

    const menuItems = [
        { icon: <FaHome />, label: "Home", href: "/" },
        {
            condition: user?.role === "super_admin",
            icon: <FaAddressBook />,
            label: "Client List",
            href: route("client.list"),
        },
        { icon: <FaList />, label: "Unit List", href: route("daily.list") },
        { icon: <FaTh />, label: "Request List", href: route("request") },
        {
            condition: user?.role === "super_admin",
            icon: <FaUser />,
            label: "Allocation Settings",
            href: route("allocation.setting"),
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
        <div className="flex h-screen overflow-hidden w-screen">
            {/* Sidebar */}
            <div
                className={`bg-white h-full transition-all duration-300 sticky top-0 shadow-md ${
                    expanded ? "w-48" : "w-16"
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
                                    className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
                                    onClick={
                                        item.onClick ? item.onClick : undefined
                                    }
                                >
                                    <div className="text-xl">{item.icon}</div>
                                    {expanded && (
                                        <span className="text-sm text-gray-700">
                                            {item.label}
                                        </span>
                                    )}
                                </a>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col w-full relative">
                {/* Top Header */}
                <div className="bg-white flex items-center justify-between px-6 py-4 shadow sticky top-0 z-10">
                    <div className="h-8">
                        <img
                            src="/logo_horizontal.webp"
                            loading="lazy"
                            alt="Logo Sinerco"
                            className="h-full object-contain"
                        />
                    </div>
                    <p className="text-gray-700 text-lg font-medium">
                        Hello Admin!
                    </p>
                </div>

                {/* Page Content */}
                <main className="py-10 px-10 overflow-y-auto bg-[#f5f7f9]">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Heading;
