import { useEffect, useState } from "react";
import { getRequestTypeName } from "../utils/dashboard-util";

const Notification = ({ message, onClose }) => {
    return (
        <div
            className={`${
                message.requestType === "stdby"
                    ? "bg-warning/80"
                    : message.requestType === "sd" && "bg-danger/80"
            } border shadow-lg rounded-md px-6 py-4 mb-2 animate-slideIn`}
        >
            <p>
                <strong>{getRequestTypeName(message.requestType)}</strong>{" "}
                <span className="text-xs">({message?.status})</span> Request
                Available{" "}
                <a
                    href={route("request") + "#" + message.id}
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
