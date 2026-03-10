import { DateInput, TimeInput } from "../dashboard-util";

const columns = ({ selectedRows, handleSelectAll, handleCheckItem, data }) => {
    return [
        {
            name: "no",
            header: "No",
            headerClassName: "text-center bg-primary text-white",
            Cell: ({ index }) => {
                return (
                    <label
                        // htmlFor={name}
                        className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                    >
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
            Cell: ({ name }) => {
                return (
                    <label
                        // htmlFor={name}
                        className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                    >
                        {name}
                    </label>
                );
            },
        },
        {
            name: "areas",
            header: "Areas",
            headerClassName: "text-center bg-primary text-white",
            sortable: true,
            Cell: ({ areas }) => {
                return (
                    <label
                        // htmlFor={name}
                        className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                    >
                        {areas}
                    </label>
                );
            },
        },
        {
            name: "locations",
            header: "Locations",
            headerClassName: "text-center bg-primary text-white",
            sortable: true,
            Cell: ({ locations }) => {
                return (
                    <label
                        // htmlFor={name}
                        className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                    >
                        {locations}
                    </label>
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
                        checked={selectedRows?.length === data?.length}
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
            Cell: ({ client_id }) => {
                // if (isEdit) {
                return (
                    <input
                        type="checkbox"
                        checked={selectedRows?.includes(String(client_id))}
                        onChange={(e) => {
                            e.stopPropagation();
                        }}
                    />
                );
                // }
            },
        },
    ];
};
export default columns;
