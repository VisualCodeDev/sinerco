import Card from "@/Components/Card";
import DailyReport from "@/Components/Dashboard/DailyReport";
import UnitTable from "@/Components/Dashboard/UnitTable";
import Modal from "@/Components/Modal";
import PieChart from "@/Components/PieChart";
import PageLayout from "@/Layouts/PageLayout";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Home() {
    const [data, setData] = useState(null);
    const [total, setTotal] = useState(0);
    const fetchData = async () => {
        const response = await axios.get(route("getUnitStatus"));
        if (response.data) {
            let online = 0;
            let down = 0;
            let standby = 0;
            console.log(response.data);
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
                    color: "green",
                },
                down: {
                    label: "Down",
                    value: down,
                    color: "red",
                },
                standBy: {
                    label: "Stand By",
                    value: standby,
                    color: "orange",
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
    if (!data) {
        return <div>Loading...</div>;
    }
    return (
        <PageLayout>
            {/* <UnitTable /> */}
            <div className="flex items-center">
                <div className="mt-10 flex justify-center">
                    <iframe
                        src="https://www.google.com/maps/d/u/0/embed?mid=1sLcUWsWeoXzlWSPIA8jsQB8X62MSK80&ehbc=2E312F&noprof=1"
                        width="640"
                        height="480"
                    ></iframe>
                </div>
                <div className="flex justify-evenly w-[60%]">
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
            </div>
            {/* {data ? <DailyReport formData={data} /> : <p>Loading data...</p>} */}
        </PageLayout>
    );
}
