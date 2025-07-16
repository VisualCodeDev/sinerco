import Heading from "@/Components/AdminPage/Heading";
import { AuthGuard } from "@/Components/Auth/auth";
import { RequestModal } from "@/Components/RequestComponents/RequestModal";
import { NotificationContainer } from "@/Components/Toast/Notification";
import { usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";

const PageLayout = ({ children }) => {
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [messages, setMessages] = useState([]);
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
                    <div className="fixed bottom-0 right-0 z-[100] m-12">
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-secondary text-white px-4 py-2 text-lg rounded-md shadow"
                        >
                            Report SD/STDBY
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
