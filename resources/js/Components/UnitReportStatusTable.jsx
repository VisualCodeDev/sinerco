import React, { useEffect, useState } from "react";
import { getAllReports } from "./db";
import { BiRefresh } from "react-icons/bi";

const UnitReportStatusTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReports = async () => {
        try {
            setLoading(true);

            const reports = await getAllReports();

            setData(reports);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="bg-white border border-[#dadee3] rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#eceff3]">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Unit Report Status
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Monitor latest submitted reports from all units
                    </p>
                </div>

                <button
                    onClick={fetchReports}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
                >
                    <BiRefresh/>
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* Table */}
            <div className="overflow-auto max-h-[450px]">
                <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 bg-[#f8fafc] border-b border-[#eceff3] z-1">
                        <tr className="text-gray-500 uppercase text-xs tracking-wider">
                            <th className="px-6 py-4 font-semibold">Unit</th>
                            <th className="px-6 py-4 font-semibold">
                                Location
                            </th>
                            <th className="px-6 py-4 font-semibold">Area</th>
                            <th className="px-6 py-4 font-semibold">
                                Last Submitted
                            </th>
                            <th className="px-6 py-4 font-semibold text-center">
                                Status
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {data && data.length > 0 ? (
                            data.map((item, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-[#f1f3f5] hover:bg-[#fafafa] transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {item?.unit}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {item?.location}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {item?.area}
                                    </td>

                                    <td
                                        className={`px-6 py-4 font-medium ${
                                            item?.color === "red"
                                                ? "text-red-500"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {item?.last_report_time}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <div
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    item?.color === "red"
                                                        ? "bg-red-100 text-red-600"
                                                        : "bg-green-100 text-green-600"
                                                }`}
                                            >
                                                {item?.color === "red"
                                                    ? "Delayed"
                                                    : "Active"}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center text-gray-400 py-16 bg-white"
                                >
                                    No report data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UnitReportStatusTable;