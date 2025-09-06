import { getRequestTypeName, toCapitalizeFirstLetter } from "../dashboard-util";

const columns = ({ type, formData, unitAreaData, handleSelectAll }) => {
    const list = [
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
                        <div>{index + 1}</div>
                    </>
                );
            },
        },
        {
            name: "position",
            header: "Position",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start",
            sortable: false,
            width: "99%",
            Cell: ({ name }) => {
                return (
                    <>
                        <div>{name}</div>
                    </>
                );
            },
        },
    ];

    const unit = [
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
                        <div>{index + 1}</div>
                    </>
                );
            },
        },
        {
            name: "unit",
            header: "Unit",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "30%",
            Cell: ({ unit }) => {
                return <div className="flex flex-col">{unit}</div>;
            },
        },
        // {
        //     name: "user",
        //     header: "User",
        //     headerClassName: "bg-primary text-white",
        //     sortable: true,
        //     width: "17%",
        //     Cell: ({ client }) => {
        //         return <div className="flex flex-col">{client?.name}</div>;
        //     },
        // },
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
                        checked={formData?.add?.length === unitAreaData?.length}
                    >
                        Select All
                    </div>
                );
            },
            headerClassName: "bg-primary text-white text-center justify-center",
            sortable: false,
            cellClassName: "text-center",
            width: "20%",
            Cell: ({ unit_id }) => {
                return (
                    <input
                        type="checkbox"
                        checked={formData?.add?.includes(unit_id?.toString())}
                        onChange={(e) => {
                            e.stopPropagation();
                        }}
                    />
                );
            },
        },
    ];

    const workshopUnit = [
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
                        <div>{index + 1}</div>
                    </>
                );
            },
        },
        {
            name: "unit",
            header: "Unit",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "30%",
            Cell: ({ unit }) => {
                return <div className="flex flex-col">{unit}</div>;
            },
        },

        {
            name: "checkbox",
            Header: (data) => {
                return (
                    <div
                        className="text-center w-full"
                        onClick={() => handleSelectAll(data)}
                        checked={formData?.add?.length === unitAreaData?.length}
                    >
                        Select All
                    </div>
                );
            },
            headerClassName: "bg-primary text-white text-center justify-center",
            sortable: false,
            cellClassName: "text-center",
            width: "20%",
            Cell: ({ unit_id }) => {
                return (
                    <input
                        type="checkbox"
                        checked={formData?.add?.includes(unit_id?.toString())}
                        onChange={(e) => {
                            e.stopPropagation();
                        }}
                    />
                );
            },
        },
    ];

    switch (type) {
        case "unit":
            return unit;
        case "workshopUnit":
            return workshopUnit;
        default:
            return list;
    }
};
export default columns;
