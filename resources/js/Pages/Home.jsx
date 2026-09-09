import PieChart from "@/Components/PieChart";
import PageLayout from "@/Layouts/PageLayout";
import { FaUserCircle, FaClock, FaPowerOff, FaWarehouse } from "react-icons/fa";
import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Carousel from "@/Components/Carousel";
import {
    getFormattedDate,
    getRequestTypeName,
} from "@/Components/utils/dashboard-util";
import { useAuth } from "@/Components/Auth/auth";
import LoadingSpinner from "@/Components/Loading";
import { getAllUnits, getUnitReports } from "@/Components/db";
import DynamicLineChart from "@/Components/DynamicLineChart";
import UnitReportStatusTable from "@/Components/UnitReportStatusTable";
import StatusPill from "@/Components/StatusPill";

const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

export default function Home() {
    const { user, loading } = useAuth();
    const [data, setData] = useState(null);
    const [requestUnitData, setRequestUnitData] = useState([]);
    const [unitData, setUnitData] = useState([]);
    const [total, setTotal] = useState(0);
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        const [response, respRequestUnitData] = await Promise.all([
            axios.get(route("getUnitStatus")),
            axios.get(route("getRequestUnitStatus")),
        ]);

        if (respRequestUnitData.data) {
            const filteredData = respRequestUnitData?.data?.filter(
                (item) => item.status === "Ongoing",
            );
            setRequestUnitData(respRequestUnitData.data || []);
        }
        if (response.data) {
            let running = 0;
            let down = 0;
            let standby = 0;
            let workshop = 0;
            response.data.reduce((acc, curr) => {
                const status = curr.status;
                if (status === "running") {
                    running += 1;
                }
                if (status === "sd") {
                    down += 1;
                }
                if (status === "stdby") {
                    standby += 1;
                }
                // Unit tanpa client_id berarti unit sedang di workshop
                if (!curr.client_id) {
                    workshop += 1;
                }
            }, {});
            setData({
                running: {
                    label: "Running",
                    value: running,
                    color: "#22c55e",
                },
                down: {
                    label: "Down",
                    value: down,
                    color: "#ef4444",
                },
                standBy: {
                    label: "Standby",
                    value: standby,
                    color: "#eab308",
                },
                workshop: {
                    label: "Workshop",
                    value: workshop,
                    color: "#000000",
                },
            });

            setTotal(response.data?.length);
        }

        // setData(response.data);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    if (!data || loading) {
        return <LoadingSpinner />;
    }

    const getDuration = (start_date, start_time) => {
        const start = new Date(`${start_date}T${start_time}`);
        const diffMs = dateTime - start;

        const diffSec = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSec / 3600);
        const minutes = Math.floor((diffSec % 3600) / 60);

        const formatted = `${hours.toString().padStart(2, "0")} ${
            hours > 0 ? "hours" : "hour"
        }  ${minutes.toString().padStart(2, "0")} ${
            minutes > 0 ? "minutes" : "minute"
        }`;

        return formatted;
    };

    return (
        <PageLayout>
            {/* <UnitTable /> */}
            <div className="flex flex-col gap-5">
                <div className="flex flex-col-reverse md:flex-row w-full gap-4 md:gap-3">
                    {/* PIECHART: donut charts di desktop, stat card ringkas di mobile */}
                    <div className="border border-[#dadee3] bg-white p-4 md:p-10 md:py-6 rounded-lg shadow-md md:w-4/5">
                        {/* Versi mobile: grid 2x2, ringkas tanpa donut chart besar */}
                        <div className="grid grid-cols-2 gap-3 md:hidden">
                            {[
                                data?.running,
                                data?.standBy,
                                data?.down,
                                data?.workshop,
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-[#f8f9fb]"
                                >
                                    <span
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{
                                            backgroundColor:
                                                item?.color || "#000000",
                                        }}
                                    />
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            {item?.label}
                                        </p>
                                        <p className="text-lg font-bold">
                                            {(
                                                item?.value ?? 0
                                            ).toLocaleString()}{" "}
                                            <span className="text-xs font-normal">
                                                Unit
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Versi desktop: donut chart penuh */}
                        <div className="hidden md:flex md:flex-row items-stretch">
                            {[data?.running, data?.standBy, data?.down].map(
                                (chartData, index) => (
                                    <div
                                        key={index}
                                        className="flex-1 min-w-0 flex items-center justify-center"
                                    >
                                        <PieChart
                                            stroke={20}
                                            size={120}
                                            data={chartData || []}
                                            totalData={total}
                                        />
                                    </div>
                                ),
                            )}
                            <div className="flex-1 min-w-0 flex flex-row gap-5 items-center justify-center">
                                <div className="flex flex-col gap-2 md:gap-3 mb-1 text-start whitespace-nowrap">
                                    <p className="text-base md:text-xl text-gray-500">
                                        Total Unit
                                        <br />{" "}
                                        <span className="font-bold text-lg text-black">
                                            {data?.workshop?.label}
                                        </span>
                                    </p>
                                    <p className="text-2xl md:text-4xl font-bold">
                                        {(
                                            data?.workshop?.value ?? 0
                                        ).toLocaleString()}{" "}
                                        <span className="text-base md:text-xl">
                                            Unit
                                        </span>
                                    </p>
                                </div>
                                <div className="flex items-center justify-center rounded-full bg-primary text-white w-[120px] h-[120px] shrink-0">
                                    <FaWarehouse className="text-5xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ADMIN INFO */}
                    <div className="flex items-center md:w-1/5 border border-[#dadee3] bg-white shadow-md p-4 md:p-8 rounded-lg">
                        <div className="flex items-center justify-center gap-5">
                            <div className="text-6xl md:text-[5rem] text-primary">
                                <FaUserCircle />
                            </div>
                            <div className="flex flex-col justify-center font-semibold">
                                <p className="text-lg md:text-2xl">
                                    {user?.name}
                                </p>
                                <p className="text-sm md:text-base text-gray-500 mb-3">
                                    {user?.role === "super_admin"
                                        ? "ADMIN"
                                        : user?.role}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* UNIT TABLE */}
                <div>
                    <div className="relative overflow-x-auto shadow-md sm:rounded-xl max-h-[400px] overflow-auto border border-[#dadee3]">
                        <table className="w-full min-w-[700px] text-sm text-center rtl:text-right border-collapse [&_th]:border [&_th]:border-gray-200 [&_td]:border [&_td]:border-gray-200">
                            <thead className="text-sm text-white uppercase bg-primary">
                                <tr>
                                    <th scope="col" className="px-4 py-2">
                                        Unit
                                    </th>
                                    <th scope="col" className="px-4 py-2">
                                        Location
                                    </th>
                                    <th scope="col" className="px-4 py-2">
                                        Status
                                    </th>
                                    <th scope="col" className="px-4 py-2">
                                        Start
                                    </th>
                                    <th scope="col" className="px-4 py-2">
                                        Remark
                                    </th>
                                    <th scope="col" className="px-4 py-2">
                                        Duration
                                    </th>
                                    <th scope="col" className="px-4 py-2">
                                        PIC
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {requestUnitData &&
                                requestUnitData.length > 0 ? (
                                    requestUnitData.map((item, index) => (
                                        <tr
                                            key={item?.id || index}
                                            className="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer md:text-sm text-xs text-center"
                                            onClick={() =>
                                                router.visit(route("request"))
                                            }
                                        >
                                            <th
                                                scope="row"
                                                className="px-4 py-2 text-gray-900 whitespace-nowrap"
                                            >
                                                <div className="md:text-base font-semibold">
                                                    {item?.unit}
                                                </div>
                                            </th>
                                            <td className="px-4 py-2">
                                                {item?.location}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center justify-center whitespace-nowrap gap-2">
                                                    <StatusPill
                                                        request_type={
                                                            item?.request_type
                                                        }
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <p>
                                                    {getFormattedDate(
                                                        item?.start_date,
                                                    ) || "-"}
                                                </p>
                                                <p>{item?.start_time}</p>
                                            </td>
                                            <td className="px-4 py-2">
                                                {item?.remarks || "-"}
                                            </td>
                                            <td className="px-4 py-2">
                                                {getDuration(
                                                    item?.start_date,
                                                    item?.start_time,
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {item?.pic}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center text-gray-500 py-6 bg-white"
                                        >
                                            All units are running.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* REPORT STATUS */}
                <UnitReportStatusTable />
                {/* STATISTIK */}
                <div className="bg-white rounded-lg p-2">
                    <DynamicLineChart />
                </div>

                <div className="flex md:flex-row flex-col w-full md:gap-10 gap-5 justify-between items-center">
                    <div className="block w-full">
                        <iframe
                            className="md:w-full md:min-h-[480px] w-full h-[300px]"
                            title="Peta Lokasi Unit"
                            src="https://www.google.com/maps/d/u/0/embed?mid=1sLcUWsWeoXzlWSPIA8jsQB8X62MSK80&ehbc=2E312F&noprof=1"
                        ></iframe>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
