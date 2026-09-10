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
import {
    getRequestStatus,
    splitCamelCase,
    unitStatus,
} from "./utils/dashboard-util";
import { router } from "@inertiajs/react";

const TableComponent = (props) => {
    const {
        Footer,
        route = "",
        toggleEdit,
        edit = true,
        editPlaceHolder,
        secondaryAction,
        isBA = false,
        isUserList = false,
        isUnitList = false,
        newItemPlaceholder = "Add Unit",
        isModal = false,
        roles = [],
        submitPlaceholder,
        height,
        filterStatus = false,
        filterUserRole = false,
        isForm = false,
        columns,
        data,
        handleClose,
        handleSubmit,
        onRowClick = null,
        title,
        subtitle,
        addNewItem,
        isRequestList,
        handleMoveToHistory,
        handleNew,
        isResponsive = false,
        onSearchChange,
        customFilter,
        defaultSort,
    } = props;
    const [sortConfig, setSortConfig] = useState(
        defaultSort || {
            key:
                (columns[0]?.name == "id" || columns[0]?.name == "no"
                    ? columns[1]?.name
                    : columns[0]?.name || null) || null,
            direction: "asc",
        },
    );

    const [filterConfig, setFilterConfig] = useState();
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Search only ever runs over the `data` this component was given. When a
    // parent paginates server-side (e.g. the Unit List), that's just the
    // current page — so a match on another page silently "doesn't show up".
    // Parents that need whole-dataset search can pass `onSearchChange` and
    // swap in the full, unpaginated data themselves while a query is active.
    const handleSearchChange = (value) => {
        setSearchQuery(value);
        onSearchChange?.(value);
    };

    // const sortedData = data?.sort((a, b) => {
    //     if (!sortConfig.key) return 0;

    //     const normalizeString = (value = "") =>
    //         value
    //             .toString()
    //             .normalize("NFKD")
    //             .replace(/[\u200B-\u200D\uFEFF]/g, "")
    //             .trim()
    //             .toLowerCase();

    //     const getNestedValue = (obj, key) => {
    //         if (key === "user") return normalizeString(obj.user?.user);
    //         if (key === "role") return normalizeString(obj.user?.role);
    //         if (key === "unit") return normalizeString(obj.unit?.unit);
    //         if (key === "user_id") return normalizeString(obj.unit?.unit);
    //         if (key === "status")
    //             return normalizeString(getRequestStatus(obj.unit?.status));
    //         if (key === "location")
    //             return normalizeString(obj?.location?.location);
    //         if (key === "client")
    //             return normalizeString(
    //                 obj?.client?.name || obj?.client || obj?.name,
    //             );

    //         return normalizeString(obj[key]);
    //     };

    //     const aValue = getNestedValue(a, sortConfig.key);
    //     const bValue = getNestedValue(b, sortConfig.key);

    //     return sortConfig.direction === "asc"
    //         ? aValue.localeCompare(bValue, "id", { sensitivity: "base" })
    //         : bValue.localeCompare(aValue, "id", { sensitivity: "base" });
    // });

    const handleSort = (key) => {
        let config;
        if (sortConfig?.key === key) {
            config = {
                key,
                direction: sortConfig.direction === "asc" ? "desc" : "asc",
            };
        } else {
            config = { key, direction: "asc" };
        }

        setSortConfig(config);
    };

    const containsQuery = (value, query) => {
        if (typeof value === "string") {
            return value.toLowerCase().includes(query);
        }
        if (typeof value === "object" && value !== null) {
            return Object.values(value).some((val) =>
                containsQuery(val, query),
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
        let tempData = [...(data || [])];
        //
        tempData.sort((a, b) => {
            if (!sortConfig.key) return 0;

            const normalize = (v) => (v ?? "").toString().toLowerCase().trim();
            const aVal = normalize(a[sortConfig.key]);
            const bVal = normalize(b[sortConfig.key]);

            return sortConfig.direction === "asc"
                ? aVal.localeCompare(bVal, "id")
                : bVal.localeCompare(aVal, "id");
        });

        // FILTER
        if (filterConfig) {
            if (filterStatus) {
                tempData = tempData.filter(
                    (item) => item?.status === filterConfig,
                );
            }

            if (filterUserRole) {
                tempData = tempData.filter(
                    (item) => item?.role === filterConfig,
                );
            }
        }

        // SEARCH
        if (query) {
            tempData = tempData.filter((item) => containsQuery(item, query));
        }

        setFilteredData(tempData);
    }, [data, filterConfig, filterStatus, filterUserRole, sortConfig, query]);
    return (
        <>
            <div
                style={{
                    zIndex: 0,
                    position: "relative",
                }}
                className={`${
                    isResponsive && "md:block hidden"
                } bg-white flex-col rounded-none md:rounded-lg border shadow-none md:shadow-lg max-h-[80vh] overflow-y-auto`}
            >
                <div className="flex flex-col md:flex-row justify-between px-4 py-2 border-b sticky top-0 left-0 bg-white z-10">
                    {title && (
                        <div className="flex md:justify-center items-center">
                            <div className="bg-[#e8edfc] text-primary p-1.5 md:p-2.5 rounded-md">
                                <FaRegBuilding className="text-2xl md:text-3xl" />
                            </div>
                            <div className="flex-row justify-center items-center ml-2 md:ml-4 ">
                                <p className="font-semibold text-base md:text-2xl uppercase">
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
                                            -- All Status --
                                        </option>
                                        {unitStatus.map((item, i) => (
                                            <option key={i} value={item.value}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {filterUserRole && (
                                <div className="relative flex gap-2 justify-end items-center mt-4 md:m-4 bg-white border-2 text-primary rounded-md px-2 md:px-4 cursor-pointer">
                                    <FaFilter />
                                    <select
                                        className="border-none focus:border-none outline-none focus:outline-none text-sm md:text-base"
                                        onChange={(e) =>
                                            setFilterConfig(e.target.value)
                                        }
                                    >
                                        <option value="">-- All Role --</option>
                                        {roles &&
                                            roles?.map((item, i) => (
                                                <option
                                                    key={i}
                                                    value={item.name}
                                                >
                                                    {splitCamelCase(item.name)}
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
                                        handleSearchChange(e.target.value)
                                    }
                                />
                            </div>

                            {customFilter && (
                                <div className="relative flex gap-2 justify-end items-center mt-4 md:m-4 bg-white border-2 text-primary rounded-md px-2 md:px-4 cursor-pointer">
                                    <FaFilter />
                                    {customFilter}
                                </div>
                            )}
                        </div>
                        <div className="flex md:flex-row flex-col gap-4">
                            {addNewItem &&
                                (typeof handleNew === "function" ? (
                                    <button
                                        type="button"
                                        onClick={handleNew}
                                        className="flex justify-center items-center gap-2 cursor-pointer bg-primary text-white px-5 py-2 rounded-md hover:bg-white hover:border-primary hover:border-2 hover:text-primary transition-all"
                                    >
                                        <FaPlus />
                                        <span className="">
                                            {newItemPlaceholder || "Add"}
                                        </span>
                                    </button>
                                ) : (
                                    <a
                                        href={handleNew}
                                        className="flex justify-center items-center gap-2 cursor-pointer bg-primary text-white px-5 py-2 rounded-md hover:bg-white hover:border-primary hover:border-2 hover:text-primary transition-all"
                                    >
                                        <FaPlus />
                                        <span className="">
                                            {newItemPlaceholder || "Add"}
                                        </span>
                                    </a>
                                ))}
                            {toggleEdit && (
                                <div
                                    className="flex justify-center items-center gap-2 cursor-pointer bg-primary text-white px-5 py-2 rounded-md hover:bg-white hover:border-primary hover:border-2 hover:text-primary transition-all"
                                    onClick={toggleEdit}
                                >
                                    <span className="">
                                        {edit
                                            ? "Done"
                                            : editPlaceHolder
                                              ? editPlaceHolder
                                              : "Edit"}
                                    </span>
                                </div>
                            )}
                            {secondaryAction && (
                                <div
                                    className="flex justify-center items-center gap-2 cursor-pointer bg-primary text-white px-5 py-2 rounded-md hover:bg-white hover:border-primary hover:border-2 hover:text-primary transition-all"
                                    onClick={secondaryAction.onClick}
                                >
                                    <span className="">
                                        {secondaryAction.active
                                            ? secondaryAction.activeLabel ||
                                              "Done"
                                            : secondaryAction.label}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div
                    className="flex-col"
                    style={{ maxHeight: height || "auto", overflow: "auto" }}
                >
                    <table className="table-auto w-full relative rounded-3xl overflow-x-scroll border-collapse border border-[#EAECF0]">
                        <thead className="bg-[#f5f7f9] sticky top-0 left-0">
                            <tr className="text-[#0F111C] font-bold text-sm bg-primary">
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        className={
                                            `px-3 py-3 text-left cursor-pointer uppercase border border-[#EAECF0] h-full` +
                                            (col.headerClassName || "")
                                        }
                                        onClick={() =>
                                            col?.sortable &&
                                            handleSort(col.name)
                                        }
                                    >
                                        <div
                                            className={`flex items-center h-full ${col.headerClassName}`}
                                        >
                                            <span>
                                                {typeof col?.Header ===
                                                "function"
                                                    ? col?.Header(filteredData)
                                                    : col?.header}
                                            </span>
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
                                filteredData?.map((item, rowIndex) =>
                                    item?.url ? (
                                        <tr
                                            className={
                                                "border-" + onRowClick &&
                                                `transition duration-100 hover:bg-gray-100 cursor-pointer`
                                            }
                                            onClick={() => onRowClick(item)}
                                            // onMouseDown={(e) =>
                                            //     onRowClick
                                            //         ? onRowClick(item, e)
                                            //         : null
                                            // }
                                        >
                                            {columns.map((col, colIndex) => (
                                                <td
                                                    key={colIndex}
                                                    className="border border-[#EAECF0]"
                                                    style={{
                                                        width:
                                                            col?.width ||
                                                            "auto",
                                                    }}
                                                >
                                                    <a
                                                        href={item?.url}
                                                        className={`text-[#0F111C] px-2 py-2 text-sm font-medium block ${
                                                            col.cellClassName ||
                                                            ""
                                                        }`}
                                                    >
                                                        {typeof col.Cell ===
                                                        "function"
                                                            ? col.Cell({
                                                                  ...item,
                                                                  index: rowIndex,
                                                              })
                                                            : col.Cell}
                                                    </a>
                                                </td>
                                            ))}
                                        </tr>
                                    ) : (
                                        <tr
                                            key={rowIndex}
                                            className={
                                                "border-" + onRowClick &&
                                                `transition duration-100 hover:bg-gray-100 cursor-pointer`
                                            }
                                            onClick={(e) =>
                                                onRowClick
                                                    ? onRowClick(item, e)
                                                    : null
                                            }
                                        >
                                            {columns.map((col, colIndex) => (
                                                <td
                                                    key={colIndex}
                                                    className={`text-[#0F111C] px-2 py-2 text-sm font-medium border border-[#EAECF0] ${
                                                        col.cellClassName || ""
                                                    }`}
                                                    style={{
                                                        width:
                                                            col?.width ||
                                                            "auto",
                                                    }}
                                                >
                                                    {typeof col.Cell ===
                                                    "function"
                                                        ? col.Cell({
                                                              ...item,
                                                              index: rowIndex,
                                                          })
                                                        : col.Cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ),
                                )
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
                {Footer && Footer}
                {isForm && !isUserList && (
                    <div className="sticky bottom-0 left-0 bg-primary w-full flex justify-start text-white rounded-b-2xl">
                        <tr>
                            <th>
                                <div className="px-8 py-3 text-sm font-medium w-full flex gap-4">
                                    {isModal && (
                                        <button
                                            className="border border-gray-300 bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                                            onClick={handleClose}
                                        >
                                            Close
                                        </button>
                                    )}

                                    <button
                                        className="border border-gray-300 bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
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

                {isUserList && edit && (
                    <div className="sticky bottom-0 left-0 bg-primary w-full flex justify-start text-white rounded-b-2xl">
                        <tr>
                            <th className="flex gap-4">
                                <div className="ml-5 py-3 text-sm font-medium w-full relative">
                                    <button
                                        className="border border-gray-300 bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                                        onClick={() =>
                                            handleSubmit({ type: "edit" })
                                        }
                                    >
                                        Edit
                                    </button>
                                </div>

                                <div className="py-3 text-sm font-medium w-full relative">
                                    <button
                                        className={`${edit ? "" : "hidden"} flex gap-1 items-center border border-gray-300 bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all`}
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
                                        className="border border-gray-300 bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
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

                {isUnitList && secondaryAction?.active && (
                    <div className="sticky bottom-0 left-0 bg-primary w-full flex justify-start text-white rounded-b-2xl">
                        <tr>
                            <th className="flex gap-2">
                                <div className="ml-5 py-3 text-sm font-medium w-full relative flex gap-5">
                                    <button
                                        className="border border-gray-300 bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                                        onClick={() =>
                                            handleSubmit({ type: "edit" })
                                        }
                                    >
                                        Edit
                                    </button>
                                </div>
                            </th>
                        </tr>
                    </div>
                )}

                {isRequestList && (
                    <div
                        className={`${edit ? "" : "hidden"} sticky bottom-0 left-0 bg-primary w-full flex justify-end text-white rounded-b-2xl p-4`}
                    >
                        <button
                            className="border border-gray-300 bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                            onClick={handleMoveToHistory}
                        >
                            Delete
                        </button>
                    </div>
                )}

                {isBA && (
                    <div className="sticky bottom-0 left-0 bg-primary w-full flex justify-start text-white rounded-b-2xl">
                        <tr>
                            <th className="flex gap-4">
                                <div className="ml-5 py-3 text-sm font-medium w-full relative flex gap-5">
                                    <button
                                        className="border border-gray-300 bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                                        onClick={() =>
                                            handleSubmit({ type: "export" })
                                        }
                                    >
                                        Export BA
                                    </button>
                                    <button
                                        className="border border-gray-300 bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
                                        onClick={() =>
                                            handleSubmit({ type: "edit" })
                                        }
                                    >
                                        Edit
                                    </button>
                                </div>
                            </th>
                        </tr>
                    </div>
                )}
            </div>

            {/* RESPONSIVE */}
            <div
                className={`${
                    isResponsive ? "block md:hidden" : "hidden"
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

                                {addNewItem &&
                                    (typeof handleNew === "function" ? (
                                        <button
                                            type="button"
                                            onClick={handleNew}
                                            className="flex justify-center items-center gap-2 cursor-pointer bg-primary text-sm text-white px-2 py-2 rounded-md hover:bg-white hover:border-primary hover:border-2 hover:text-primary transition-all"
                                        >
                                            <FaPlus />
                                            <span className="">
                                                {newItemPlaceholder || "Add"}
                                            </span>
                                        </button>
                                    ) : (
                                        <a
                                            href={handleNew}
                                            className="flex justify-center items-center gap-2 cursor-pointer bg-primary text-sm text-white px-2 py-2 rounded-md hover:bg-white hover:border-primary hover:border-2 hover:text-primary transition-all"
                                        >
                                            <FaPlus />
                                            <span className="">
                                                {newItemPlaceholder || "Add"}
                                            </span>
                                        </a>
                                    ))}
                            </div>

                            <div className="flex">
                                {filterUserRole && (
                                    <div className="relative flex gap-2 justify-end items-center mt-4 md:m-4 bg-white border-2 text-primary rounded-md px-2 md:px-4 cursor-pointer">
                                        <FaFilter />
                                        <select
                                            className="border-none focus:border-none outline-none focus:outline-none text-sm md:text-base"
                                            onChange={(e) =>
                                                setFilterConfig(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                -- All Role --
                                            </option>
                                            {roles &&
                                                roles?.map((item, i) => (
                                                    <option
                                                        key={i}
                                                        value={item.name}
                                                    >
                                                        {splitCamelCase(
                                                            item.name,
                                                        )}
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
                                        handleSearchChange(e.target.value)
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
                                    c.name !== "checkbox" &&
                                    c.name !== "status",
                            );

                            // Pick either 'status' or 'requestType' if exists
                            const statusCol = columns.find(
                                (c) =>
                                    c.name === "status" ||
                                    c.name === "requestType" ||
                                    c.name === "checkbox",
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
                                    <p
                                        className={`font-semibold text-base ${
                                            isUserList &&
                                            "flex gap-2 items-center"
                                        }`}
                                    >
                                        {typeof mainCols[1]?.Cell === "function"
                                            ? mainCols[1].Cell({
                                                  ...item,
                                                  index: rowIndex,
                                              })
                                            : mainCols[1]?.Cell}
                                        {isUserList && (
                                            <span className="text-sm font-normal text-gray-600">
                                                {typeof mainCols[4]?.Cell ===
                                                "function"
                                                    ? mainCols[4].Cell({
                                                          ...item,
                                                          index: rowIndex,
                                                      })
                                                    : mainCols[4]?.Cell}
                                            </span>
                                        )}
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
                    <div className="sticky bottom-0 left-0 bg-primary w-full flex justify-start text-white rounded-b-2xl">
                        <tr>
                            <th>
                                <div className="px-8 py-3 text-sm font-medium w-full">
                                    <button
                                        className="border border-gray-300 bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
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
                    <div className="sticky bottom-0 left-0 bg-primary w-full flex justify-start text-white rounded-b-2xl">
                        <tr>
                            <th className="flex gap-4">
                                <div className="ml-5 py-3 text-sm font-medium w-full relative">
                                    <button
                                        className="border border-gray-300 bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
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
                                            className="border border-transparent bg-white text-primary"
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
                                        className="border border-gray-300 bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
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
                            className="border border-gray-300 bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-all"
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
