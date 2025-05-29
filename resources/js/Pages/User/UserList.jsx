import TableComponent from "@/Components/TableComponent";
import tColumns from "@/Components/utils/User/columns";
import PageLayout from "@/Layouts/PageLayout";
import { router } from "@inertiajs/react";
import React from "react";

const UserList = ({ data }) => {
    console.log(data);
    const columns = tColumns();
    const onRowClick = (items) => {
        console.log(items);
        router.visit(route("user.detail", { userId: items.userId }));
    };
    return (
        <PageLayout>
            <div className="w-2/3">
                <TableComponent
                    columns={columns}
                    data={data}
                    onRowClick={onRowClick}
                />
            </div>
        </PageLayout>
    );
};

export default UserList;
