import { usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";

const PageLayout = ({ children }) => {
    const { flash } = usePage().props;
    // const [messages, setMessages] = useState(flash.message || []);
    const [messages, setMessages] = useState([]);
    // useEffect(() =>{
    //     if(flash.message){
    //         setMessages(flash.message);
    //     }
    // }, [flash])

    useEffect(() => {
        const fetchNotifications = async () => {
            const response = await axios.get("/api/notifications");
            setMessages(response.data);
        };
        console.log(messages);
        fetchNotifications();
    }, []);

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
            {children}
        </div>
    );
};

export default PageLayout;
