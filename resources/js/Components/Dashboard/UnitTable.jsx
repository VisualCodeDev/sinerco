import React, { useEffect, useState } from "react";
import tColumns from "../utils/DataUnit/columns";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";

const UnitTable = () => {
    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(true);
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
        <div className="rounded-xl overflow-hidden">
            <div className="bg-primary px-4 py-4">
                <input type="text" className="border-none h-0" />
            </div>
            <table className="table-auto bg-white w-full relative">
                <thead className="sticky top-0 left-0 border-b">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className={
                                    `px-4 py-2 text-lg font-semibold text-left cursor-pointer ` +
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
                    {sortedData.map((item, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={`px-4 py-3 text-sm ${
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
    );
};

export default UnitTable;
