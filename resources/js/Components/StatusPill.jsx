import React from "react";
import { getRequestTypeName } from "./utils/dashboard-util";

const StatusPill = ({ request_type }) => {
    return (
        <div
            className={`flex gap-2 items-center text-white justify-center px-3 py-2 rounded-lg min-w-[100px]
                ${
                    request_type === "stdby"
                        ? "bg-yellow-500"
                        : request_type === "running"
                        ? "bg-green-500"
                        : "bg-red-500"
                }
                `}
        >
            <p>{getRequestTypeName(request_type)}</p>
        </div>
    );
};

export default StatusPill;
