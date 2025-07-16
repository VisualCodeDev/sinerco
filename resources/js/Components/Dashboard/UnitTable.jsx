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

const UnitTable = (props) => {
    const { data } = props;
    let columns = tColumns();

    const handleClick = (item) => {
        if (!item.unitAreaLocationId) return;
        router.visit(route("daily", item.unitAreaLocationId));
    };

    return (
        <TableComponent
            filterStatus={true}
            data={data}
            columns={columns}
            title={"List of Unit"}
            onRowClick={handleClick}
        />
    );
};

export default UnitTable;
