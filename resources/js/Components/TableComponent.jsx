import React, { useEffect, useState } from "react";
import {
    FaFilter,
    FaPlus,
    FaRegBuilding,
    FaSearch,
    FaSort,
    FaSortDown,
    FaSortUp,
    FaTrashAlt,
} from "react-icons/fa";
import { getRequestStatus, unitStatus } from "./utils/dashboard-util";
import { router } from "@inertiajs/react";

const TableComponent = (props) => {
    const {
        isUserList = false,
        maxItemPerPage,
        submitPlaceholder,
        height,
        filterStatus = false,
        filterUserLocation = false,
        isForm = false,
        columns,
        data,
        handleSubmit,
        sortableData,
        onRowClick = null,
        title,
        subtitle,
        addNewItem,
        isRequestList,
        handleMoveToHistory,
        handleNew,
        isResponsive = true,
    } = props;
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });
    const [filterConfig, setFilterConfig] = useState();
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const sortedData = data?.sort((a, b) => {
        if (!sortConfig.key) return 0;
        const getNestedValue = (obj, key) => {
            if (key === "user") return obj.user?.user?.toLowerCase() || "";
            if (key === "unit") return obj.unit?.unit?.toLowerCase() || "";
            if (key === "user_id") return obj.unit?.unit?.toLowerCase() || "";
            if (key === "status")
                return getRequestStatus(obj.unit?.status).toLowerCase() || "";
            if (key === "location") return obj?.location?.location || "";
            if (key === "client")
                return obj?.client?.name || obj?.client || obj?.name || "";
            return (obj[key] || "").toString().toLowerCase();
        };

        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);

        if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
        }
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

    const handleSelect = (value) => {
        // router.visit(route("daily.list"), {
        //     method: "get",
        //     data: { status: value },
        //     preserveScroll: true,
        //     preserveState: true,
        // });
    };

    useEffect(() => {
        let filterData = [];
        if (filterConfig) {
            filterData = data?.filter((item) => {
                return item?.unit?.status === filterConfig;
            });
            return setFilteredData(filterData);
        }
        filterData = sortedData?.filter((item) => {
            return containsQuery(item, query);
        });

        setFilteredData(filterData);
    }, [filterConfig, sortConfig?.direction, query]);
    return (
        <>
            <div
                className={`${
                    isResponsive && "md:block hidden"
                } bg-white flex-col rounded-none md:rounded-lg border shadow-none md:shadow-lg max-h-[80vh] overflow-y-auto`}
            >
                <div className="flex flex-col md:flex-row justify-between px-6 py-6 border-b sticky top-0 left-0 bg-white z-10">
                    {title && (
                        <div className="flex md:justify-center items-center">
                            <div className="bg-[#e8edfc] text-primary p-1.5 md:p-2.5 rounded-md">
                                <FaRegBuilding className="text-2xl md:text-3xl" />
                            </div>
                            <div className="flex-row justify-center items-center ml-2 md:ml-4 ">
                                <p className="font-semibold text-base md:text-2xl">
                                    {title}
                                </p>
                                {subtitle && (
                                    <p className="text-xs md:text-sm">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-start md:justify-center items-center gap-4">
                        <div className="flex md:justify-end flex-col md:flex-row">
                            {filterStatus && (
                                <div className="relative flex gap-2 justify-end items-center mt-4 md:m-4 bg-white border-2 text-primary rounded-md px-2 md:px-4 cursor-pointer">
                                    <FaFilter />
                                    <select
                                        className="border-none focus:border-none outline-none focus:outline-none text-sm md:text-base"
                                        onChange={(e) =>
                                            setFilterConfig(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            -- Semua Status --
                                        </option>
                                        {unitStatus.map((item, i) => (
                                            <option key={i} value={item.value}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {filterUserLocation && (
                                <div className="relative flex gap-2 justify-end items-center mt-4 md:m-4 bg-white border-2 text-primary rounded-md px-2 md:px-4 cursor-pointer">
                                    <FaFilter />
                                    <select
                                        className="border-none focus:border-none outline-none focus:outline-none text-sm md:text-base"
                                        onChange={(e) =>
                                            setFilterConfig(e.target.value)
                                        }
                                    >
                                        <option value="">
                                            -- Semua Status --
                                        </option>
                                        {unitStatus.map((item, i) => (
                                            <option key={i} value={item.value}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-2 justify-end items-center mt-4 md:m-4 bg-white border-2 text-primary rounded-md px-4 py-2">
                                <FaSearch />
                                <input
                                    type="text"
                                    className="border-none p-0 text-sm md:text-base"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                        {addNewItem && (
                            <a
                                href={handleNew}
                                className="flex justify-center items-center gap-2 cursor-pointer bg-primary text-white px-5 py-2 rounded-md hover:bg-white hover:border-primary hover:border-2 hover:text-primary transition-all"
                            >
                                <FaPlus />
                                <span className="">Add New Unit</span>
                            </a>
                        )}
                    </div>
                </div>
                <div
                    className="flex-col"
                    style={{ maxHeight: height || "auto", overflow: "auto" }}
                >
                    <table className="table-auto w-full relative rounded-3xl overflow-x-scroll">
                        <thead className="bg-[#f5f7f9] sticky top-0 left-0">
                            <tr className="text-[#0F111C] font-semibold bg-primary">
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        className={
                                            `px-6 py-3 md:px-8 text-sm font-medium text-left cursor-pointer uppercase` +
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
                                            "border-" + onRowClick &&
                                            `transition duration-100 hover:bg-gray-100 cursor-pointer`
                                        }
                                        onClick={() =>
                                            onRowClick ? onRowClick(item) : null
                                        }
                                    >
                                        {columns.map((col, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`text-[#0F111C] px-4 py-2 md:px-8 md:py-6 text-md font-medium border-b border-[#EAECF0] ${
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
                {isForm && !isUserList && (
                    <div className="sticky bottom-0 left-0 bg-primary w-full flex justify-end text-white rounded-b-2xl">
                        <tr>
                            <th>
                                <div className="px-8 py-3 text-sm font-medium w-full">
                                    <button
                                        className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                                        onClick={handleSubmit}
                                    >
                                        {submitPlaceholder
                                            ? submitPlaceholder
                                            : "Submit"}
                                    </button>
                                </div>
                            </th>
                        </tr>
                    </div>
                )}

                {isUserList && (
                    <div className="sticky bottom-0 left-0 bg-primary w-full flex justify-end text-white rounded-b-2xl">
                        <tr>
                            <th className="flex gap-4">
                                <div className=" py-3 text-sm font-medium w-full relative">
                                    <button
                                        className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                                        onClick={() =>
                                            handleSubmit({ type: "edit" })
                                        }
                                    >
                                        Edit
                                    </button>
                                </div>

                                <div className=" py-3 text-sm font-medium w-full relative">
                                    <button
                                        className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                                        onClick={() =>
                                            handleSubmit({ type: "delete" })
                                        }
                                    >
                                        <FaTrashAlt />
                                        Delete
                                    </button>
                                </div>

                                <div className="pe-8 py-3 text-sm font-medium w-full relative">
                                    <button
                                        className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                                        onClick={() =>
                                            handleSubmit({ type: "reset" })
                                        }
                                    >
                                        Reset
                                    </button>
                                </div>
                            </th>
                        </tr>
                    </div>
                )}

                {isRequestList && (
                    <div className="sticky bottom-0 left-0 bg-primary w-full flex justify-end text-white rounded-b-2xl p-4">
                        <button
                            className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                            onClick={handleMoveToHistory}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* RESPONSIVE */}
            <div
                className={`${
                    isResponsive && "block md:hidden"
                } bg-white flex-col rounded-none md:rounded-lg border shadow-none md:shadow-lg max-h-[90vh] overflow-y-auto w-full`}
            >
                {/* Top Bar */}
                <div className="flex flex-col md:flex-row justify-between px-6 py-6 border-b sticky top-0 left-0 bg-white z-10 w-full">
                    {title && (
                        <div className="flex md:justify-center items-center">
                            <div className="bg-[#e8edfc] text-primary p-1.5 md:p-2.5 rounded-md">
                                <FaRegBuilding className="text-2xl md:text-3xl" />
                            </div>
                            <div className="flex-row justify-center items-center ml-2 md:ml-4">
                                <p className="font-lato font-semibold text-base md:text-2xl">
                                    {title}
                                </p>
                                {subtitle && (
                                    <p className="text-xs md:text-sm">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center items-center w-full">
                        <div className="flex flex-col w-full">
                            <div className="flex items-center mt-4 gap-4">
                                {filterStatus && (
                                    <div className="relative flex gap-2 justify-end items-center bg-white border-2 text-primary rounded-md px-2 cursor-pointer">
                                        <FaFilter />
                                        <select
                                            className="border-none focus:border-none outline-none focus:outline-none text-sm md:text-base"
                                            onChange={(e) =>
                                                setFilterConfig(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                -Semua Status-
                                            </option>
                                            {unitStatus.map((item, i) => (
                                                <option
                                                    key={i}
                                                    value={item.value}
                                                >
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {addNewItem && (
                                    <a
                                        href={handleNew}
                                        className="flex justify-center items-center gap-2 cursor-pointer bg-primary text-sm text-white px-2 py-2 rounded-md hover:bg-white hover:border-primary hover:border-2 hover:text-primary transition-all"
                                    >
                                        <FaPlus />
                                        <span className="">Add Unit</span>
                                    </a>
                                )}
                            </div>

                            <div className="flex">
                                {filterUserLocation && (
                                    <div className="relative flex gap-2 justify-start items-center mt-4 md:m-4 bg-white border-2 text-primary rounded-md px-2 md:px-4 cursor-pointer">
                                        <FaFilter />
                                        <select
                                            className="border-none focus:border-none outline-none focus:outline-none text-sm md:text-base"
                                            onChange={(e) =>
                                                setFilterConfig(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                Semua Status
                                            </option>
                                            {unitStatus.map((item, i) => (
                                                <option
                                                    key={i}
                                                    value={item.value}
                                                >
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 justify-start items-center mt-4 md:m-4 bg-white border-2 text-primary rounded-md px-4 py-2">
                                <FaSearch />
                                <input
                                    type="text"
                                    className="border-none p-0 text-sm md:text-base"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card List (instead of table) */}
                <div className="flex-col px-4 py-4 space-y-4 overflow-y-auto text-[#232D42]">
                    {filteredData.length > 0 ? (
                        filteredData.map((item, rowIndex) => {
                            // find if a checkbox column exists
                            // Filter out 'checkbox' column
                            const mainCols = columns.filter(
                                (c) =>
                                    c.name !== "checkbox" && c.name !== "status"
                            );

                            // Pick either 'status' or 'requestType' if exists
                            const statusCol = columns.find(
                                (c) =>
                                    c.name === "status" ||
                                    c.name === "requestType" ||
                                    c.name === "checkbox"
                            );

                            return (
                                <div
                                    key={rowIndex}
                                    className="relative border rounded-lg p-4 shadow-sm bg-white"
                                    onClick={() =>
                                        onRowClick ? onRowClick(item) : null
                                    }
                                >
                                    {statusCol && (
                                        <div className="absolute top-2 right-3">
                                            {typeof statusCol.Cell ===
                                            "function"
                                                ? statusCol.Cell({
                                                      ...item,
                                                      index: rowIndex,
                                                  })
                                                : statusCol.Cell}
                                        </div>
                                    )}

                                    {/* First 2 columns */}
                                    <p className="font-semibold text-base">
                                        {typeof mainCols[1]?.Cell === "function"
                                            ? mainCols[1].Cell({
                                                  ...item,
                                                  index: rowIndex,
                                              })
                                            : mainCols[1]?.Cell}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {typeof mainCols[2]?.Cell === "function"
                                            ? mainCols[2].Cell({
                                                  ...item,
                                                  index: rowIndex,
                                              })
                                            : mainCols[2]?.Cell}
                                    </p>

                                    {/* More Details dropdown */}
                                    {mainCols.length > 3 && (
                                        <details
                                            className="mt-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                        >
                                            <summary className="cursor-pointer text-primary text-sm">
                                                More Details
                                            </summary>
                                            <div className="mt-2 text-sm space-y-2">
                                                {mainCols
                                                    .slice(2)
                                                    .map((col, colIndex) => (
                                                        <div
                                                            key={colIndex}
                                                            className="flex"
                                                        >
                                                            <span className="font-medium pr-2">
                                                                {col.header}:
                                                            </span>
                                                            <span>
                                                                {typeof col.Cell ===
                                                                "function"
                                                                    ? col.Cell({
                                                                          ...item,
                                                                          index: rowIndex,
                                                                      })
                                                                    : col.Cell}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </details>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-500 py-6">
                            No data available.
                        </p>
                    )}
                </div>

                {/* Sticky Bottom Bar (kept the same) */}
                {isForm && !isUserList && (
                    <div className="sticky bottom-0 left-0 bg-primary w-full flex justify-end text-white rounded-b-2xl">
                        <tr>
                            <th>
                                <div className="px-8 py-3 text-sm font-medium w-full">
                                    <button
                                        className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                                        onClick={handleSubmit}
                                    >
                                        {submitPlaceholder
                                            ? submitPlaceholder
                                            : "Submit"}
                                    </button>
                                </div>
                            </th>
                        </tr>
                    </div>
                )}

                {isUserList && (
                    <div className="sticky bottom-0 left-0 bg-primary w-full flex justify-end text-white rounded-b-2xl">
                        <tr>
                            <th className="flex gap-4">
                                <div className="py-3 text-sm font-medium w-full relative">
                                    <button
                                        className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                                        onClick={() =>
                                            handleSubmit({ type: "edit" })
                                        }
                                    >
                                        Edit
                                    </button>
                                </div>

                                <div className="py-3 text-sm font-medium w-full relative">
                                    <div className="bg-white flex justify-center items-center gap-2 text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all">
                                        <FaTrashAlt />
                                        <button
                                            className=""
                                            onClick={() =>
                                                handleSubmit({ type: "delete" })
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="pe-8 py-3 text-sm font-medium w-full relative">
                                    <button
                                        className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                                        onClick={() =>
                                            handleSubmit({ type: "reset" })
                                        }
                                    >
                                        Reset
                                    </button>
                                </div>
                            </th>
                        </tr>
                    </div>
                )}

                {isRequestList && (
                    <div className="sticky bottom-0 left-0 bg-primary w-full flex justify-end text-white rounded-b-2xl p-4">
                        <button
                            className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                            onClick={handleMoveToHistory}
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default TableComponent;
