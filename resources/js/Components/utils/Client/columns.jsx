import { FaCog } from "react-icons/fa";
import { DateInput, TimeInput } from "../dashboard-util";

const columns = ({ handleToggleInvoice, handleOpenSetting }) => {
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
            width: "20%",
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
            name: "is_invoice",
            header: "",
            width: "20%",
            headerClassName: "text-center bg-primary text-white",
            sortable: false,
            Cell: ({ is_invoice, client_id }) => {
                return (
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-muted" style={{ fontSize: 13 }}>
                            Invoice
                        </span>

                        <button
                            onClick={() =>
                                handleToggleInvoice(client_id, is_invoice)
                            }
                            className="border-0 p-0"
                            style={{
                                width: 38,
                                height: 20,
                                borderRadius: 999,
                                background: Boolean(is_invoice)
                                    ? "#22c55e"
                                    : "#e5e7eb",
                                position: "relative",
                                transition: "all 0.25s ease",
                            }}
                        >
                            <div
                                style={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: "50%",
                                    background: "#fff",
                                    position: "absolute",
                                    top: 3,
                                    left: Boolean(is_invoice) ? 20 : 3,
                                    transition: "all 0.25s ease",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                }}
                            />
                        </button>
                    </div>
                );
            },
        },
        // {
        //     name: "pic",
        //     header: "PIC",
        //     width: '15%',
        //     headerClassName: "text-center bg-primary text-white justify-center",
        //     Cell: ({ berita_acaras }) => {
        //         return (
        //             <select
        //                 onClick={(e) => e.stopPropagation()}
        //                 onMouseDown={(e) => e.stopPropagation()}
        //                 className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        //             >
        //                 {Array.isArray(berita_acaras) &&
        //                     [
        //                         ...new Map(
        //                             berita_acaras.map((item) => [
        //                                 item?.pic_name,
        //                                 item,
        //                             ]),
        //                         ).values(),
        //                     ].map((item) => (
        //                         <option key={item.id}>
        //                             {item?.pic_name || "-"}{" "}
        //                         </option>
        //                     ))}{" "}
        //             </select>
        //         );
        //     },
        // },
        // {
        //     name: "supervision",
        //     header: "Supervision",
        //     width: '15%',
        //     headerClassName: "text-center bg-primary text-white justify-center",
        //     Cell: ({ berita_acaras }) => {
        //         return (
        //             <select
        //                 onClick={(e) => e.stopPropagation()}
        //                 onMouseDown={(e) => e.stopPropagation()}
        //                 className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        //             >
        //                 {Array.isArray(berita_acaras) &&
        //                     [
        //                         ...new Map(
        //                             berita_acaras.map((item) => [
        //                                 item?.spv_name,
        //                                 item,
        //                             ]),
        //                         ).values(),
        //                     ].map((item) => (
        //                         <option key={item.id}>
        //                             {item?.spv_name || "-"}
        //                         </option>
        //                     ))}
        //             </select>
        //         );
        //     },
        // },
        {
            name: "setting",
            width: "4%",
            sortable: false,
            headerClassName: "bg-primary text-white text-center justify-center",
            cellClassName: "text-center",
            Cell: (props) => {
                return (
                    <button
                        className="flex items-center justify-center bg-primary text-white p-2 rounded-md"
                        style={{
                            width: 40,
                            height: 40,
                        }}
                        onClick={() => handleOpenSetting(props)}
                    >
                        <FaCog />
                    </button>
                );
            },
        },
    ];
};
export default columns;
