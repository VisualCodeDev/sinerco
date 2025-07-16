import { DateInput, TimeInput } from "../dashboard-util";

const list = ({ handleChange, formData, reportSettings, role }) => {
    const colItem = [
        {
            name: "date",
            header: "Date",
            gridCols: 2,
            Cell: ({ item, header, name }) => {
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
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
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <TimeInput
                            formData={formData}
                            item={item}
                            role={role}
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
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min || null,
                    max: reportSettings?.minMaxSetting[name]?.max || null,
                };
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <input
                            required
                            // min={minMaxSetting.min}
                            // max={minMaxSetting.max}
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            step={decimalSetting}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value),
                                    minMaxSetting
                                )
                            }
                            placeholder={decimalSetting}
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
                        />
                    </div>
                );
            },
        },
        {
            name: "suctionPress",
            header: "Suction Press.",
            Cell: ({ item, header, name }) => {
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min,
                    max: reportSettings?.minMaxSetting[name]?.max,
                };
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <input
                            required
                            // min={minMaxSetting.min}
                            // max={minMaxSetting.max}
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            step={
                                1 /
                                Math.pow(
                                    10,
                                    reportSettings?.decimalSetting[name]
                                )
                            }
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value),
                                    minMaxSetting
                                )
                            }
                            placeholder={decimalSetting}
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
                        />
                    </div>
                );
            },
        },
        {
            name: "dischargePress",
            header: "Discharge Press.",
            Cell: ({ item, header, name }) => {
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min,
                    max: reportSettings?.minMaxSetting[name]?.max,
                };
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <input
                            required
                            // min={minMaxSetting.min}
                            // max={minMaxSetting.max}
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            step={
                                1 /
                                Math.pow(
                                    10,
                                    reportSettings?.decimalSetting[name]
                                )
                            }
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value),
                                    minMaxSetting
                                )
                            }
                            placeholder={decimalSetting}
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
                        />
                    </div>
                );
            },
        },
        {
            name: "speed",
            header: "Speed",
            Cell: ({ item, header, name }) => {
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min,
                    max: reportSettings?.minMaxSetting[name]?.max,
                };
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <input
                            required
                            // min={minMaxSetting.min}
                            // max={minMaxSetting.max}
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            step={
                                1 /
                                Math.pow(
                                    10,
                                    reportSettings?.decimalSetting[name]
                                )
                            }
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value),
                                    minMaxSetting
                                )
                            }
                            placeholder={decimalSetting}
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
                        />
                    </div>
                );
            },
        },
        {
            name: "manifoldPress",
            header: "Manifold Press.",
            Cell: ({ item, header, name }) => {
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min,
                    max: reportSettings?.minMaxSetting[name]?.max,
                };
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <input
                            required
                            // min={minMaxSetting.min}
                            // max={minMaxSetting.max}
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            step={
                                1 /
                                Math.pow(
                                    10,
                                    reportSettings?.decimalSetting[name]
                                )
                            }
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value),
                                    minMaxSetting
                                )
                            }
                            placeholder={decimalSetting}
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
                        />
                    </div>
                );
            },
        },
        {
            name: "oilPress",
            header: "Oil Press.",
            Cell: ({ item, header, name }) => {
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min,
                    max: reportSettings?.minMaxSetting[name]?.max,
                };
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <input
                            required
                            // min={minMaxSetting.min}
                            // max={minMaxSetting.max}
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            step={
                                1 /
                                Math.pow(
                                    10,
                                    reportSettings?.decimalSetting[name]
                                )
                            }
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value),
                                    minMaxSetting
                                )
                            }
                            placeholder={decimalSetting}
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
                        />
                    </div>
                );
            },
        },
        {
            name: "oilDiff",
            header: "Oil Diff.",
            Cell: ({ item, header, name }) => {
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min,
                    max: reportSettings?.minMaxSetting[name]?.max,
                };
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <input
                            required
                            // min={minMaxSetting.min}
                            // max={minMaxSetting.max}
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            step={
                                1 /
                                Math.pow(
                                    10,
                                    reportSettings?.decimalSetting[name]
                                )
                            }
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value),
                                    minMaxSetting
                                )
                            }
                            placeholder={decimalSetting}
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
                        />
                    </div>
                );
            },
        },
        {
            name: "runningHours",
            header: "Running Hours",
            Cell: ({ item, header, name }) => {
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min,
                    max: reportSettings?.minMaxSetting[name]?.max,
                };
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <input
                            required
                            // min={minMaxSetting.min}
                            // max={minMaxSetting.max}
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            step={
                                1 /
                                Math.pow(
                                    10,
                                    reportSettings?.decimalSetting[name]
                                )
                            }
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value),
                                    minMaxSetting
                                )
                            }
                            placeholder={decimalSetting}
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
                        />
                    </div>
                );
            },
        },
        {
            name: "voltage",
            header: "Voltage",
            Cell: ({ item, header, name }) => {
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min,
                    max: reportSettings?.minMaxSetting[name]?.max,
                };
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <input
                            required
                            // min={minMaxSetting.min}
                            // max={minMaxSetting.max}
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            step={
                                1 /
                                Math.pow(
                                    10,
                                    reportSettings?.decimalSetting[name]
                                )
                            }
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value),
                                    minMaxSetting
                                )
                            }
                            placeholder={decimalSetting}
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
                        />
                    </div>
                );
            },
        },
        {
            name: "waterTemp",
            header: "Water Temp",
            Cell: ({ item, header, name }) => {
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min,
                    max: reportSettings?.minMaxSetting[name]?.max,
                };
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <input
                            required
                            // min={minMaxSetting.min}
                            // max={minMaxSetting.max}
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            step={
                                1 /
                                Math.pow(
                                    10,
                                    reportSettings?.decimalSetting[name]
                                )
                            }
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value),
                                    minMaxSetting
                                )
                            }
                            placeholder={decimalSetting}
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
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
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min,
                    max: reportSettings?.minMaxSetting[name]?.max,
                };
                return (
                    <div className="flex flex-col flew-wrap">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <div className="flex lg:md:flex-row flex-col gap-4">
                            {subheader?.map((sub, index) => {
                                return (
                                    <div className="flex flex-col lg:md:w-1/2 w-full">
                                        <label className="text-sm">
                                            {sub?.sub}
                                        </label>
                                        <input
                                            required
                                            id={sub.name}
                                            type="number"
                                            name={sub.name}
                                            value={item[sub.name] || ""}
                                            step={decimalSetting}
                                            onChange={(e) =>
                                                handleChange(
                                                    [e.target.name],
                                                    parseFloat(e.target.value),
                                                    minMaxSetting
                                                )
                                            }
                                            placeholder={decimalSetting}
                                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
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
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min,
                    max: reportSettings?.minMaxSetting[name]?.max,
                };
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <input
                            required
                            // min={minMaxSetting.min}
                            // max={minMaxSetting.max}
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            step={
                                1 /
                                Math.pow(
                                    10,
                                    reportSettings?.decimalSetting[name]
                                )
                            }
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value),
                                    minMaxSetting
                                )
                            }
                            placeholder={decimalSetting}
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
                        />
                    </div>
                );
            },
        },
        {
            name: "diffPress",
            header: "Diff. Press. Reading",
            Cell: ({ item, header, name }) => {
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min,
                    max: reportSettings?.minMaxSetting[name]?.max,
                };
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
                        </label>
                        <input
                            required
                            // min={minMaxSetting.min}
                            // max={minMaxSetting.max}
                            id={name}
                            type="number"
                            name={name}
                            value={item[name] || ""}
                            step={decimalSetting}
                            onChange={(e) =>
                                handleChange(
                                    [e.target.name],
                                    parseFloat(e.target.value),
                                    minMaxSetting
                                )
                            }
                            placeholder={decimalSetting}
                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
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
                const decimalSetting =
                    1 / Math.pow(10, reportSettings?.decimalSetting[name]) || 1;
                const minMaxSetting = {
                    min: reportSettings?.minMaxSetting[name]?.min,
                    max: reportSettings?.minMaxSetting[name]?.max,
                };
                return (
                    <div className="flex flex-col">
                        <label
                            htmlFor={name}
                            className="font-medium lg:md:text-base text-sm lg:md:mb-1.5 mb-1"
                        >
                            {header}{" "}
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
                                            step={decimalSetting}
                                            onChange={(e) =>
                                                handleChange(
                                                    [e.target.name],
                                                    parseFloat(e.target.value),
                                                    minMaxSetting
                                                )
                                            }
                                            placeholder={decimalSetting}
                                            className="border-[#DBDCDE] px-4 py-2.5 rounded-lg bg-[#F4F5F9] lg:md:text-base text-sm"
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
