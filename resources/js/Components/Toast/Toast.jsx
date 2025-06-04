import { useEffect, useState } from "react";
import { getRequestTypeName } from "../utils/dashboard-util";
import { FaCheck, FaExclamationCircle } from "react-icons/fa";

const Toast = ({ message, onClose }) => {
    return (
        <div
            className={`flex items-center justify-center gap-2 max-w-[400px] shadow-lg rounded-lg p-4 mb-4 text-white font-bold ${
                message?.type === "success"
                    ? " bg-success"
                    : message?.type === "error"
                    ? " bg-danger"
                    : ""
            }`}
        >
            {message?.type === "success" ? (
                <FaCheck />
            ) : (
                message?.type === "error" && <FaExclamationCircle />
            )}
            <div>{message.text}</div>
        </div>
    );
};

const ToastContainer = ({ messages }) => {
    return (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[1000]">
            <Toast message={messages} key={messages?.id} />
        </div>
    );
};
export { Toast, ToastContainer };
