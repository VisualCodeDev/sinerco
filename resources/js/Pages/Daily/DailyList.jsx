import UnitTable from "@/Components/Dashboard/UnitTable";
import { getAllRequests } from "@/Components/db";
import OnGoingEvent from "@/Components/Events/OnGoingEvent";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useState } from "react";

const DailyList = ({ data, filters }) => {
    const [requestData, setRequestData] = useState([]);
    const [loading, setLoading] = useState(false);
    const getRequestData = async () => {
        setLoading(true);
        await getAllRequests().then((res) => {
            setRequestData(res);
        });
        setLoading(false);
    };

    useEffect(() => {
        getRequestData();
    }, []);

    if (!data || loading) {
        return <div>WAITING...</div>;
    }
    return (
        <PageLayout>
            <div className="flex flex-col gap-4 pb-4">
            <OnGoingEvent data={requestData} />
            <UnitTable data={data.data} pagination={data} filters={filters} />
            </div>
        </PageLayout>
    );
};

export default DailyList;
