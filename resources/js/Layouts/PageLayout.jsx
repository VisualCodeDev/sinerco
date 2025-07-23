import Heading from "@/Components/AdminPage/Heading";
import { FaPenAlt } from "react-icons/fa";
import { AuthGuard, useAuth } from "@/Components/Auth/auth";
import { RequestModal } from "@/Components/RequestComponents/RequestModal";
import { NotificationContainer } from "@/Components/Toast/Notification";
import { usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/Components/Loading";

const PageLayout = ({ children }) => {
    const { user, loading } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [messages, setMessages] = useState([]);

    const handleClick = () => {
        if (!expanded) {
            setExpanded(true);
            setTimeout(() => setExpanded(false), 3000);
        } else {
            setShowModal(true);
            setExpanded(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await axios.get("/api/notifications");
            setMessages(response.data);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => {
            fetchNotifications();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Heading>
            <AuthGuard>
                <div className="relative h-full">
                    <NotificationContainer messages={messages} />
                    {user && user?.role === "operator" && (
                        <div className="fixed bottom-0 right-0 z-[100] md:m-12 m-5">
                            {/* Mobile button */}
                            <button
                                onClick={handleClick}
                                className={`flex items-center bg-secondary text-white text-lg rounded-full shadow hover:scale-105 transition delay-75 duration-300 ease-in-out 
                                ${
                                    expanded
                                        ? "w-auto"
                                        : "w-[50px] h-[50px] justify-center px-4 py-2 gap-2"
                                } md:hidden`} // Only visible on mobile
                            >
                                <FaPenAlt
                                    className={`text-xl ${
                                        expanded && "hidden"
                                    }`}
                                />
                                {expanded && (
                                    // <span className="whitespace-nowrap">
                                    //     SD/STDBY
                                    // </span>
                                    <>
                                        <span className="bg-red-500 px-4 py-2 rounded-l-full whitespace-nowrap">
                                            SD
                                        </span>
                                        <span className="bg-yellow-500 px-4 py-2 rounded-r-full whitespace-nowrap">
                                            STDBY
                                        </span>
                                    </>
                                )}
                            </button>

                            {/* Desktop button */}
                            <button
                                onClick={() => setShowModal(true)}
                                className="hidden md:flex items-center text-white text-lg rounded-md hover:scale-105 transition ease-in-out delay-75"
                            >
                                <span className="bg-red-500 px-4 py-2 rounded-l-full shadow ">
                                    SD
                                </span>
                                <span className="bg-yellow-500 px-4 py-2 rounded-r-full shadow ">
                                    STDBY
                                </span>
                            </button>
                            <RequestModal
                                handleCloseModal={() => setShowModal(false)}
                                showModal={showModal}
                            />
                        </div>
                    )}
                    {children}
                </div>
            </AuthGuard>
        </Heading>
    );
};

export default PageLayout;
