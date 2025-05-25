import React, { useState } from "react";
import Card from "../Card";
import { cellItem, DateInput, TimeInput } from "../utils/dashboard-util";
import { router, usePage } from "@inertiajs/react";

const DailyReportForm = () => {
    const [data, setData] = useState({});
    const [status, setStatus] = useState();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const resp = await axios.post("/daily/add", data);
            if (resp.status === 200 || resp.status === 302) {
                console.log(status);
                setData({});
                window.location.href = '/dashboard';
            } else {
                setStatus("failed");
            }
        } catch (err) {
            console.error("Error creating report:", err);
            setStatus("error");
        }
    };

    const handleChange = ([field], value) => {
        setData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };

    return (
        <Card form>
            <Card.Header headerSticky className="relative">
                Form Daily Report
            </Card.Header>
            <div
                className={`sticky top-0 left-0 ${
                    status === "success"
                        ? "bg-green-600 w-100"
                        : "bg-red-600 border-red-500 w-100"
                }`}
            >
                {status === "success" ? (
                    <div className="text-white">
                        <p>Success</p>
                    </div>
                ) : (
                    (status === "failed" || status === "error") && (
                        <div className="text-white">
                            <p>Fail to Submit</p>
                        </div>
                    )
                )}
            </div>
            <form onSubmit={handleSubmit} method="POST">
                <Card.Body className="flex flex-col gap-2">
                    <div className="flex flex-col">
                        <label htmlFor="time" className="font-bold text-lg">
                            Tanggal
                        </label>
                        <DateInput
                            id="time"
                            className="w-full"
                            name="time"
                            value={data.date || ""}
                            onChange={(e) =>
                                handleChange([e.target.name], e.target.value)
                            }
                        />
                    </div>
                    {cellItem &&
                        cellItem.map((item) => (
                            <div className="flex flex-col" key={item.name}>
                                <label
                                    htmlFor={item.header}
                                    className="text-lg font-bold"
                                >
                                    {item.header}
                                </label>
                                {item.header.toLowerCase() === "time" ? (
                                    <TimeInput
                                        id={item.header}
                                        className="w-full"
                                        name={item.name}
                                        value={data[item.name] || ""}
                                        onChange={(e) =>
                                            handleChange(
                                                [e.target.name],
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : (
                                    <>
                                        {item.subheader ? (
                                            <div className="flex flex-wrap gap-2">
                                                {item.subheader.map(
                                                    (subItem) => (
                                                        <div
                                                            key={subItem.name}
                                                            className="flex flex-col"
                                                        >
                                                            <label>
                                                                {subItem.sub}
                                                            </label>
                                                            <input
                                                                required
                                                                type="number"
                                                                name={
                                                                    subItem.name
                                                                }
                                                                value={
                                                                    data[
                                                                        subItem
                                                                            .name
                                                                    ] || ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        [
                                                                            e
                                                                                .target
                                                                                .name,
                                                                        ],
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    )
                                                                }
                                                                placeholder="00.0"
                                                            />
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <input
                                                required
                                                type="number"
                                                name={item.name}
                                                value={data[item.name] || ""}
                                                onChange={(e) =>
                                                    handleChange(
                                                        [e.target.name],
                                                        parseFloat(
                                                            e.target.value
                                                        )
                                                    )
                                                }
                                                placeholder="00.0"
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                </Card.Body>
                <Card.Footer>
                    <button type="submit" className="font-bold w-full h-full">
                        Simpan
                    </button>
                </Card.Footer>
            </form>
        </Card>
    );
};

export default DailyReportForm;
