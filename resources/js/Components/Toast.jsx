import { useEffect, useState } from "react";
import { getRequestTypeName } from "./utils/dashboard-util";

const Toast = ({ message, onClose }) => {
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         onClose();
    //     }, 5000);

    //     return () => clearTimeout(timer);
    // }, []);

    return (
        <div className="bg-white border border-gray-300 shadow-lg rounded-md px-6 py-4 mb-4 w-80 animate-slideIn">
            <p>
                There is a{" "}
                <strong>{getRequestTypeName(message.requestType)}</strong>{" "}
                request:
            </p>
            <p>
                Date: <strong>{message?.date}</strong>
            </p>
            <p>
                Time Start: <strong>{message.time}</strong>
            </p>
            <a
                href={`/dashboard/request#${message.id}`}
                className="text-blue-500 hover:underline"
            >
                View Request
            </a>
        </div>
    );
};

const ToastContainer = ({ messages, removeMessage }) => {
    return (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[1000]">
            {messages
                .filter((msg) => msg.status === "Pending")
                .map((message, index) => (
                    <Toast
                        key={message.id}
                        message={message}
                        onClose={() => removeMessage(message.id)}
                    />
                ))}
        </div>
    );
};
export { Toast, ToastContainer };