import TableComponent from "@/Components/TableComponent";
import tColumns from "@/Components/utils/User/columns";
import PageLayout from "@/Layouts/PageLayout";
import { router } from "@inertiajs/react";
import React from "react";

const ClientList = ({ data }) => {
    const columns = tColumns();
    const onRowClick = (items) => {
        router.visit(route("client.detail", { clientId: items.clientId }));
    };
    return (
        <PageLayout>
            <div className="w-2/3">
                <TableComponent
                    columns={columns}
                    data={data}
                    onRowClick={onRowClick}
                    title={"List of Clients"}
                />
            </div>
        </PageLayout>
    );
};

export default ClientList;
