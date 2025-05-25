import NotificationListener from "@/Components/NotificationListener";
import echo from "@/echo";
import { RequestModal } from "@/Pages/Request";
import { usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";

const PageLayout = ({ children }) => {
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    // const [messages, setMessages] = useState(flash.message || []);
    const [messages, setMessages] = useState([]);
    // useEffect(() =>{
    //     if(flash.message){
    //         setMessages(flash.message);
    //     }
    // }, [flash])
    const fetchNotifications = async () => {
        const response = await axios.get("/api/notifications");
        setMessages(response.data);
    };
    // useEffect(() => {
    // const fetchNotifications = async () => {
    //     const response = await axios.get("/api/notifications");
    //     setMessages(response.data);
    // };
    //     console.log(messages);
    //     fetchNotifications();
    // }, []);

    useEffect(() => {
        fetchNotifications();
        const channel = echo.channel("message-channel");
        channel.listen(".message-event", (e) => {
            setMessages((prevMessages) => [e.message, ...prevMessages]);
        });

        return () => {
            echo.leave("message-channel");
        };
    }, []);
    useEffect(() => {
        console.log(messages);
    }, [messages]);

    // useEffect(() => {
    //     if (messages.length > 0) {
    //         const timer = setTimeout(() => {
    //             setMessages([]);
    //         }, 3000);
    //         return () => clearTimeout(timer);
    //     }
    // }, [messages]);
    return (
        <div className="relative">
            <NotificationListener />
            <div className="fixed top-0 right-0 z-[100] m-5 overflow-auto h-screen pointer-events-none">
                {Array.isArray(messages) &&
                    messages
                        .filter((message) => message.status === "Pending")
                        .map((message, index) => (
                            <div
                                key={index}
                                className="bg-gray-100 border-2 rounded-lg px-7 py-4 shadow-md mb-2"
                            >
                                <p>
                                    There is a{" "}
                                    <strong>
                                        {message?.requestType === "stdby"
                                            ? "STAND BY"
                                            : message?.requestType === "sd" &&
                                              "SHUT DOWN"}
                                    </strong>{" "}
                                    request:
                                </p>
                                <p>
                                    Date: <strong>{message?.date}</strong>
                                </p>
                                <p>
                                    Time Start: <strong>{message.time}</strong>
                                </p>
                            </div>
                        ))}
            </div>
            <div className="fixed bottom-0 right-0 z-[100] m-5">
                <button onClick={() => setShowModal(true)}>
                    Report SD/STDBY
                </button>
                <RequestModal
                    handleCloseModal={() => setShowModal(false)}
                    showModal={showModal}
                />
            </div>
            {children}
        </div>
    );
};

export default PageLayout;
