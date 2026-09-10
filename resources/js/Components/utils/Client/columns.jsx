import { FaCog, FaTrash } from "react-icons/fa";

const columns = ({
    isEdit,
    edits,
    lookups = { regions: [] },
    newRowId,
    handleToggleInvoice,
    handleOpenSetting,
    handleFieldChange,
    handleSaveRow,
    handleOpenDelete,
    handleCancelNewRow,
}) => {
    // Client baru (baris draft dari "Add Client") belum punya unit sama sekali,
    // jadi Region/Area/Location/Invoice/Setting/Delete tidak relevan dulu -- cuma
    // Name yang bisa diisi sampai client-nya benar-benar disimpan.
    const isDraftRow = (item) => newRowId && item.client_id === newRowId;
    const editValue = (item, field) =>
        edits?.[item.client_id]?.[field] ?? item[field] ?? "";

    const selectInput = (item, field, options, valueKey, labelKey, disabled) => (
        <select
            className="w-full border border-gray-300 rounded-md px-2 py-1 bg-white"
            value={editValue(item, field)}
            disabled={disabled}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
                handleFieldChange(item.client_id, field, e.target.value)
            }
        >
            <option value="">-- Select --</option>
            {options?.map((opt) => (
                <option key={opt[valueKey]} value={opt[valueKey]}>
                    {opt[labelKey]}
                </option>
            ))}
        </select>
    );

    const areasForRegion = (item) => {
        const regionId = editValue(item, "region_id");
        return (
            lookups.regions?.find((r) => String(r.id) === String(regionId))
                ?.areas || []
        );
    };

    const locationsForArea = (item) => {
        const areaId = editValue(item, "area_id");
        return (
            areasForRegion(item).find((a) => String(a.id) === String(areaId))
                ?.locations || []
        );
    };

    return [
        {
            name: "no",
            header: "No",
            headerClassName: "text-center justify-center bg-primary text-white",
            cellClassName: "text-center",
            Cell: ({ index }) => {
                return (
                    <label className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1">
                        {index + 1}
                    </label>
                );
            },
        },
        {
            name: "name",
            header: "Name",
            headerClassName: "text-center bg-primary text-white",
            sortable: true,
            Cell: (item) => {
                if (isEdit) {
                    return (
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-2 py-1"
                            value={editValue(item, "name")}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                handleFieldChange(
                                    item.client_id,
                                    "name",
                                    e.target.value,
                                )
                            }
                        />
                    );
                }
                return (
                    <label className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1">
                        {item.name}
                    </label>
                );
            },
        },
        {
            name: "regions",
            header: "Region",
            width: "13%",
            headerClassName: "text-center bg-primary text-white",
            sortable: true,
            Cell: (item) => {
                if (isDraftRow(item)) {
                    return (
                        <span className="text-xs text-gray-400 italic">
                            Save name first
                        </span>
                    );
                }
                if (isEdit) {
                    return selectInput(
                        item,
                        "region_id",
                        lookups.regions,
                        "id",
                        "name",
                    );
                }
                return (
                    <label className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1">
                        {item.regions}
                    </label>
                );
            },
        },
        {
            name: "areas",
            header: "Area",
            width: "13%",
            headerClassName: "text-center bg-primary text-white",
            sortable: true,
            Cell: (item) => {
                if (isDraftRow(item)) return null;
                if (isEdit) {
                    return selectInput(
                        item,
                        "area_id",
                        areasForRegion(item),
                        "id",
                        "area",
                        !editValue(item, "region_id"),
                    );
                }
                return (
                    <label className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1">
                        {item.areas}
                    </label>
                );
            },
        },
        {
            name: "locations",
            header: "Location",
            width: "16%",
            headerClassName: "text-center bg-primary text-white",
            sortable: true,
            Cell: (item) => {
                if (isDraftRow(item)) return null;
                if (isEdit) {
                    return selectInput(
                        item,
                        "location_id",
                        locationsForArea(item),
                        "id",
                        "location",
                        !editValue(item, "area_id"),
                    );
                }
                return (
                    <label className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1">
                        {item.locations}
                    </label>
                );
            },
        },
        {
            name: "is_invoice",
            header: "",
            width: "10%",
            headerClassName: "text-center bg-primary text-white",
            sortable: false,
            Cell: ({ is_invoice, client_id }) => {
                if (newRowId && client_id === newRowId) return null;
                return (
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-muted" style={{ fontSize: 13 }}>
                            Invoice
                        </span>

                        <button
                            onClick={() =>
                                handleToggleInvoice(client_id, is_invoice)
                            }
                            className="border-0 p-0"
                            style={{
                                width: 38,
                                height: 20,
                                borderRadius: 999,
                                background: Boolean(is_invoice)
                                    ? "#22c55e"
                                    : "#e5e7eb",
                                position: "relative",
                                transition: "all 0.25s ease",
                            }}
                        >
                            <div
                                style={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: "50%",
                                    background: "#fff",
                                    position: "absolute",
                                    top: 3,
                                    left: Boolean(is_invoice) ? 20 : 3,
                                    transition: "all 0.25s ease",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                }}
                            />
                        </button>
                    </div>
                );
            },
        },
        {
            name: "setting",
            width: "4%",
            sortable: false,
            headerClassName: "bg-primary text-white text-center justify-center",
            cellClassName: "text-center",
            Cell: (props) => {
                if (isDraftRow(props)) return null;
                return (
                    <button
                        className="flex items-center justify-center border border-transparent bg-primary text-white p-2 rounded-md"
                        style={{
                            width: 40,
                            height: 40,
                        }}
                        onClick={() => handleOpenSetting(props)}
                    >
                        <FaCog />
                    </button>
                );
            },
        },
        {
            name: "save",
            header: "",
            width: "6%",
            sortable: false,
            headerClassName: "bg-primary text-white text-center justify-center",
            cellClassName: "text-center",
            Cell: (item) => {
                if (!isEdit) return null;
                return (
                    <button
                        type="button"
                        className="bg-white text-primary border border-primary px-3 py-1 rounded-md text-sm disabled:opacity-40"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSaveRow(item.client_id);
                        }}
                    >
                        Save
                    </button>
                );
            },
        },
        {
            name: "actions",
            header: "",
            width: "8%",
            sortable: false,
            headerClassName: "bg-primary text-white text-center justify-center",
            cellClassName: "text-center",
            Cell: (props) => {
                if (isDraftRow(props)) {
                    return (
                        <button
                            type="button"
                            className="border border-gray-300 bg-white text-gray-600 px-3 py-1.5 rounded-md text-sm"
                            onClick={() => handleCancelNewRow?.()}
                        >
                            Cancel
                        </button>
                    );
                }
                return (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            className="flex items-center justify-center border border-transparent bg-danger text-white p-2 rounded-md"
                            style={{ width: 40, height: 40 }}
                            onClick={() => handleOpenDelete(props)}
                        >
                            <FaTrash />
                        </button>
                    </div>
                );
            },
        },
    ];
};
export default columns;
