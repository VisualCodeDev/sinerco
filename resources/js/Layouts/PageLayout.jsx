import Heading from "@/Components/AdminPage/Heading";
import { FaPenAlt } from "react-icons/fa";
import { AuthGuard } from "@/Components/Auth/auth";
import { RequestModal } from "@/Components/RequestComponents/RequestModal";
import { NotificationContainer } from "@/Components/Toast/Notification";
import { usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";

const PageLayout = ({ children }) => {
    const { flash } = usePage().props;
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

    return (
        <Heading>
            <AuthGuard>
                <div className="relative h-full">
                    <NotificationContainer messages={messages} />
                    <div className="fixed bottom-0 right-0 z-[100] md:m-12 m-5">
                        {/* Mobile button */}
                        <button
                            onClick={handleClick}
                            className={`flex items-center gap-2 bg-secondary text-white px-4 py-2 text-lg rounded-full shadow hover:scale-105 transition delay-75 duration-300 ease-in-out 
        ${expanded ? "w-auto" : "w-[50px] h-[50px] justify-center"} md:hidden`} // Only visible on mobile
                        >
                            <FaPenAlt className="text-xl" />
                            {expanded && (
                                <span className="whitespace-nowrap">
                                    Report SD/STDBY
                                </span>
                            )}
                        </button>

                        {/* Desktop button */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="hidden md:flex items-center gap-2 bg-secondary text-white px-4 py-2 text-lg rounded-md shadow hover:bg-secondary hover:scale-105 transition ease-in-out delay-75"
                        >
                            <FaPenAlt className="text-xl" />
                            <span>Report SD/STDBY</span>
                        </button>

                        <RequestModal
                            handleCloseModal={() => setShowModal(false)}
                            showModal={showModal}
                        />
                    </div>
                    {children}
                </div>
            </AuthGuard>
        </Heading>
    );
};

export default PageLayout;
