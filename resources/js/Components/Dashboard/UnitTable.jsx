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

const UnitTable = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(true);

    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });

    const sortedData = data?.sort((a, b) => {
        if (!sortConfig.key) return 0;

        const getNestedValue = (obj, key) => {
            if (key === "user") return obj.user?.user?.toLowerCase() || "";
            if (key === "unit") return obj.unit?.unit?.toLowerCase() || "";
            return (obj[key] || "").toString().toLowerCase();
        };

        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return {
                    key,
                    direction: prev.direction === "asc" ? "desc" : "asc",
                };
            }
            return { key, direction: "asc" };
        });
    };

    const filteredData = sortedData?.filter((item) => {
        const query = searchQuery.toLowerCase();

        return (
            item.area?.toLowerCase().includes(query) ||
            item.location?.toLowerCase().includes(query) ||
            item.unit?.unit?.toLowerCase().includes(query) ||
            item.user?.user?.toLowerCase().includes(query)
        );
    });

    const fetchData = async () => {
        setLoading(true);
        const response = await axios.get(route("getUnitAreaLocation"));
        console.log(response.data);
        setLoading(false);
        setData(response.data);
    };
    useEffect(() => {
        fetchData();
    }, []);

    let columns = tColumns();
    if (isLoading) {
        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    }
    return (
        <div className="bg-white flex-col rounded-3xl border shadow-lg overflow-hidden">
            <div className="flex justify-between px-6 py-6 border-b">
                <div className="flex justify-center items-center">
                    <div className="bg-[#e8edfc] text-primary p-2.5 rounded-md">
                        <FaRegBuilding size={28} />
                    </div>
                    <div className="flex-row justify-center items-center ml-4">
                        <p className="font-bold text-2xl">List Of Units</p>
                        <p className="text-sm font-[#0F111C]">
                            Choose a unit to import your daily form into.
                        </p>
                    </div>
                </div>
                <div className="flex justify-center items-center gap-4">
                    <div className="flex justify-center items-center gap-2 cursor-pointer bg-primary text-white px-5 py-2 rounded-md hover:bg-white hover:border-primary hover:border-2 hover:text-primary">
                        <FaPlus />
                        <a className="">Add New Unit</a>
                    </div>
                </div>
            </div>
            <div className="flex-col">
                <div className="flex justify-end">
                    <div className="flex gap-2 justify-end items-center m-4 bg-white border-2 text-primary rounded-md px-4 py-2">
                        <FaSearch />
                        <input
                            type="text"
                            className="border-none p-0"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="">
                    <table className="table-auto w-full relative rounded-3xl">
                        <thead className="bg-[#f5f7f9] sticky top-0 left-0">
                            <tr className="text-[#0F111C] font-semibold">
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        className={
                                            `px-8 py-3 text-sm font-medium text-left cursor-pointer uppercase` +
                                            (col.headerClassName || "")
                                        }
                                        onClick={() => handleSort(col.name)}
                                    >
                                        <div className="flex items-center">
                                            {col.header}
                                            {col.sortable &&
                                                (sortConfig.key === col.name ? (
                                                    <span className="ml-1 text-xs">
                                                        {sortConfig.direction ===
                                                        "asc" ? (
                                                            <FaSortUp />
                                                        ) : (
                                                            <FaSortDown />
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="ml-1 text-xs">
                                                        <FaSort />
                                                    </span>
                                                ))}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData?.map((item, rowIndex) => (
                                <tr className="border-b" key={rowIndex}>
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`text-[#0F111C] px-8 py-6 text-sm font-semibold ${
                                                col.cellClassName || ""
                                            }`}
                                            style={{
                                                width: col?.width || "auto",
                                            }}
                                        >
                                            {typeof col.Cell === "function"
                                                ? col.Cell({
                                                      ...item,
                                                      index: rowIndex,
                                                  })
                                                : col.Cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UnitTable;
