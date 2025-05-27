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
                window.location.href = "/dashboard";
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
        <div className="flex flex-col justify-center items-start w-screen bg-white p-10">
            <p>Hello</p>
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
                <div className="flex flex-col gap-2">
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
                        [...Array(Math.ceil(cellItem.length / 2))].map(
                            (_, rowIndex) => (
                                <div key={rowIndex} className="flex gap-4 mb-4">
                                    {cellItem
                                        .slice(rowIndex * 2, rowIndex * 2 + 2)
                                        .map((item) => (
                                            <div
                                                className="flex flex-col w-1/2"
                                                key={item.name}
                                            >
                                                <label
                                                    htmlFor={item.header}
                                                    className="text-lg font-bold mb-1"
                                                >
                                                    {item.header}
                                                </label>

                                                {item.header.toLowerCase() ===
                                                "time" ? (
                                                    <TimeInput
                                                        id={item.header}
                                                        className="w-full"
                                                        name={item.name}
                                                        value={
                                                            data[item.name] ||
                                                            ""
                                                        }
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
                                                                    (
                                                                        subItem
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                subItem.name
                                                                            }
                                                                            className="flex flex-col w-full"
                                                                        >
                                                                            <label className="text-sm">
                                                                                {
                                                                                    subItem.sub
                                                                                }
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
                                                                                    ] ||
                                                                                    ""
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
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
                                                                                className="border px-2 py-1 rounded"
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
                                                                value={
                                                                    data[
                                                                        item
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
                                                                className="border px-2 py-1 rounded"
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            )
                        )}
                </div>
                <div>
                    <button type="submit" className="font-bold w-full h-full">
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DailyReportForm;
