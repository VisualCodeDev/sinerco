import React, { useState } from "react";
import {
    FaPlus,
    FaRegBuilding,
    FaSearch,
    FaSort,
    FaSortDown,
    FaSortUp,
} from "react-icons/fa";

const TableComponent = (props) => {
    const {
        submitPlaceholder,
        height,
        isForm = false,
        columns,
        data,
        handleSubmit,
        sortableData,
        onRowClick,
        title,
        subtitle,
        addNewItem,
    } = props;
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });
    const [searchQuery, setSearchQuery] = useState("");

    const sortedData = data?.sort((a, b) => {
        if (!sortConfig.key) return 0;
        const getNestedValue = (obj, key) => {
            if (key === "user") return obj.user?.user?.toLowerCase() || "";
            if (key === "unit") return obj.unit?.unit?.toLowerCase() || "";
            if (key === "userId") return obj.unit?.unit?.toLowerCase() || "";
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

    const containsQuery = (value, query) => {
        if (typeof value === "string") {
            return value.toLowerCase().includes(query);
        }
        if (typeof value === "object" && value !== null) {
            return Object.values(value).some((val) =>
                containsQuery(val, query)
            );
        }
        return false;
    };

    const query = searchQuery.toLowerCase();

    const filteredData = sortedData?.filter((item) => {
        return containsQuery(item, query);
    });

    return (
        <div className="bg-white flex-col rounded-3xl border shadow-lg overflow-hidden">
            <div className="flex justify-between px-6 py-6 border-b">
                {title && (
                    <div className="flex justify-center items-center">
                        <div className="bg-[#e8edfc] text-primary p-2.5 rounded-md">
                            <FaRegBuilding size={28} />
                        </div>
                        <div className="flex-row justify-center items-center ml-4">
                            <p className="font-bold text-2xl">{title}</p>
                            {subtitle && <p className="text-sm">{subtitle}</p>}
                        </div>
                    </div>
                )}

                <div className="flex justify-center items-center gap-4">
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
                    {addNewItem && (
                        <div className="flex justify-center items-center gap-2 cursor-pointer bg-primary text-white px-5 py-2 rounded-md hover:bg-white hover:border-primary hover:border-2 hover:text-primary">
                            <FaPlus />
                            <a className="">Add New Unit</a>
                        </div>
                    )}
                </div>
            </div>
            <div
                className="flex-col "
                style={{ maxHeight: height || "auto", overflow: "auto" }}
            >
                <table className="table-auto w-full relative rounded-3xl">
                    <thead className="bg-[#f5f7f9] sticky top-0 left-0">
                        <tr className="text-[#0F111C] font-semibold bg-primary">
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
                                        {typeof col?.Header === "function"
                                            ? col?.Header(filteredData)
                                            : col?.header}
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
                        {filteredData.length > 0 ? (
                            filteredData?.map((item, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={
                                        "border-b " + onRowClick &&
                                        `transition duration-100 hover:bg-gray-100 cursor-pointer`
                                    }
                                    onClick={() => onRowClick(item)}
                                >
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
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center text-gray-500 py-6"
                                >
                                    No data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isForm && (
                <div className="sticky bottom-0 left-0 bg-primary w-full text-white">
                    <tr>
                        <th colSpan={columns.length}>
                            <div className="px-8 py-3 text-sm font-medium text-left">
                                <button
                                    className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100"
                                    onClick={handleSubmit}
                                >
                                    {submitPlaceholder ? submitPlaceholder : 'Submit'}
                                </button>
                            </div>
                        </th>
                    </tr>
                </div>
            )}
        </div>
    );
};

export default TableComponent;
