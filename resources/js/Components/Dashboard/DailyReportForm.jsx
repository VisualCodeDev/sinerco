import React, { useEffect, useState } from "react";
import Card from "../Card";
import {
    cellItem,
    DateInput,
    getCurrDateTime,
    TimeInput,
} from "../utils/dashboard-util";
import { router, usePage } from "@inertiajs/react";
import tColumns from "../utils/DailyReport/columns";

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

    console.log("Data:", data);
    const handleChange = ([field], value) => {
        setData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };
    const columns = tColumns(handleChange);
    useEffect(() => {
        setData((prevData) => {
            const dateTime = getCurrDateTime();
            const now = dateTime.now;
            const time = now.format("HH") + ":00";
            const date = dateTime.date;
            const newData = {
                ...prevData,
                time,
                date,
            };
            return newData;
        });
    }, []);
    return (
        <div className="flex flex-col justify-center items-start w-screen bg-white p-10">
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
                <div className="grid grid-cols-2 gap-4 mb-4 items-center">
                    {columns.map((col) => (
                        <div
                            key={col.header}
                            style={{
                                gridColumn: "span " + col.gridCols,
                            }}
                        >
                            {typeof col.Cell === "function"
                                ? col.Cell(
                                      {
                                          item: data[col?.name],
                                          header: col.header,
                                          name: col.name,
                                          subheader: col?.subheader || [],
                                      } || ""
                                  )
                                : col.Cell}
                        </div>
                    ))}
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
