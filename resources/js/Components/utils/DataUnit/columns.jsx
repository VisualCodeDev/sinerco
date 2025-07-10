import { getRequestTypeName, toCapitalizeFirstLetter } from "../dashboard-util";

const columns = (type, formData, unitAreaData, handleSelectAll) => {
    const colItem = [
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
            name: "client",
            header: "Client",
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
            width: "15%",
            Cell: ({ area }) => {
                return <div className="flex flex-col">{area}</div>;
            },
        },
        {
            name: "unit",
            header: "Unit",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "15%",
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
                return <div className="flex flex-col">{location}</div>;
            },
        },
        {
            name: "status",
            header: "Status",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "10%",
            Cell: ({ unit }) => {
                return <div className="flex flex-col">{toCapitalizeFirstLetter(getRequestTypeName(unit?.status))}</div>;
            },
        },
        {
            name: "dailyForm",
            headerClassName: "bg-primary text-white text-center justify-center",
            sortable: false,
            cellClassName: "text-center",
            width: "20%",
            Cell: ({ unitAreaLocationId }) => {
                return (
                    <a
                        href={route("daily", {
                            unitAreaLocationId,
                        })}
                        className="bg-white border-2 border-primary/50 hover:border-none text-primary px-3 py-2 rounded-full text-sm hover:bg-primary/10"
                    >
                        Daily Form
                    </a>
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
