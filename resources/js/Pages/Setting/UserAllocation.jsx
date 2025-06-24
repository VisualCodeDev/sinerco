import TableComponent from "@/Components/TableComponent";
import columns from "@/Components/utils/Setting/columns";
import PageLayout from "@/Layouts/PageLayout";
import { router } from "@inertiajs/react";
import React from "react";

const UserAllocation = ({ operatorData, technicianData }) => {
    const techColumn = columns("technician");
    const opColumn = columns("operator");

    const onRowClick = (item) => {
        router.visit(route("allocation", item?.id));
    };
    return (
        <PageLayout>
            <div className="flex flex-col md:flex-row gap-5 w-full justify-between">
                <div className="w-full md:w-1/2">
                    <TableComponent
                        onRowClick={onRowClick}
                        columns={techColumn}
                        data={operatorData}
                        title={"Operator"}
                    />
                </div>
                <div className="w-full md:w-1/2">
                    <TableComponent
                        onRowClick={onRowClick}
                        columns={techColumn}
                        data={technicianData}
                        title={"Technician"}
                    />
                </div>
            </div>
        </PageLayout>
    );
};

export default UserAllocation;
