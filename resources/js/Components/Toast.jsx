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
        <div className={`${message.requestType === 'stdby' ? 'bg-warning/80' : 'bg-danger/80'} border shadow-lg rounded-md px-6 py-4 mb-2 animate-slideIn`}>
            <p>
                <strong>{getRequestTypeName(message.requestType)}</strong>{" "}
                Request Available {" "}
                <a
                    href={route('request') + '#' + message.id}
                    className="text-blue-500 hover:underline font-bold text-xs"
                >
                    (View Request)
                </a>
            </p>
            {/* <p>
                Date: <strong>{message?.date}</strong>
            </p>
            <p>
                Time Start: <strong>{message.time}</strong>
            </p> */}
        </div>
    );
};

const ToastContainer = ({ messages, removeMessage }) => {
    return (
        <div className="fixed top-5 right-5 z-[1000]">
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
