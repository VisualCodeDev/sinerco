import Card from "@/Components/Card";
import DailyReport from "@/Components/Dashboard/DailyReport";
import UnitTable from "@/Components/Dashboard/UnitTable";
import Modal from "@/Components/Modal";
import MultiRingChart from "@/Components/MultiPieChart";
import PieChart from "@/Components/PieChart";
import PageLayout from "@/Layouts/PageLayout";
import { FaCalendarWeek, FaUserCircle } from "react-icons/fa";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Home() {
    const [data, setData] = useState(null);
    const [total, setTotal] = useState(0);
    const [multiData, setMultiData] = useState([]);
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formattedTime = dateTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    const today = new Date();

    const formattedDate = today.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const fetchData = async () => {
        const response = await axios.get(route("getUnitStatus"));
        if (response.data) {
            let online = 0;
            let down = 0;
            let standby = 0;
            response.data.reduce((acc, curr) => {
                const status = curr.status;
                if (status === "online") {
                    online += 1;
                }
                if (status === "sd") {
                    down += 1;
                }
                if (status === "stdby") {
                    standby += 1;
                }
            }, {});
            setData({
                online: {
                    label: "Online",
                    value: online,
                    color: "#4ec48f",
                },
                down: {
                    label: "Down",
                    value: down,
                    color: "#c44e4e",
                },
                standBy: {
                    label: "Stand By",
                    value: standby,
                    color: "#f1cf95",
                },
            });

            setMultiData([
                { label: "Online", value: online, color: "#4ec48f" },
                { label: "Down", value: down, color: "#c44e4e" },
                { label: "Stand By", value: standby, color: "#f1cf95" },
            ]);

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
    if (!data) {
        return <div>Loading...</div>;
    }
    return (
        <PageLayout>
            {/* <UnitTable /> */}

            <div className="flex flex-col gap-6 md:gap-10">
                <div className="flex flex-col md:flex-row w-full gap-4 md:gap-10">
                    <div className="flex justify-between items-center md:items-stretch shadow-xl p-4 md:p-8 bg-gradient-to-tr from-primary to-primary/75 md:w-2/3 rounded-lg md:rounded-3xl">
                        <div className="flex flex-col justify-between">
                            <div className="flex items-center mb-6 md:mb-0 gap-2 rounded-md md:rounded-xl bg-primary p-2.5 text-white text-xs md:text-base font-semibold w-fit">
                                <FaCalendarWeek />
                                <p className="">
                                    {formattedDate}, {formattedTime}
                                </p>
                            </div>
                            <div className="flex flex-col md:gap-3">
                                <p className="text-white font-bold text-xl md:text-5xl">
                                    Good Day! Admin
                                </p>
                                <p className="text-white text-base md:text-xl">
                                    Have a Nice Day!
                                </p>
                            </div>
                        </div>
                        <div className="w-[40%] md:w-1/3 md:mr-10">
                            <img src="/dashboard_icon.png" alt="" />
                        </div>
                    </div>

                    {/* ADMIN INFO */}
                    <div className="flex flex-row md:w-1/3 bg-white shadow-xl p-4 md:p-8 rounded-lg md:rounded-3xl">
                        <div className="flex justify-center gap-5">
                            <div className="text-8xl text-primary">
                                <FaUserCircle />
                            </div>
                            <div className="flex flex-col font-semibold">
                                <p className="text-2xl">Admin Name</p>
                                <p className="text-gray-500 mb-3">
                                    Admin Email
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PIECHART */}
                <div className="flex md:flex-row flex-col justify-between items-center gap-4 bg-white p-4 md:p-10 md:py-4 rounded-lg md:rounded-3xl shadow-xl">
                    <div className="md:w-1/3">
                        <PieChart
                            stroke={20}
                            size={120}
                            data={data?.online ? data.online : []}
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
                <div className="flex md:flex-row flex-col w-full md:gap-10 justify-between items-center">
                    <div className="w-full flex justify-between items-center gap-4 bg-white p-4 md:p-10 rounded-lg md:rounded-3xl shadow-xl">
                        <MultiRingChart
                            data={multiData}
                            size={180}
                            stroke={12}
                            gap={18}
                        />
                    </div>
                    <div className="hidden md:block">
                        <iframe
                            src="https://www.google.com/maps/d/u/0/embed?mid=1sLcUWsWeoXzlWSPIA8jsQB8X62MSK80&ehbc=2E312F&noprof=1"
                            width="800"
                            height="280"
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
                        data={data?.online ? data.online : []}
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
