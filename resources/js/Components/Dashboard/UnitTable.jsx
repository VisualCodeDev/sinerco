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

const UnitTable = (props) => {
    const { data } = props;
    let columns = tColumns();
console.log(data)
    return (
        <TableComponent data={data} columns={columns} title={"List of Unit"} />
    );
};

export default UnitTable;
