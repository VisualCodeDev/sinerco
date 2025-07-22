import LoadingSpinner from "@/Components/Loading";
import TableComponent from "@/Components/TableComponent";
import { fetch } from "@/Components/utils/database-util";
import tColumns from "@/Components/utils/User/columns";
import PageLayout from "@/Layouts/PageLayout";
import { router } from "@inertiajs/react";
import React, { useEffect, useState } from "react";

const ClientList = () => {
    const columns = tColumns();
    const { data, loading, error } = fetch('client.get');

    const onRowClick = (items) => {
        router.visit(route("client.detail", { clientId: items.clientId }));
    };

    if (loading) {
        return <LoadingSpinner />;
    }
    return (
        <PageLayout>
            <div className="w-full md:w-2/3 text-sm md:text-base">
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
