import PieChart from "@/Components/PieChart";
import PageLayout from "@/Layouts/PageLayout";
import { FaUserCircle, FaClock, FaPowerOff } from "react-icons/fa";
import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Carousel from "@/Components/Carousel";
import { getRequestTypeName } from "@/Components/utils/dashboard-util";
import { useAuth } from "@/Components/Auth/auth";
import LoadingSpinner from "@/Components/Loading";

export default function Home() {
    const { user, loading } = useAuth();
    const [data, setData] = useState(null);
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
        const response = await axios.get(route("getUnitStatus"));
        const respUnitData = await axios.get(route("getRequestUnitStatus"));
        if (respUnitData.data) {
            const filteredData = respUnitData?.data?.filter(
                (item) => item.status === "Ongoing"
            );
            setUnitData(filteredData || []);
        }
        if (response.data) {
            let running = 0;
            let down = 0;
            let standby = 0;
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
            }, {});
            setData({
                running: {
                    label: "Running",
                    value: running,
                    color: "#4ec48f",
                },
                down: {
                    label: "Down",
                    value: down,
                    color: "#c44e4e",
                },
                standBy: {
                    label: "Standby",
                    value: standby,
                    color: "#f1cf95",
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

    const getDuration = (startDate, startTime) => {
        const start = new Date(`${startDate}T${startTime}`);
        const diffMs = dateTime - start;

        const diffSec = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSec / 3600);
        const minutes = Math.floor((diffSec % 3600) / 60);

        const formatted = `${hours.toString().padStart(2, "0")} jam ${minutes
            .toString()
            .padStart(2, "0")} menit`;

        return formatted;
    };

    return (
        <PageLayout>
            {/* <UnitTable /> */}
            <div className="flex flex-col gap-6 md:gap-10">
                <div className="flex flex-col-reverse md:flex-row w-full gap-4 md:gap-10">
                    {/* <div className="flex justify-between items-center md:items-stretch shadow-xl p-4 md:p-8 bg-gradient-to-tr from-primary to-primary/75 md:w-2/3 rounded-lg md:rounded-3xl">
                        <div className="flex flex-col justify-between">
                            <div className="flex items-center mb-6 md:mb-0 gap-2 rounded-md md:rounded-xl bg-primary p-2.5 text-white text-xs md:text-base font-semibold w-fit">
                                <FaCalendarWeek />
                                <p className="">
                                    {formattedDate}, {formattedTime}
                                </p>
                            </div>
                            <div className="flex flex-col md:gap-3">
                                <p className="text-white font-bold text-xl md:text-5xl">
                                    Good Day! {user?.name}
                                </p>
                                <p className="text-white text-base md:text-xl">
                                    Have a Nice Day!
                                </p>
                            </div>
                        </div>
                        <div className="w-[40%] md:w-1/3 md:mr-10">
                            <img src="/dashboard_icon.png" alt="" />
                        </div>
                    </div> */}
                    {/* PIECHART */}
                    <div className="flex md:flex-row flex-col justify-between items-center gap-4 bg-white p-4 md:p-10 md:py-6 rounded-lg md:rounded-3xl shadow-xl md:w-3/4">
                        <div className="md:w-1/3">
                            <PieChart
                                stroke={20}
                                size={120}
                                data={data?.running ? data.running : []}
                                totalData={total}
                            />
                        </div>
                        <div className="md:w-1/3">
                            <PieChart
                                stroke={20}
                                size={120}
                                data={data?.standBy ? data.standBy : []}
                                totalData={total}
                            />
                        </div>
                        <div className="md:w-1/3">
                            <PieChart
                                stroke={20}
                                size={120}
                                data={data?.down ? data.down : []}
                                totalData={total}
                            />
                        </div>
                    </div>
                    {/* ADMIN INFO */}
                    <div className="flex items-center md:w-1/4 bg-white shadow-xl p-4 md:p-8 rounded-lg md:rounded-3xl">
                        <div className="flex items-center justify-center gap-5">
                            <div className="text-6xl md:text-[5rem] text-primary">
                                <FaUserCircle />
                            </div>
                            <div className="flex flex-col justify-center font-semibold">
                                <p className="text-lg md:text-2xl">
                                    {user?.name}
                                </p>
                                <p className="text-sm md:text-base text-gray-500 mb-3">
                                    {user?.role}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* UNIT TABLE */}
                <div>
                    <div class="relative overflow-x-auto shadow-md sm:rounded-xl max-h-[400px] overflow-auto">
                        <table class="w-full text-sm text-left rtl:text-right">
                            <thead class="text-xs text-white uppercase bg-primary">
                                <tr>
                                    <th scope="col" class="px-6 py-3">
                                        Unit
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Location
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Status
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Remark
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Duration
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        PIC
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {unitData && unitData.length > 0 ? (
                                    unitData.map((item, index) => (
                                        <tr
                                            class="bg-white border-b border-gray-200 hover:bg-gray-50 cursor-pointer md:text-sm text-xs"
                                            // key={item?.id || index}
                                            onClick={() =>
                                                router.visit(route("request"))
                                            }
                                        >
                                            <th
                                                scope="row"
                                                class="flex h-full items-center px-6 py-4 text-gray-900 whitespace-nowrap"
                                            >
                                                <div class="md:text-base font-semibold">
                                                    {item?.unit?.unit}
                                                </div>
                                            </th>
                                            <td class="px-6 py-4">
                                                {item?.location?.location}
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="flex items-center whitespace-nowrap gap-2">
                                                    {/* <div
                                                            class={`md:h-2.5 md:w-2.5 w-2 h-2 rounded-full ${
                                                                item?.requestType ===
                                                                "stdby"
                                                                    ? "bg-yellow-500"
                                                                    : "bg-red-500"
                                                            } me-2`}
                                                        ></div>{" "} */}
                                                    {item?.requestType ===
                                                    "stdby" ? (
                                                        <FaClock
                                                            color="orange"
                                                            className="md:h-4 md:w-4 w-3 h-3"
                                                        />
                                                    ) : (
                                                        <FaPowerOff
                                                            color="red"
                                                            className="md:h-4 md:w-4 w-3 h-3"
                                                        />
                                                    )}
                                                    <p>
                                                        {getRequestTypeName(
                                                            item?.requestType
                                                        )}
                                                    </p>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                {item?.remarks || "-"}
                                            </td>
                                            <td class="px-6 py-4">
                                                {getDuration(
                                                    item?.startDate,
                                                    item?.startTime
                                                )}
                                            </td>
                                            <td class="px-6 py-4">
                                                {item?.pic?.name}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center text-gray-500 py-6"
                                        >
                                            All units are running.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="flex md:flex-row flex-col w-full md:gap-10 gap-5 justify-between items-center">
                    {/* <div className="md:w-1/2 flex justify-between items-center gap-4 bg-white p-4 md:p-10 rounded-lg md:rounded-3xl shadow-xl">
                        <MultiRingChart
                            data={multiData}
                            size={180}
                            stroke={12}
                            gap={18}
                        />
                    </div> */}
                    <div className="block w-full">
                        <iframe
                            className="md:w-full md:min-h-[480px] w-screen h-[300px]"
                            src="https://www.google.com/maps/d/u/0/embed?mid=1sLcUWsWeoXzlWSPIA8jsQB8X62MSK80&ehbc=2E312F&noprof=1"
                        ></iframe>
                    </div>
                </div>
            </div>
            {/* <div className="flex flex-col lg:items-center justify-center md:items-start">
                <div className="flex justify-evenly w-[60%]">
                    <p>Today's date is {formattedDate}</p>
                    <PieChart
                        stroke={20}
                        size={130}
                        data={data?.running ? data.running : []}
                        totalData={total}
                    />
                    <PieChart
                        stroke={20}
                        size={130}
                        data={data?.standBy ? data.standBy : []}
                        totalData={total}
                    />
                    <PieChart
                        stroke={20}
                        size={130}
                        data={data?.down ? data.down : []}
                        totalData={total}
                    />
                </div>
                <div className="mt-10 flex justify-center">
                    <iframe
                        src="https://www.google.com/maps/d/u/0/embed?mid=1sLcUWsWeoXzlWSPIA8jsQB8X62MSK80&ehbc=2E312F&noprof=1"
                        width="640"
                        height="480"
                    ></iframe>
                </div>
            </div> */}
            {/* {data ? <DailyReport formData={data} /> : <p>Loading data...</p>} */}
        </PageLayout>
    );
}
