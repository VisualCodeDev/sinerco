import LoadingSpinner from "@/Components/Loading";
import MultiSelectDropdown from "@/Components/MultiSelectDropdown";
import { useToast } from "@/Components/Toast/ToastProvider";
import { formItems } from "@/Components/utils/dashboard-util";
import { fetch } from "@/Components/utils/database-util";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useState } from "react";

const UnitSetting = (props) => {
    const { data, clientData } = props;
    const [selectedClients, setSelectedClients] = useState([]);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();
    const { data: clients, loading, error } = fetch("client.get");

    useEffect(() => {
        let defaultDecimalSetting = {};
        let defaultMinMaxSetting = {};

        formItems
            .filter((item) => item.name !== "time")
            .forEach((item) => {
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
            });

        setFormData((prev) => ({
            ...prev,
            decimalSetting: data?.decimalSetting ?? defaultDecimalSetting,
            minMaxSetting: data?.minMaxSetting ?? defaultMinMaxSetting,
        }));
    }, []);

    const handleChange = (settingType, field, value) => {
        if (settingType === "decimalSetting") {
            setFormData({
                ...formData,
                [settingType]: {
                    ...formData[settingType],
                    [field]: value,
                },
            });
        } else if (settingType === "minMaxSetting") {
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
                clientId: selectedClients,
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
    if (loading) {
        return <LoadingSpinner />;
    }
    const clientOptions = clients.map((client) => ({
        value: client.clientId,
        label: client.name,
    }));
    return (
        <PageLayout>
            <div className="mb-12">
                <p className="text-xl">Client: </p>
                <MultiSelectDropdown
                    options={clientOptions}
                    selected={selectedClients}
                    setSelected={setSelectedClients}
                />
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
                <table className="w-full table-fixed">
                    <thead className="sticky top-0 bg-primary text-white z-10">
                        <tr className="">
                            <th className="font-semibold md:w-1/3 text-left px-4 py-3">
                                Item
                            </th>
                            <th className="font-semibold text-left py-3">
                                Decimal Settings
                            </th>
                            <th className="font-semibold text-left py-3">
                                Min Max Settings
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {formItems
                            .filter(
                                (item) =>
                                    item.name !== "time" &&
                                    item.name !== "remarks"
                            )
                            .flatMap((item) => {
                                const fields = item.subheader || [item];
                                return fields.map((field, idx) => {
                                    return (
                                        <tr
                                            key={field.name + idx}
                                            className="border-b border-primary"
                                        >
                                            <td className="py-3 px-4 font-semibold">
                                                {field.header || field.sub}
                                            </td>
                                            <td>
                                                <select
                                                    className="py-1 md:w-[100px]"
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "decimalSetting",
                                                            field.name,
                                                            e.target.value
                                                        )
                                                    }
                                                    value={
                                                        formData
                                                            ?.decimalSetting[
                                                            field.name
                                                        ] || ""
                                                    }
                                                >
                                                    {options}
                                                </select>
                                            </td>
                                            <td>
                                                <div className="flex flex-col md:flex-row gap-2">
                                                    <input
                                                        className="md:w-[100px]"
                                                        type="number"
                                                        placeholder="min."
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "minMaxSetting",
                                                                field.name,
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
                                                                field.name
                                                            ]?.min || ""
                                                        }
                                                    />
                                                    <input
                                                        className="md:w-[100px]"
                                                        type="number"
                                                        placeholder="max."
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "minMaxSetting",
                                                                field.name,
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
                                                                field.name
                                                            ]?.max || ""
                                                        }
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                });
                            })}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-center">
                <button
                    onClick={handleSave}
                    className="bg-primary text-white px-6 py-2 rounded-xl mt-10 text-2xl"
                >
                    Simpan
                </button>
            </div>
        </PageLayout>
    );
};

export default UnitSetting;
