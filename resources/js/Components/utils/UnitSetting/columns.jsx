import { getRequestTypeName, toCapitalizeFirstLetter } from "../dashboard-util";

const columns = (
    type,
    formData,
    unitAreaData,
    handleSelectAll,
    handleChange,
    handleCheckItem,
    handleUpdateDisable,
    disable,
    setDisable
) => {
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
            name: "client",
            header: "Client",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "17%",
            Cell: ({ name }) => {
                return <div className="flex flex-col">{name}</div>;
            },
        },
        {
            name: "gmt",
            header: "Time Zone (GMT)",
            headerClassName: "bg-primary text-white",
            sortable: false,
            width: "15%",
            Cell: ({ gmt_offset, client_id }) => {
                return (
                    <select
                        value={
                            formData?.clientSettings?.[client_id]
                                ?.gmt_offset ||
                            gmt_offset ||
                            1
                        }
                        className="flex flex-col rounded-xl border-[#EAECF0] w-1/2"
                        onChange={(e) => {
                            handleChange(
                                "gmt_offset",
                                client_id,
                                e.target.value
                            );
                        }}
                    >
                        {Array.from({ length: 9 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i + 1}
                            </option>
                        ))}
                    </select>
                );
            },
        },
        {
            name: "interval",
            header: "Input Interval (Hours)",
            headerClassName: "bg-primary text-white",
            sortable: false,
            width: "15%",
            Cell: ({ input_interval, client_id }) => {
                return (
                    <select
                        value={
                            formData?.clientSettings?.[client_id]
                                ?.input_interval ||
                            input_interval ||
                            1
                        }
                        className="flex flex-col rounded-xl border-[#EAECF0] w-1/2"
                        onChange={(e) => {
                            handleChange(
                                "input_interval",
                                client_id,
                                e.target.value
                            );
                        }}
                    >
                        {Array.from({ length: 24 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {i + 1}
                            </option>
                        ))}
                    </select>
                );
            },
        },
        {
            name: "duration",
            header: "Duration (mins)",
            headerClassName: "bg-primary text-white",
            sortable: false,
            width: "17%",
            Cell: ({ input_duration, client_id, disable_duration }) => {
                return (
                    <div className="flex items-center gap-2">
                        <select
                            value={
                                formData?.clientSettings?.[client_id]
                                    ?.input_duration ||
                                input_duration ||
                                35
                            }
                            className="flex flex-col rounded-xl border-[#EAECF0] w-1/2"
                            onChange={(e) => {
                                handleChange(
                                    "input_duration",
                                    client_id,
                                    e.target.value
                                );
                            }}
                        >
                            {Array.from({ length: 59 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1}
                                </option>
                            ))}
                            {[120, 180].map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                        <button
                            className={`${
                                disable_duration ? "bg-red-500" : "bg-green-500"
                            } text-white rounded-md px-2 py-1`}
                            onClick={() => handleUpdateDisable(client_id)}
                        >
                            {disable_duration ? "Enable" : "Disable"}
                        </button>
                    </div>
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
            Cell: ({ client_id }) => {
                return (
                    <input
                        type="checkbox"
                        className="w-5 h-5 rounded-sm"
                        checked={formData?.selectedRows?.includes(
                            client_id.toString()
                        )}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleCheckItem(client_id);
                        }}
                    />
                );
            },
        },
    ];

    return dataListCheckbox;
};
export default columns;
