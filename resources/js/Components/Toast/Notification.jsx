import { useEffect, useState } from "react";
import { getRequestTypeName } from "../utils/dashboard-util";

const Notification = ({ message }) => {
    const [animate, setAnimate] = useState("slideIn");
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setAnimate("slideOut");
            setTimeout(() => setVisible(false), 400);
        }, 3000);
        return () => clearTimeout(timeout);
    }, []);

    if (!visible) return null;

    return (
        <div
            className={`${
                message.request_type === "stdby"
                    ? "bg-yellow-100 border-yellow-400"
                    : message.request_type === "sd" &&
                      "bg-red-100 border-red-400"
            } border shadow-lg rounded-md px-6 py-4 mb-3 transition-all flex items-center gap-3 min-w-[25vw]
            ${animate === "slideIn" ? "animate-slideIn" : "animate-slideOut"}`}
        >
            {/* Icon */}
            <div className="text-2xl">
                {message.request_type === "stdby" ? "⚠️" : "🚨"}
            </div>

            {/* Content */}
            <div className="text-sm text-gray-800 leading-snug flex justify-between items-center w-full">
                <p className="font-semibold text-base text-gray-900">
                    {getRequestTypeName(message.request_type)}{" "}
                    <span className="ml-1">Alert!!</span>
                </p>

                <a
                    href={route("request") + "#" + message.id}
                    className={`inline-block mt-1 text-xs font-semibold underline px-2 py-1 rounded 
                    ${
                        message?.requestType === "stdby"
                            ? "text-yellow-800 bg-yellow-200"
                            : "text-red-800 bg-red-200"
                    } hover:bg-opacity-80 transition`}
                >
                    View Request
                </a>
            </div>
        </div>
    );
};

const NotificationContainer = ({ messages, removeMessage, isCentered }) => {
    return (
        <div
            className={`fixed ${
                isCentered
                    ? "top-5 left-1/2 transform -translate-x-1/2"
                    : "top-5 right-5"
            } z-[1000]`}
        >
            {Array.isArray(messages) ? (
                messages.map((message, index) => (
                    <Notification
                        key={message.id}
                        message={message}
                        // onClose={() => removeMessage(message.id)}
                    />
                ))
            ) : (
                <Notification message={messages} />
            )}
        </div>
    );
};
export { Notification, NotificationContainer };
