import React, { createContext, useState, useContext } from "react";
import { ToastContainer } from "./Toast";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [messages, setMessages] = useState(null);

    const addToast = (message) => {
        const id = message?.id || Date.now();
        const msgWithId = { ...message, id };

        setMessages(msgWithId); 

        setTimeout(() => {
            setMessages((prev) => (prev?.id === id ? null : prev));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {messages && <ToastContainer messages={messages} />}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
FileReader;
