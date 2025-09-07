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
import { useAuth } from "../Auth/auth";

const UnitTable = (props) => {
    const { data: propsData } = props;
    const columns = tColumns("unitList");
    const data = propsData ?? fetchedData;
    const { user } = useAuth();

    const handleClick = (item) => {
        if (!item.unit_position_id) return;
        router.visit(route("daily", item.unit_position_id));
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
                addNewItem={true}
                handleSubmit={handleSubmit}
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
            addNewItem={user && user.role === "super_admin" ? true : false}
            handleNew={route("unit.add")}
        />
        // <></>
    );
};

export default UnitTable;
