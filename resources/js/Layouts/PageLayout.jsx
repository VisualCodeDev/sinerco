import Heading from "@/Components/AdminPage/Heading";
import { ToastContainer } from "@/Components/Toast";
import { getRequestTypeName } from "@/Components/utils/dashboard-util";
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

    // useEffect(() => {
    //     fetchNotifications();
    //     const channel = echo.channel("message-channel");
    //     channel.listen(".message-event", (e) => {
    //         setMessages((prevMessages) => [e.message, ...prevMessages]);
    //     });

    //     return () => {
    //         echo.leave("message-channel");
    //     };
    // }, []);

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(() => {
            fetchNotifications();
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    return (
        <Heading>
            <div className="relative">
                 <ToastContainer messages={messages}/>
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
        </Heading>
    );
};

export default PageLayout;
