import { getRequestTypeName, toCapitalizeFirstLetter } from "../dashboard-util";

const columns = (
    type,
    formData,
    unitAreaData,
    handleSelectAll,
    handleChange,
    handleCheckItem
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
            name: "interval",
            header: "Input Interval (Hours)",
            headerClassName: "bg-primary text-white",
            sortable: false,
            width: "17%",
            Cell: ({ input_interval, client_id }) => {
                return (
                    <select
                        value={
                            formData?.clientSettings?.[client_id]?.input_interval ||
                            input_interval ||
                            1
                        }
                        className="flex flex-col"
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
            Cell: ({ input_duration, client_id }) => {
                return (
                    <select
                        value={
                            formData?.clientSettings?.[client_id]?.input_duration ||
                            input_duration ||
                            35
                        }
                        className="flex flex-col"
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
                    </select>
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
                        checked={formData?.selectedRows?.includes(
                            client_id.toString()
                        )}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleCheckItem(client_id)
                        }}
                    />
                );
            },
        },
    ];

    return dataListCheckbox;
};
export default columns;
