import React, { useState } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";

const TableComponent = (props) => {
    const { columns, data, onRowClick } = props;
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });

    const sortedData = data?.sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

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
    return (
        <table className="table-auto bg-white w-full">
            <thead className="sticky -top-11 left-0 border-b bg-white">
                <tr>
                    {columns.map((col, index) => (
                        <th
                            key={index}
                            className={
                                `px-6 py-4 text-lg font-semibold text-left cursor-pointer ` +
                                (col.headerClassName || "")
                            }
                            onClick={() => handleSort(col.name)}
                        >
                            <div
                                className={
                                    `flex items-center ` +
                                    (col.headerClassName || "")
                                }
                            >
                                {col.header}
                                {col.sortable &&
                                    (sortConfig.key === col.name ? (
                                        <span className="ml-1 text-xs">
                                            {sortConfig.direction === "asc" ? (
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
                {sortedData.map((item, rowIndex) => (
                    <tr
                        key={rowIndex}
                        className={
                            onRowClick &&
                            `transition duration-100 hover:bg-gray-100 cursor-pointer`
                        }
                        onClick={() => onRowClick(item)}
                    >
                        {columns.map((col, colIndex) => (
                            <td
                                key={colIndex}
                                className={`px-4 py-3 text-sm ${
                                    col.cellClassName || ""
                                }`}
                                style={{
                                    width: col?.width,
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
    );
};

export default TableComponent;
