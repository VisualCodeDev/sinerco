import { useToast } from "@/Components/Toast/ToastProvider";
import { splitCamelCase } from "@/Components/utils/dashboard-util";
import React, { useEffect, useState } from "react";

const UnitInfo = (props) => {
    const { unitData, unitId, setUnitData } = props;
    const { addToast } = useToast();
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    useEffect(() => {
        const excludedKeys = ["client", "area", "location"];

        const filteredData = Object.fromEntries(
            Object.entries(unitData?.info).filter(
                ([key]) => !excludedKeys.includes(key),
            ),
        );
        setFormData(filteredData);
    }, [unitData?.info]);

    const handleSave = async () => {
        try {
            const resp = await axios.post(route("unit.update.info"), {
                unit_id: unitId,
                data: formData,
            });
            if (resp.status === 200) {
                addToast(resp?.data);
                setUnitData((prev) => ({
                    ...prev,
                    info: {...formData},
                }));

                setIsEditing(false);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const changeTextFormat = (text) => {
        if (typeof text !== "string") return text;

        let finalText = splitCamelCase(text);

        finalText = finalText.replace(/\b[sS][nN]\b/g, "S/N");

        return finalText;
    };

    const labelStyle = "text-sm font-medium text-zinc-700";
    const inputBaseStyle =
        "w-full px-3 py-2 rounded-md border text-sm transition";
    const inputReadOnly = "bg-zinc-100 border-primary text-zinc-500";
    const inputEditable =
        "border-primary focus:border-black focus:ring-1 focus:ring-blue-500 bg-white";

    return (
        <div className="w-full mx-auto p-8 bg-white rounded-2xl shadow-sm flex flex-col items-center">
            <h2 className="text-xl font-semibold text-zinc-800 mb-6 border-b pb-2">
                Unit Information
            </h2>

            <div className="">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {Object.keys(formData)
                        .filter(
                            (item) =>
                                item !== "client" &&
                                item !== "area" &&
                                item !== "location",
                        )
                        .map((item) => (
                            <div key={item} className="space-y-1">
                                <label className={labelStyle}>
                                    {changeTextFormat(item)}
                                </label>
                                <input
                                    disabled={
                                        item === "client" ||
                                        item === "area" ||
                                        item === "location"
                                    }
                                    type="text"
                                    value={formData[item] || ""}
                                    onChange={(e) =>
                                        handleChange(item, e.target.value)
                                    }
                                    readOnly={!isEditing}
                                    className={`${inputBaseStyle} ${
                                        isEditing
                                            ? inputEditable
                                            : inputReadOnly
                                    }`}
                                />
                            </div>
                        ))}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t mt-8 w-full">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-1.5 text-sm rounded-md border border-primary bg-white text-zinc-700 hover:bg-zinc-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-1.5 text-sm rounded-md border border-transparent bg-primary text-white hover:bg-blue-900 transition"
                            >
                                Save
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-1.5 text-sm rounded-md border border-transparent bg-primary text-white hover:bg-blue-900 transition"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UnitInfo;
