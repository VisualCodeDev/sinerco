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
            width: "13%",
            Cell: ({ unit }) => {
                return (
                    <>
                        <div>{unit?.unit}</div>
                    </>
                );
            },
        },
        {
            name: "startDate",
            header: "Start Date",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "10%",
            Cell: ({ startDate }) => {
                return (
                    <>
                        <div>{getFormattedDate(startDate)}</div>
                    </>
                );
            },
        },
        {
            name: "startTime",
            header: "Time (Start)",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "8%",
            Cell: ({ startTime }) => {
                return (
                    <>
                        <div>{startTime}</div>
                    </>
                );
            },
        },
        {
            name: "requestType",
            header: "Request",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "10%",
            Cell: ({ requestType }) => {
                return (
                    <>
                        <div>{getRequestTypeName(requestType)}</div>
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
            width: "10%",
            Cell: ({ endDate }) => {
                return (
                    <>
                        <div>{getFormattedDate(endDate)}</div>
                    </>
                );
            },
        },
        {
            name: "endTime",
            header: "Time (End)",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "8%",
            Cell: ({ endTime }) => {
                return (
                    <>
                        <div>{endTime}</div>
                    </>
                );
            },
        },
        {
            name: "status",
            header: "Req. Status",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "10%",
            Cell: ({ status }) => {
                return (
                    <>
                        <div>{status}</div>
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
            width: "7%",
            Cell: ({ remarks }) => {
                return (
                    <>
                        <div>{remarks}</div>
                    </>
                );
            },
        },
        {
            name: "requestedBy",
            header: "Requested By",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "13%",
            Cell: ({ user, created_at }) => {
                return (
                    <div className="flex flex-col">
                        <span className="text-sm">{user?.name}</span>
                        <span className="text-xs text-gray-500 font-light">
                            (
                            {getFormattedDate(created_at, "DD MMM YYYY, HH:mm")}
                            )
                        </span>
                    </div>
                );
            },
        },
        {
            name: "seenStatus",
            header: "Seen Status",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "",
            sortable: false,
            width: "10%",
            Cell: ({ requestId, seenStatus }) => {
                console.log(seenStatus)
                return (
                    <div className="flex justify-center items-center">
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
                        ) : (
                            <div>
                                {seenStatus ? (
                                    <p className="bg-green-500 text-white text-center px-2 py-1 rounded-lg text-sm font-medium">
                                        Confirmed
                                    </p>
                                ) : (
                                    <p className="text-slate-400 text-center">-</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            },
        },
    ];
    return colItem;
};
export default columns;
