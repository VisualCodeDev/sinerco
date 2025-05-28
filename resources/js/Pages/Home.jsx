import Card from "@/Components/Card";
import DailyReport from "@/Components/Dashboard/DailyReport";
import UnitTable from "@/Components/Dashboard/UnitTable";
import Modal from "@/Components/Modal";
import PageLayout from "@/Layouts/PageLayout";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Home() {
    const [data, setData] = useState(null);

    const fetchData = async () => {
        const response = await axios.get(route("getDataReport"));
        console.log(response.data);
        setData(response.data);
    };
    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 10000);
        return () => clearInterval(interval);
    }, []);
    return (
        <PageLayout>
            {/* <UnitTable /> */}
            {data ? <DailyReport formData={data} /> : <p>Loading data...</p>}
        </PageLayout>
    );
}
