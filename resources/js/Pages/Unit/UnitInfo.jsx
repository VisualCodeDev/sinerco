import { useToast } from "@/Components/Toast/ToastProvider";
import React, { useState } from "react";

const UnitInfo = (props) => {
    const { unitData, name, setName } = props;
    const { addToast } = useToast();
    const [formDataName, setFormDataName] = useState(name || unitData?.name);
    const [isEditing, setIsEditing] = useState(false);
    const handleSave = async () => {
        try {
            const resp = await axios.post(route("unit.update.info"), {
                unit_id: unitData?.unit_id,
                name: formDataName,
            });
            if (resp.status === 200) {
                addToast(resp?.data);
                setName(formDataName)
                setIsEditing(false);
            }
        } catch (e) {
            console.error(e);
        }
    };
    const labelStyle = "text-sm font-medium text-zinc-700";
    const inputBaseStyle =
        "w-full px-3 py-2 rounded-md border text-sm transition";
    const inputReadOnly = "bg-zinc-100 border-primary text-zinc-500";
    const inputEditable =
        "border-primary focus:border-black focus:ring-1 focus:ring-blue-500 bg-white";

    return (
        <div className="max-w-lg space-y-2 p-10">
            <div className="space-y-1">
                <label className={labelStyle}>Unit Name</label>
                <input
                    type="text"
                    value={formDataName || unitData?.unit}
                    onChange={(e) => setFormDataName(e.target.value)}
                    readOnly={!isEditing}
                    className={`${inputBaseStyle} ${
                        isEditing ? inputEditable : inputReadOnly
                    }`}
                />
            </div>

            <div className="flex gap-3 pt-2">
                {isEditing ? (
                    <>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-1.5 text-sm rounded border border-primary text-zinc-700 hover:bg-zinc-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-1.5 text-sm rounded bg-primary text-white hover:bg-blue-900 transition"
                        >
                            Save
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-1.5 text-sm rounded bg-primary text-white hover:bg-blue-900 transition"
                    >
                        Edit
                    </button>
                )}
            </div>
        </div>
    );
};

export default UnitInfo;
