import { getFields } from "@/Components/db";
import LoadingSpinner from "@/Components/Loading";
import MultiSelectDropdown from "@/Components/MultiSelectDropdown";
import { useToast } from "@/Components/Toast/ToastProvider";
import { formItems } from "@/Components/utils/dashboard-util";
import { fetch } from "@/Components/utils/database-util";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useState } from "react";

const InputValidationSetting = (props) => {
    const { data, clientData, selectedClients } = props;
    const [formData, setFormData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [fields, setFields] = useState([]);
    const { addToast } = useToast();
    // const { data: clients, loading, error } = fetch("client.get");
    // const [selectedClients, setSelectedClients] = useState([]);
    // const clientOptions = clients.map((client) => ({
    //     value: client.clientId,
    //     label: client.name,
    // }));

    useEffect(() => {
        const fetchFields = async () => {
            const data = await getFields();
            setFields(data);
        };
        fetchFields();

        let defaultDecimalSetting = {};
        let defaultMinMaxSetting = {};
        let defaultUnitSetting = {};
        let defaultThresholdSetting = {};

        formItems
            .filter((item) => item.name !== "time")
            .forEach((item) => {
                if (item?.subheader && item.subheader.length > 0) {
                    item.subheader.forEach((sub) => {
                        if (sub?.default?.decimalSetting) {
                            defaultDecimalSetting[sub.name] =
                                sub.default.decimalSetting;
                        }
                        if (
                            sub?.default?.minSetting ||
                            sub?.default?.maxSetting
                        ) {
                            defaultMinMaxSetting[sub.name] = {
                                min: sub.default.minSetting,
                                max: sub.default.maxSetting,
                            };
                        }
                        if (sub?.default?.unitSetting) {
                            defaultUnitSetting[sub.name] =
                                sub.default.unitSetting;
                        }
                        defaultThresholdSetting[sub.name] = {
                            value: 0,
                            type: "number",
                        };
                    });
                    return;
                }
                if (item?.default?.decimalSetting) {
                    defaultDecimalSetting[item.name] =
                        item.default.decimalSetting;
                }
                if (item?.default?.minSetting || item?.default?.maxSetting) {
                    defaultMinMaxSetting[item.name] = {
                        min: item.default.minSetting,
                        max: item.default.maxSetting,
                    };
                }
                if (item?.default?.unitSetting) {
                    defaultUnitSetting[item.name] = item.default.unitSetting;
                }
                defaultThresholdSetting[item.name] = {
                    value: 0,
                    type: "number",
                };
            });
        setFormData((prev) => ({
            ...prev,
            decimalSetting: data?.decimalSetting ?? defaultDecimalSetting,
            minMaxSetting: data?.minMaxSetting ?? defaultMinMaxSetting,
            unitSetting: data?.unitSetting ?? defaultUnitSetting,
            thresholdSetting: data?.thresholdSetting ?? defaultThresholdSetting,
        }));
    }, [data]);

    const handleChange = (settingType, field, value) => {
        if (settingType === "decimalSetting" || settingType === "unitSetting") {
            setFormData({
                ...formData,
                [settingType]: {
                    ...formData[settingType],
                    [field]: value,
                },
            });
        } else if (
            settingType === "minMaxSetting" ||
            settingType === "thresholdSetting"
        ) {
            setFormData((prev) => ({
                ...prev,
                [settingType]: {
                    ...prev[settingType],
                    [field]: {
                        ...prev[settingType]?.[field],
                        ...value,
                    },
                },
            }));
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const resp = await axios.post(route("daily.setting"), {
                client_id: selectedClients,
                ...formData,
            });
            if (resp.status === 200 || resp.status === 302) {
                addToast(resp.data);
            } else {
            }
        } catch (err) {
            console.error("Error creating report:", err);
            addToast({
                type: "error",
                text: err?.response?.data?.message || "Failed to save data!",
            });
        } finally {
            setSaving(false);
        }
    };

    const options = [];
    for (let i = 0; i <= 10; i++) {
        options.push(
            <option key={i} value={i}>
                {i}
            </option>
        );
    }
    if (!formData) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col gap-6">
            {/* <h2 className="text-xl font-semibold text-gray-800">
                Input Validation Settings
            </h2>
            <div className="flex flex-col gap-2">
                <p className="text-base">Client: </p>
                <MultiSelectDropdown
                    options={clientOptions}
                    selected={selectedClients}
                    setSelected={setSelectedClients}
                />
            </div> */}

            <div className="overflow-y-auto w-screen overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-[#243F96] text-white z-10 shadow-sm w-full sticky top-0">
                        <tr className="sticky top-0">
                            <th className="font-semibold text-nowrap text-left px-6 py-4 rounded-tl-lg w-[25%]">
                                Item
                            </th>
                            <th className="font-semibold text-nowrap text-left px-6 py-4 w-[15%]">
                                Decimal Settings
                            </th>
                            <th className="font-semibold text-nowrap text-left px-6 py-4 w-[25%]">
                                Min Max Settings
                            </th>
                            <th className="font-semibold text-nowrap text-left px-6 py-4 w-[15%]">
                                Unit Settings
                            </th>
                            {/* <th className="font-semibold text-nowrap text-left px-6 py-4 w-[20%] rounded-tr-lg">
                                Input Threshold
                            </th> */}
                        </tr>
                    </thead>

                    <tbody>
                        {fields
                            .filter(
                                (item) =>
                                    item.name !== "time" &&
                                    item.name !== "remarks"
                            )
                            .flatMap((item) => {
                                const fields =
                                    item.subfields.length > 0
                                        ? item?.subfields
                                        : [item];
                                return fields.map((field, idx) => {
                                    return (
                                        <tr
                                            key={field.name + idx}
                                            className="border-b border-[#E4E7EC] bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors"
                                        >
                                            {/* ITEM NAME */}
                                            <td className="py-6 px-6 font-medium text-[#101828] whitespace-nowrap">
                                                {field.name}
                                            </td>

                                            {/* DECIMAL SETTINGS */}
                                            <td className="px-6 py-4">
                                                <select
                                                    className="w-[120px] h-[40px] border border-[#D0D5DD] rounded-lg px-3 text-[#344054] bg-white shadow-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "decimalSetting",
                                                            field.slug,
                                                            e.target.value
                                                        )
                                                    }
                                                    value={
                                                        formData
                                                            ?.decimalSetting?.[
                                                            field.slug
                                                        ] || ""
                                                    }
                                                >
                                                    {options}
                                                </select>
                                            </td>

                                            {/* MIN & MAX SETTINGS */}
                                            <td className="px-6 py-4">
                                                <div className="flex gap-3">
                                                    <input
                                                        type="number"
                                                        placeholder="Min"
                                                        className="w-[100px] h-[40px] border border-[#D0D5DD] rounded-lg px-3 text-[#344054] bg-white shadow-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "minMaxSetting",
                                                                field.slug,
                                                                {
                                                                    min: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        value={
                                                            formData
                                                                ?.minMaxSetting?.[
                                                                field.slug
                                                            ]?.min || ""
                                                        }
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Max"
                                                        className="w-[100px] h-[40px] border border-[#D0D5DD] rounded-lg px-3 text-[#344054] bg-white shadow-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "minMaxSetting",
                                                                field.slug,
                                                                {
                                                                    max: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        value={
                                                            formData
                                                                ?.minMaxSetting?.[
                                                                field.slug
                                                            ]?.max || ""
                                                        }
                                                    />
                                                </div>
                                            </td>

                                            {/* UNIT SETTINGS */}
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    placeholder="Unit"
                                                    className="w-[120px] h-[40px] border border-[#D0D5DD] rounded-lg px-3 text-[#344054] bg-white shadow-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "unitSetting",
                                                            field.slug,
                                                            e.target.value
                                                        )
                                                    }
                                                    value={
                                                        formData?.unitSetting?.[
                                                            field.slug
                                                        ] || ""
                                                    }
                                                />
                                            </td>

                                            {/* INPUT THRESHOLD */}
                                            {/* <td className="px-6 py-4">
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="Threshold"
                                                        className="w-[120px] h-[40px] border border-[#D0D5DD] rounded-lg px-3 text-[#344054] bg-white shadow-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "thresholdSetting",
                                                                field.slug,
                                                                {
                                                                    value: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        value={
                                                            formData
                                                                ?.thresholdSetting?.[
                                                                field.slug
                                                            ]?.value || ""
                                                        }
                                                    />
                                                    <select
                                                        className="w-[80px] h-[40px] border border-[#D0D5DD] rounded-lg px-2 text-[#344054] bg-white shadow-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                                                        value={
                                                            formData
                                                                ?.thresholdSetting?.[
                                                                field.slug
                                                            ]?.type || ""
                                                        }
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "thresholdSetting",
                                                                field.slug,
                                                                {
                                                                    type: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                    >
                                                        {[
                                                            {
                                                                label: "%",
                                                                value: "percentage",
                                                            },
                                                            {
                                                                label: "Number",
                                                                value: "number",
                                                            },
                                                        ].map((item) => (
                                                            <option
                                                                key={item.value}
                                                                value={
                                                                    item.value
                                                                }
                                                            >
                                                                {item.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td> */}
                                        </tr>
                                    );
                                });
                            })}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-center mb-10">
                <button
                    onClick={handleSave}
                    className="bg-primary text-white border-2 border-white px-10 py-2 rounded-lg mt-10 text-xl transition ease-in-out hover:bg-transparent hover:text-primary hover:border-primary hover:scale-90"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default InputValidationSetting;
