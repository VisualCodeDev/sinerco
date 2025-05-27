import React, { useState } from "react";
import { FaHome, FaTh, FaUser, FaLock } from "react-icons/fa";

const menuItems = [
    { icon: <FaHome />, label: "Dashboard", href: "/dashboard/daily" },
    { icon: <FaTh />, label: "Request List", href: "/dashboard/request" },
    { icon: <FaUser />, label: "Profile" },
    { icon: <FaLock />, label: "Security" },
];

const Heading = ({ children }) => {
    const [expanded, setExpanded] = useState(false);

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
                        {menuItems.map((item, index) => (
                            <a
                                href={item.href}
                                key={index}
                                className="flex items-center gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
                            >
                                <div className="text-xl">{item.icon}</div>
                                {expanded && (
                                    <span className="text-sm text-gray-700">
                                        {item.label}
                                    </span>
                                )}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col w-full">
                {/* Top Header */}
                <div className="bg-white flex items-center justify-between px-6 py-4 shadow sticky top-0 z-10">
                    <div className="h-8">
                        <img
                            src="/logo_horizontal.webp"
                            alt="Logo Sinerco"
                            className="h-full object-contain"
                        />
                    </div>
                    <p className="text-gray-700 text-lg font-medium">
                        Hello Admin!
                    </p>
                </div>

                {/* Page Content */}
                <main className="py-10 px-20 overflow-y-auto bg-primary/5">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Heading;
