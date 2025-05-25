import { getCurrDateTime } from "@/Components/Dashboard/dashboard-util";
import Modal from "@/Components/Modal";
import PageLayout from "@/Layouts/PageLayout";
import { useForm } from "@inertiajs/react";
import React, { useEffect, useState } from "react";

const Request = ({ handleCloseModal, showModal }) => {
    const { data, setData, post } = useForm({
        requestType: "",
        date: "",
        time: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        post("/request/post", data);
        setData({});
    };

    const handleChange = ([field], value) => {
        setData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };

    useEffect(() => {
        if (showModal) {
            const dataDateTime = getCurrDateTime();
            setData((prevData) => ({
                ...prevData,
                date: dataDateTime.date,
                time: dataDateTime.time,
            }));
        }
        console.log(data);
    }, [showModal]);
    return (
        <Modal
            title="Report SD/STDBY"
            size="md"
            handleCloseModal={handleCloseModal}
            showModal={showModal}
        >
            <Modal.Body>
                <form onSubmit={handleSubmit} method="POST">
                    <div>
                        <label htmlFor="request">Request: </label>
                        <select
                            id="request"
                            value={data.requestType || ""}
                            onChange={(e) =>
                                handleChange(["requestType"], e.target.value)
                            }
                        >
                            <option>Choose</option>
                            <option value={"stdby"}>Stand By</option>
                            <option value={"sd"}>Shut Down</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="date">Date: </label>
                        <input
                            id="date"
                            name="date"
                            type="date"
                            value={data.date || ""}
                            onChange={(e) =>
                                handleChange([e.target.name], e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label htmlFor="time">Time: </label>
                        <input
                            id="time"
                            name="time"
                            type="time"
                            value={data.time || ""}
                            onChange={(e) =>
                                handleChange([e.target.name], e.target.value)
                            }
                        />
                    </div>
                    <button type="submit">Submit</button>
                </form>
            </Modal.Body>

        </Modal>
    );
};

export default Request;
