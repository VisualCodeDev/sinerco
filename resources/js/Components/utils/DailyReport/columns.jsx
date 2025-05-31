import { DateInput, TimeInput } from "../dashboard-util";

const list = (handleChange) => {
    const colItem = [
        {
            name: "date",
            header: "Date",
            gridCols: 2,
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <DateInput
                            id={name}
                            className="w-full bg-[#F4F5F9]"
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange([e.target.name], e.target.value)
                            }
                        />
                    </div>
                );
            },
        },
        {
            name: "time",
            header: "Time",
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <TimeInput
                            id={name}
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange([e.target.name], e.target.value)
                            }
                        />
                    </div>
                );
            },
        },
        {
            name: "sourcePress",
            header: "Source Press.",
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <input
                            required
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value)
                                )
                            }
                            placeholder="00.0"
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                        />
                    </div>
                );
            },
        },
        {
            name: "suctionPress",
            header: "Suction Press.",
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <input
                            required
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value)
                                )
                            }
                            placeholder="00.0"
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                        />
                    </div>
                );
            },
        },
        {
            name: "dischargePress",
            header: "Discharge Press.",
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <input
                            required
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value)
                                )
                            }
                            placeholder="00.0"
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                        />
                    </div>
                );
            },
        },
        {
            name: "speed",
            header: "Speed",
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <input
                            required
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value)
                                )
                            }
                            placeholder="00.0"
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                        />
                    </div>
                );
            },
        },
        {
            name: "manifoldPress",
            header: "Manifold Press.",
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <input
                            required
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value)
                                )
                            }
                            placeholder="00.0"
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                        />
                    </div>
                );
            },
        },
        {
            name: "oilPress",
            header: "Oil Press.",
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <input
                            required
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value)
                                )
                            }
                            placeholder="00.0"
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                        />
                    </div>
                );
            },
        },
        {
            name: "oilDiff",
            header: "Oil Diff.",
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <input
                            required
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value)
                                )
                            }
                            placeholder="00.0"
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                        />
                    </div>
                );
            },
        },
        {
            name: "runningHours",
            header: "Running Hours",
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <input
                            required
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value)
                                )
                            }
                            placeholder="00.0"
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                        />
                    </div>
                );
            },
        },
        {
            name: "voltage",
            header: "Voltage",
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <input
                            required
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value)
                                )
                            }
                            placeholder="00.0"
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                        />
                    </div>
                );
            },
        },
        {
            name: "waterTemp",
            header: "Water Temp",
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <input
                            required
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value)
                                )
                            }
                            placeholder="00.0"
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                        />
                    </div>
                );
            },
        },
        {
            name: "dischargeTemp",
            header: "Discharge Temp",
            subheader: [
                {
                    name: "befCooler",
                    sub: "Bef. Cooler",
                },
                {
                    name: "aftCooler",
                    sub: "Aft. Cooler",
                },
            ],
            Cell: ({ item, header, name, subheader }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <div className="flex gap-4">
                            {subheader?.map((sub, index) => {
                                return (
                                    <div className="flex flex-col w-full">
                                        <label className="text-sm">
                                            {sub?.sub}
                                        </label>
                                        <input
                                            required
                                            id={sub.name}
                                            type="number"
                                            name={sub.name}
                                            value={item[sub.name] || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    [e.target.name],
                                                    parseFloat(e.target.value)
                                                )
                                            }
                                            placeholder="00.0"
                                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            },
        },
        {
            name: "staticPress",
            header: "Static Press. Reading",
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <input
                            required
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value)
                                )
                            }
                            placeholder="00.0"
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                        />
                    </div>
                );
            },
        },
        {
            name: "diffPress",
            header: "Diff. Press. Reading",
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <input
                            required
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value)
                                )
                            }
                            placeholder="00.0"
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                        />
                    </div>
                );
            },
        },
        {
            name: "flowRate",
            header: "Flowrate",
            subheader: [{ name: "mscfd", sub: "MSCFD" }],
             Cell: ({ item, header, name, subheader }) => {
                return (
                    <div className="flex flex-col">
                        <label htmlFor={name} className="font-medium text-md mb-1.5">
                            {header}
                        </label>
                        <div className="flex gap-4">
                            {subheader?.map((sub, index) => {
                                return (
                                    <div className="flex flex-col w-full">
                                        <label className="text-sm">
                                            {sub?.sub}
                                        </label>
                                        <input
                                            required
                                            id={sub.name}
                                            type="number"
                                            name={sub.name}
                                            value={item[sub.name] || ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    [e.target.name],
                                                    parseFloat(e.target.value)
                                                )
                                            }
                                            placeholder="00.0"
                                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9]"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            },
        },
    ];

    return colItem;
};
export default list;
