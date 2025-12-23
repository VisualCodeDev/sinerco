import { getRequestTypeName, toCapitalizeFirstLetter } from "../dashboard-util";

const columns = ({ formData, handleSelectAll, isEdit }) => {
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
            width: "19%",
            Cell: ({ unit }) => {
                return <div className="flex flex-col">{unit}</div>;
            },
        },
        {
            name: "location",
            header: "Location",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "19%",
            Cell: ({ location }) => {
                return <div className="flex flex-col">{location}</div>;
            },
        },
        {
            name: "pic",
            header: "PIC",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "19%",
            Cell: ({ pic_name, pic_department }) => {
                return (
                    <div className="flex flex-col">
                        <span>{pic_name || "-"}</span>
                        <span className="text-gray text-sm font-normal">
                            {pic_department || "-"}
                        </span>
                    </div>
                );
            },
        },
        {
            name: "client",
            header: "Client",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "19%",
            Cell: ({ client_name, client_department }) => {
                return (
                    <div className="flex flex-col">
                        <span>{client_name || "-"}</span>
                        <span className="text-gray text-sm font-normal">
                            {client_department || "-"}
                        </span>
                    </div>
                );
            },
        },
        {
            name: "supervision",
            header: "Supervision",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "19%",
            Cell: ({ spv_name, spv_department }) => {
                return (
                    <div className="flex flex-col">
                        <span>{spv_name || "-"}</span>
                        <span className="text-gray text-sm font-normal">
                            {spv_department || "-"}
                        </span>
                    </div>
                );
            },
        },
        {
            name: "checkbox",
            width: "4%",
            Header: (data) => {
                return (
                    <div
                        className="text-center w-full"
                        onClick={() => handleSelectAll(data)}
                        checked={
                            formData?.selectedRows?.length ===
                            formData?.data?.length
                        }
                    >
                        Select All
                        {/* {isEdit ? "Select All" : ""} */}
                    </div>
                );
            },
            headerClassName: "bg-primary text-white text-center justify-center",
            sortable: false,
            cellClassName: "text-center",
            width: "10%",
            Cell: ({ unit_position_id }) => {
                // if (isEdit) {
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
                // }
            },
        },
    ];

    return dataUnitItem;
};
export default columns;
