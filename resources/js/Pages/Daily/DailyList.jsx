import UnitTable from "@/Components/Dashboard/UnitTable";
import PageLayout from "@/Layouts/PageLayout";
import React from "react";

const DailyList = ({ data }) => {
    if (!data) {
        return <div>WAITING...</div>;
    }

    return (
        <PageLayout>
            <UnitTable data={data} />
        </PageLayout>
    );
};

export default DailyList;
