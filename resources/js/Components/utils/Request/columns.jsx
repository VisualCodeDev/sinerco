import { FaClock, FaPowerOff } from "react-icons/fa";
import { getFormattedDate, getRequestTypeName } from "../dashboard-util";

const columns = ({ handleSelect, user, handleSeen }) => {
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
                        <div>{unit?.unit}</div>
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
            width: "10%",
            Cell: ({ requestType }) => {
                return (
                    <>
                        <div
                            className={`flex gap-2 items-center text-white justify-center px-3 py-2 rounded-lg
                                    ${
                                        requestType === "stdby"
                                            ? "bg-orange-500"
                                            : "bg-red-500"
                                    }
                                `}
                        >
                            {" "}
                            <p>{getRequestTypeName(requestType)}</p>
                        </div>
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
            Cell: ({ requestId, seenStatus, pic }) => {
                return (
                    <div className="flex flex-col justify-center items-center">
                        {user?.role === "technician" ? (
                            !seenStatus ? (
                                <button
                                    className="bg-primary hover:bg-[#1f1882] px-3 py-2 rounded-lg text-white transition duration-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSeen(requestId);
                                    }}
                                >
                                    Confirm
                                </button>
                            ) : (
                                seenStatus && (
                                    <button
                                        className="bg-red-500 hover:bg-[#d82828] px-3 py-2 rounded-lg text-white transition duration-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSeen(requestId);
                                        }}
                                    >
                                        Undo
                                    </button>
                                )
                            )
                        ) : (
                            <div>
                                {seenStatus ? (
                                    <p className="flex justify-center items-center text-center px-2 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                                        <p>{pic?.name}</p>
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
            name: "startTime",
            header: "Start Time",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "17%",
            Cell: ({ startDate, startTime }) => {
                return (
                    <>
                        <div>{getFormattedDate(startDate)}</div>
                        <div>{startTime}</div>
                    </>
                );
            },
        },
        {
            name: "endDate",
            header: "End Date",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "17%",
            Cell: ({ endDate }) => {
                return (
                    <>
                        <div>{getFormattedDate(endDate)}</div>
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
            width: "30%",
            Cell: ({ remarks }) => {
                return (
                    <>
                        <div>{remarks}</div>
                    </>
                );
            },
        },
    ];
    return colItem;
};
export default columns;
