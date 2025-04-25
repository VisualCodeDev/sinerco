import PageLayout from "@/Layouts/PageLayout";
import { useForm } from "@inertiajs/react";
import React, { useState } from "react";

const Request = () => {
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
    return (
        <PageLayout>
            <form onSubmit={handleSubmit} method="POST">
                <select
                    value={data.requestType || ""}
                    onChange={(e) =>
                        handleChange(["requestType"], e.target.value)
                    }
                >
                    <option>Choose</option>
                    <option value={"stdby"}>Stand By</option>
                    <option value={"sd"}>Shut Down</option>
                </select>
                <input
                    name="date"
                    type="date"
                    value={data.date || ""}
                    onChange={(e) =>
                        handleChange([e.target.name], e.target.value)
                    }
                />
                <input
                    name="time"
                    type="time"
                    value={data.time || ""}
                    onChange={(e) =>
                        handleChange([e.target.name], e.target.value)
                    }
                />
                <button type="submit">Submit</button>
            </form>
        </PageLayout>
    );
};

export default Request;
