import { getRequestTypeName, toCapitalizeFirstLetter } from "../dashboard-util";

const columns = (type, formData, unitAreaData, handleSelectAll) => {
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
                    <div className="flex flex-col text-center px-20">
                        <p
                            className={`px-2 py-2 rounded-lg text-white ${
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
                return <div className="flex flex-col">{client?.name}</div>;
            },
        },
        {
            name: "area",
            header: "Area",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "20%",
            Cell: ({ location }) => {
                return (
                    <div className="flex flex-col">{location?.area?.area}</div>
                );
            },
        },
        {
            name: "unit",
            header: "Unit",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "20%",
            Cell: ({ unit }) => {
                return <div className="flex flex-col">{unit?.unit}</div>;
            },
        },
        {
            name: "location",
            header: "Location",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "20%",
            Cell: ({ location }) => {
                return (
                    <div className="flex flex-col">{location?.location}</div>
                );
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
            Cell: ({ unitAreaLocationId }) => {
                return (
                    <input
                        type="checkbox"
                        checked={formData?.selectedRows?.includes(
                            unitAreaLocationId.toString()
                        )}
                        onChange={(e) => {
                            e.stopPropagation();
                        }}
                    />
                );
            },
        },
    ];

    switch (type) {
        case "checkbox":
            return dataListCheckbox;
        default:
            return colItem;
    }
};
export default columns;
