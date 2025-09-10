import { useEffect, useState } from "react";
import { getRequestTypeName } from "../utils/dashboard-util";
import { FaCheck, FaExclamationCircle } from "react-icons/fa";

const Toast = ({ message, onClose }) => {
    return (
        <div
            className={`flex items-center justify-center text-sm md:text-base gap-2 min-w-[280px] md:max-w-[1000px] shadow-lg rounded-lg p-3 md:p-4 mb-4 text-white font-semibold ${
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
