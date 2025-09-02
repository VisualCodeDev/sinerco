import React, { useEffect, useState } from "react";
import tColumns from "../utils/DataUnit/columns";
import {
    FaSort,
    FaSortDown,
    FaSortUp,
    FaPlus,
    FaSearch,
    FaRegBuilding,
} from "react-icons/fa";
import { Button } from "@headlessui/react";
import TableComponent from "../TableComponent";
import { router } from "@inertiajs/react";
import LoadingSpinner from "../Loading";
import { fetch } from "../utils/database-util";

const UnitTable = (props) => {
    const { data: propsData } = props;
    const columns = tColumns("unitList");
    const data = propsData ?? fetchedData;

    const handleClick = (item) => {
        if (!item.unitAreaLocationId) return;
        router.visit(route("daily", item.unitAreaLocationId));
    };
    if (!propsData) {
        const { data, loading, error } = fetch("unit.get");
        if (loading) {
            return <LoadingSpinner />;
        }
        if (error) return <div>Error: {error.message}</div>;
        return (
            <TableComponent
                filterStatus={true}
                data={data}
                columns={columns}
                title={"List of Unit"}
                onRowClick={handleClick}
            />
        );
    }

    return (
        <TableComponent
            filterStatus={true}
            data={data}
            columns={columns}
            title={"List of Unit"}
            onRowClick={handleClick}
        />
        // <></>
    );
};

export default UnitTable;
