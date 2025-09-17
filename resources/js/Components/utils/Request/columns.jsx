import { FaClock, FaPowerOff } from "react-icons/fa";
import { getFormattedDate, getRequestTypeName } from "../dashboard-util";
import StatusPill from "@/Components/StatusPill";

const columns = ({
    user,
    handleSeen,
    handleSelectAll,
    selectedRows,
    handleCheckItem,
    getDuration,
}) => {
    const colItem = [
        {
            name: "no",
            header: "No.",
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
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "15%",
            Cell: ({ unit }) => {
                return (
                    <>
                        <div className="text-nowrap">{unit}</div>
                    </>
                );
            },
        },
        {
            name: "location",
            header: "Location",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "15%",
            Cell: ({ location }) => {
                return (
                    <>
                        <div>{location}</div>
                    </>
                );
            },
        },
        {
            name: "requestType",
            header: "Status",
            headerClassName:
                "flex items-center justify-center text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "9%",
            Cell: ({ request_type }) => {
                return (
                    <>
                        <StatusPill request_type={request_type} />
                    </>
                );
            },
        },
        {
            name: "pic",
            header: "PIC",
            headerClassName:
                "text-center bg-primary text-white flex justify-center items-center",
            cellClassName: "",
            sortable: false,
            width: "10%",
            Cell: ({ request_id, seen_status, pic }) => {
                return (
                    <div className="flex flex-col justify-center items-center">
                        {user?.role === "technician" ? (
                            !seen_status ? (
                                <button
                                    className="bg-primary hover:bg-[#1f1882] px-3 py-2 rounded-lg text-white transition duration-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSeen(request_id);
                                    }}
                                >
                                    Confirm
                                </button>
                            ) : (
                                seen_status && (
                                    <button
                                        className="bg-green-500 px-3 py-2 rounded-lg text-white transition duration-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        Seen
                                    </button>
                                )
                            )
                        ) : (
                            <div>
                                {seen_status ? (
                                    <p className="flex justify-center items-center text-center px-2 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                                        <p>{pic}</p>
                                    </p>
                                ) : (
                                    <p className="text-slate-400 text-center">
                                        -
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            name: "start_time",
            header: "Start Time",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "10%",
            Cell: ({ start_date, start_time }) => {
                return (
                    <>
                        <div className="text-nowrap">
                            {getFormattedDate(start_date)}
                        </div>
                        <div>{start_time}</div>
                    </>
                );
            },
        },
        {
            name: "end_date",
            header: "End Date",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "10%",
            Cell: ({ end_date, end_time }) => {
                return (
                    <>
                        <div className="text-nowrap">
                            {getFormattedDate(end_date)}
                        </div>
                        <div>{end_time}</div>
                    </>
                );
            },
        },

        {
            name: "duration",
            header: "Duration",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "17%",
            Cell: ({ start_time, start_date, end_date, end_time }) => {
                return (
                    <>
                        {getDuration(
                            start_date,
                            start_time,
                            end_date,
                            end_time
                        )}
                    </>
                );
            },
        },

        {
            name: "remarks",
            header: "Remarks",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "11%",
            Cell: ({ remarks }) => {
                return (
                    <>
                        <div>{remarks}</div>
                    </>
                );
            },
        },

        {
            name: "checkbox",
            header: () => (
                <div className="text-center">
                    <input
                        type="checkbox"
                        checked={
                            selectedRows.length === allData.length &&
                            allData.length > 0
                        }
                        onChange={() => handleSelectAll()}
                    />
                </div>
            ),
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            sortable: false,
            width: "5%",
            Cell: (rowData) => {
                const request_id = rowData.request_id;
                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            checked={selectedRows.includes(
                                request_id.toString()
                            )}
                            onChange={(e) => {
                                e.stopPropagation();
                                handleCheckItem(request_id.toString());
                            }}
                        />
                    </div>
                );
            },
        },
    ];
    return colItem;
};
export default columns;
