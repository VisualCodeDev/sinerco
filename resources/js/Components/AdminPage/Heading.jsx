import React, { useState } from "react";
import {
    FaHome,
    FaUser,
    FaAddressBook,
    FaList,
    FaSignInAlt,
    FaSignOutAlt,
    FaMapPin,
    FaHistory,
    FaRegEdit,
    FaUserFriends,
    FaCalendarAlt,
    FaCog,
} from "react-icons/fa";
import { useAuth } from "../Auth/auth";
import LoadingSpinner from "../Loading";

const Heading = ({ children }) => {
    const [isLoading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [openIndex, setOpenIndex] = useState(null);
    const handleSubMenu = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    let menuItems = [];
    const { user, loading } = useAuth();
    if (isLoading || loading) return <LoadingSpinner />;
    const menu = {
        home: {
            icon: <FaHome />,
            label: "Home",
            href: "/",
        },
        clientList: {
            icon: <FaAddressBook />,
            label: "Client List",
            href: route("client.list"),
        },
        area: {
            icon: <FaMapPin />,
            label: "Area",
            href: route("areas"),
        },
        editUnit: {
            icon: <FaRegEdit />,
            label: "Unit Conf. Setting",
            href: route("input.setting"),
        },
        unitList: {
            icon: <FaList />,
            label: "Unit List",
            href: route("daily.list"),
            submenu: [
                // { label: "Data Unit", href: route("daily.list") },
                // {
                //     condition: user?.role === "super_admin",
                //     label: "Unit Input Setting",
                //     href: route("unit.interval.setting"),
                // },
                // {
                //     condition: user?.role === "super_admin",
                //     label: "Input Validation",
                //     href: route("input.setting"),
                // },
                // {
                //     condition: user?.role === "super_admin",
                //     label: "Classified Contract",
                //     href: route("daily.list"),
                // },
                // {
                //     condition: user?.role === "super_admin",
                //     label: "Contract",
                //     href: route("daily.list"),
                // },
            ],
        },
        inputSetting: {
            icon: <FaCog/>,
            condition: user?.role === "super_admin",
            label: "Input Setting",
            href: route("unit.interval.setting"),
        },
        eventHistory: {
            icon: <FaCalendarAlt />,
            label: "Event History",
            href: route("request"),
        },
        // classifiedContract: {
        //     icon: <FaNewspaper />,
        //     label: "Classified Contract",
        //     href: route("daily.list"),
        // },
        // contract: {
        //     icon: <FaSignature />,
        //     label: "Contract",
        //     href: route("daily.list"),
        // },
        accountList: {
            icon: <FaUserFriends />,
            label: "Account list",
            href: route("allocation.setting"),
            // submenu: [
            //     {
            //         label: "User List",
            //         href: route("allocation.setting"),
            //     },
            // ],
        },
        profile: {
            icon: <FaUser />,
            label: "View Profile",
            href: route("profile", { id: user.id }),
        },
        login: {
            icon: <FaSignInAlt />,
            label: "Login",
            onClick: async () => {
                window.location.href = "/login";
            },
        },
        logHistory: {
            icon: <FaHistory />,
            label: "Log History",
            // href: route("profile", { id: user.id }),
        },
        logout: {
            icon: <FaSignOutAlt />,
            label: "Logout",
            onClick: async () => {
                try {
                    await axios.post(route("logout"));
                } catch (error) {
                    console.error("Logout failed:", error);
                } finally {
                    window.location.reload();
                }
            },
        },
    };
    if (user?.role === "super_admin") {
        menuItems = [
            menu.home,
            menu.clientList,
            menu.eventHistory,
            menu.unitList,
            menu.inputSetting,
            menu.accountList,
            menu.logHistory,
            // menu.area,
            // menu.editUnit,
            menu.profile,
        ];
    }
    if (user?.role === "technician") {
        menuItems = [menu.home, menu.unitList, menu.eventHistory];
    }
    if (user?.role === "operator") {
        menuItems = [menu.unitList, menu.eventHistory];
    }
    if (user?.role === "client") {
        menuItems = [menu.home, menu.unitList, menu.eventHistory];
    }
    if (user?.role === "workshop") {
        menuItems = [menu.home, menu.unitList];
    }
    if (user?.role === "management") {
        menuItems = [
            menu.home,
            menu.clientList,
            menu.unitList,
            menu.eventHistory,
        ];
    }
    menuItems.push(menu.logout);

    return (
        <div className="h-screen w-screen overflow-x-hidden relative">
            {/* DESKTOP Sidebar */}
            <div
                className={`bg-white h-full w-48 z-[100] transition-all duration-300 fixed top-0 left-0 shadow-md lg:md:block hidden ${
                    expanded ? "translate-x-0" : "-translate-x-[72%]"
                }`}
                onMouseEnter={() => setExpanded(true)}
                onMouseLeave={() => {
                    setExpanded(false);
                    setOpenIndex(null);
                }}
            >
                <div className="flex flex-col items-center py-4 space-y-4">
                    <img src="/logo_sinerco.webp" alt="Logo" className="h-8" />
                    <div className="w-full mt-4">
                        {menuItems.map((item, index) => (
                            <div key={index} className="w-full">
                                {/* Item utama */}
                                <a
                                    href={item.href}
                                    key={index}
                                    className="flex items-center justify-between w-full mb-2 gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
                                    onClick={() => {
                                        handleSubMenu(index);
                                        item?.onClick && item?.onClick();
                                    }}
                                >
                                    <span className="text-sm text-gray-700 font-bold">
                                        {item.label}
                                    </span>
                                    <div className="text-xl">{item.icon}</div>
                                </a>

                                {/* Submenu */}
                                {Array.isArray(item.submenu) &&
                                    item.submenu.length > 0 &&
                                    openIndex === index && (
                                        <div className="pl-6 font-semibold">
                                            {item.submenu.map((sub, subIndex) =>
                                                sub?.condition === false ||
                                                sub?.condition ===
                                                    null ? null : (
                                                    <a
                                                        key={subIndex}
                                                        href={sub.href}
                                                        className="flex items-center justify-between w-full mb-1 gap-3 px-3 py-1 hover:bg-gray-50 cursor-pointer transition"
                                                    >
                                                        <span className="text-sm text-gray-600">
                                                            {sub.label}
                                                        </span>
                                                    </a>
                                                )
                                            )}
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* PHONE Sidebar */}
            <div className="lg:md:hidden sm:visible">
                <div
                    className="p-2.5 py-3 flex flex-col gap-1 justify-center items-center bg-primary fixed top-3 right-5 z-[100] rounded-full"
                    onClick={() => setExpanded(!expanded)}
                >
                    <div
                        className={`bg-white w-5 h-0.5 transition duration-300 ${
                            expanded && "rotate-45 translate-y-1"
                        }`}
                    />
                    <div className="w-full flex justify-end">
                        <div
                            className={`bg-white w-3 h-0.5 transition duration-300 ${
                                expanded && "rotate-45 translate-y-1 hidden"
                            }`}
                        />
                    </div>
                    <div
                        className={`bg-white w-5 h-0.5 transition duration-300 ${
                            expanded && "-rotate-45 -translate-y-1.5"
                        }`}
                    />
                </div>
                <div
                    className={`bg-white h-full w-48 z-[100] transition-all duration-300 fixed top-0 left-0 shadow-md ${
                        expanded ? "translate-x-0" : "-translate-x-[100%]"
                    }`}
                >
                    <div className="flex flex-col items-center py-4 space-y-4">
                        <div className="self-start px-4">
                            <img
                                src="/logo_sinerco.webp"
                                alt="Logo"
                                className="h-8"
                            />
                        </div>
                        <div className="w-full mt-4">
                            {menuItems.map((item, index) => (
                                <div key={index} className="w-full">
                                    {/* Item utama */}
                                    <a
                                        href={item.href}
                                        key={index}
                                        className="flex items-center justify-between w-full mb-2 gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
                                        onClick={() => {
                                            handleSubMenu(index);
                                            item?.onClick && item?.onClick();
                                        }}
                                    >
                                        <span className="text-sm text-gray-700">
                                            {item.label}
                                        </span>
                                        <div className="text-xl">
                                            {item.icon}
                                        </div>
                                    </a>

                                    {/* Submenu */}
                                    {Array.isArray(item.submenu) &&
                                        item.submenu.length > 0 &&
                                        openIndex === index && (
                                            <div className="pl-6">
                                                {item.submenu.map(
                                                    (sub, subIndex) =>
                                                        sub?.condition ===
                                                            false ||
                                                        sub?.condition ===
                                                            null ? null : (
                                                            <a
                                                                key={subIndex}
                                                                href={sub.href}
                                                                className="flex items-center justify-between w-full mb-1 gap-3 px-3 py-1 hover:bg-gray-50 cursor-pointer transition"
                                                            >
                                                                <span className="text-sm text-gray-600">
                                                                    {sub.label}
                                                                </span>
                                                            </a>
                                                        )
                                                )}
                                            </div>
                                        )}
                                </div>
                            ))}
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
                <main className="p-0 md:py-10 md:px-10 overflow-y-auto bg-[#e8edfc]/50 min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Heading;
