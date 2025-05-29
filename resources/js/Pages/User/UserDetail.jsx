import TableComponent from "@/Components/TableComponent";
import tColumns from "@/Components/utils/DataUnit/columns";
import PageLayout from "@/Layouts/PageLayout";
import React from "react";

const UserDetail = ({ data }) => {
    const columns = tColumns();
    console.log(data);
    return (
        <PageLayout>
            <TableComponent columns={columns} data={data} />
        </PageLayout>
    );
};

export default UserDetail;
