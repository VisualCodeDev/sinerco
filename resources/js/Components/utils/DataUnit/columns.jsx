import { getRequestTypeName, toCapitalizeFirstLetter } from "../dashboard-util";

const columns = (
    type,
    formData,
    unitAreaData,
    handleSelectAll,
    isEdit,
    pageOffset = 0,
    lookups = {},
    onFieldChange = () => {},
    onSaveRow = () => {},
    isBulk = false
) => {
    const editValue = (item, field) =>
        formData?.edits?.[item.unit_id]?.[field] ?? item[field] ?? "";

    const textInput = (item, field, placeholder) => (
        <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-2 py-1"
            placeholder={placeholder}
            value={editValue(item, field)}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onFieldChange(item.unit_id, field, e.target.value)}
        />
    );

    const selectInput = (item, field, options, valueKey, labelKey, disabled) => (
        <select
            className="w-full border border-gray-300 rounded-md px-2 py-1 bg-white"
            value={editValue(item, field)}
            disabled={disabled}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onFieldChange(item.unit_id, field, e.target.value)}
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
    const colItem = [
        {
            name: "id",
            header: "NO.",
            headerClassName: "text-center bg-primary text-white border-b",
            cellClassName: "text-center",
            sortable: false,
            width: "3%",
            Cell: ({ index }) => {
                return (
                    <>
                        <div>{index + 1}</div>
                    </>
                );
            },
        },
        {
            name: "client",
            header: "Client",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "22%",
            Cell: ({ client }) => {
                return <div className="flex flex-col">{client?.name}</div>;
            },
        },
        {
            name: "unit",
            header: "Unit",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "25%",
            Cell: ({ unit }) => {
                return <div className="flex flex-col">{unit?.unit}</div>;
            },
        },
        {
            name: "status",
            header: "Status",
            headerClassName:
                "bg-primary text-white text-center flex items-center justify-center",
            sortable: true,
            width: "25%",
            Cell: ({ unit }) => {
                return (
                    <div className="flex flex-col text-center">
                        <p
                            className={`px-2 py-2 rounded-lg text-white md:mx-10 ${
                                unit?.status === "stdby"
                                    ? "bg-yellow-500"
                                    : unit?.status === "sd"
                                    ? "bg-red-500"
                                    : "bg-green-500"
                            }`}
                        >
                            {toCapitalizeFirstLetter(
                                getRequestTypeName(unit?.status)
                            )}
                        </p>
                    </div>
                );
            },
        },
        {
            name: "location",
            header: "Location",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "25%",
            Cell: ({ location }) => {
                return (
                    <div className="flex flex-col">{location?.location}</div>
                );
            },
        },
    ];

    const dataListCheckbox = [
        {
            name: "id",
            header: "NO.",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-center",
            sortable: false,
            width: "3%",
            Cell: ({ index }) => {
                return (
                    <>
                        <div>{index + 1}</div>
                    </>
                );
            },
        },
        {
            name: "user",
            header: "User",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "17%",
            Cell: ({ client }) => {
                return <div className="flex flex-col">{client}</div>;
            },
        },
        {
            name: "area",
            header: "Area",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "20%",
            Cell: ({ area }) => {
                return <div className="flex flex-col">{area}</div>;
            },
        },
        {
            name: "unit",
            header: "Unit",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "20%",
            Cell: ({ unit }) => {
                return <div className="flex flex-col">{unit}</div>;
            },
        },
        {
            name: "location",
            header: "Location",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "20%",
            Cell: ({ location }) => {
                return <div className="flex flex-col">{location}</div>;
            },
        },
        {
            name: "checkbox",
            Header: (data) => {
                return (
                    <div
                        className="text-center w-full"
                        onClick={() => handleSelectAll(data)}
                        checked={
                            formData?.selectedRows?.length ===
                            unitAreaData?.length
                        }
                    >
                        Select All
                    </div>
                );
            },
            headerClassName: "bg-primary text-white text-center justify-center",
            sortable: false,
            cellClassName: "text-center",
            width: "20%",
            Cell: ({ unit_position_id }) => {
                return (
                    <input
                        type="checkbox"
                        checked={formData?.selectedRows?.includes(
                            String(unit_position_id)
                        )}
                        onChange={(e) => {
                            e.stopPropagation();
                        }}
                    />
                );
            },
        },
    ];

    const dataUnitItem = [
        {
            name: "id",
            header: "NO.",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-center",
            sortable: false,
            width: "1%",
            Cell: ({ index }) => {
                return (
                    <>
                        <div>{index + 1 + pageOffset}</div>
                    </>
                );
            },
        },
        {
            name: "unit",
            header: "Unit Name",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "14%",
            Cell: (item) => {
                if (isEdit) return textInput(item, "unit", "Unit Name");
                return <div className="flex flex-col">{item.unit}</div>;
            },
        },
        {
            name: "unit_sn",
            header: "Unit S/N",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "12%",
            Cell: (item) => {
                if (isEdit) return textInput(item, "unit_sn", "Unit S/N");
                return <div className="flex flex-col">{item.unit_sn}</div>;
            },
        },
        {
            name: "old_sn",
            header: "Old S/N",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "12%",
            Cell: (item) => {
                if (isEdit) return textInput(item, "old_sn", "Old S/N");
                return <div className="flex flex-col">{item.old_sn}</div>;
            },
        },
        {
            name: "region",
            header: "Region",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "10%",
            Cell: (item) => {
                if (isEdit)
                    return selectInput(
                        item,
                        "region_id",
                        lookups.regions,
                        "id",
                        "name"
                    );
                return <div className="flex flex-col">{item.region}</div>;
            },
        },
        {
            name: "client",
            header: "Client",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "13%",
            Cell: (item) => {
                if (isEdit)
                    return selectInput(
                        item,
                        "client_id",
                        lookups.clients,
                        "client_id",
                        "name"
                    );
                return <div className="flex flex-col">{item.client}</div>;
            },
        },
        {
            name: "area",
            header: "Area",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "10%",
            Cell: (item) => {
                if (isEdit)
                    return selectInput(
                        item,
                        "area_id",
                        areasForRegion(item),
                        "id",
                        "area",
                        !editValue(item, "region_id")
                    );
                return <div className="flex flex-col">{item.area}</div>;
            },
        },
        {
            name: "location",
            header: "Location",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "13%",
            Cell: (item) => {
                if (isEdit)
                    return selectInput(
                        item,
                        "location_id",
                        locationsForArea(item),
                        "id",
                        "location",
                        !editValue(item, "area_id")
                    );
                return <div className="flex flex-col">{item.location}</div>;
            },
        },
        {
            name: "status",
            header: "Status",
            headerClassName:
                "bg-primary text-white text-center flex items-center justify-center",
            sortable: true,
            width: "8%",
            Cell: ({ status }) => {
                return (
                    <div className="flex flex-col text-center">
                        <p
                            className={`px-2 py-2 rounded-lg text-white md:mx-10 ${
                                status === "stdby"
                                    ? "bg-yellow-500"
                                    : status === "sd"
                                    ? "bg-red-500"
                                    : "bg-green-500"
                            }`}
                        >
                            {toCapitalizeFirstLetter(
                                getRequestTypeName(status)
                            )}
                        </p>
                    </div>
                );
            },
        },
        {
            name: "save",
            header: "",
            headerClassName: "bg-primary text-white text-center",
            sortable: false,
            cellClassName: "text-center",
            width: "5%",
            Cell: (item) => {
                if (!isEdit) return null;
                return (
                    <button
                        type="button"
                        className="bg-white text-primary border border-primary px-3 py-1 rounded-md text-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSaveRow(item.unit_id);
                        }}
                    >
                        Save
                    </button>
                );
            },
        },
        {
            name: "checkbox",
            Header: (data) => {
                return (
                    <div
                        className="text-center w-full"
                        onClick={() => isBulk && handleSelectAll(data)}
                        checked={
                            formData?.selectedRows?.length ===
                            formData?.data?.length
                        }
                    >
                        {isBulk ? "Select All" : ""}
                    </div>
                );
            },
            headerClassName: "bg-primary text-white text-center justify-center",
            sortable: false,
            cellClassName: "text-center",
            width: "8%",
            Cell: ({ unit_id }) => {
                if (isBulk) {
                    return (
                        <input
                            type="checkbox"
                            checked={formData?.selectedRows?.includes(
                                String(unit_id)
                            )}
                            onChange={(e) => {
                                e.stopPropagation();
                            }}
                        />
                    );
                }
            },
        },
    ];

    switch (type) {
        case "checkbox":
            return dataListCheckbox;
        case "unitList":
            return dataUnitItem;
        default:
            return colItem;
    }
};
export default columns;
