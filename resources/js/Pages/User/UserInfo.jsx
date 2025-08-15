import {
    splitCamelCase,
    toCapitalizeFirstLetter,
} from "@/Components/utils/dashboard-util";
import { useState } from "react";

export default function UserInfo({ data, onSave, roleData }) {
    const [name, setName] = useState(data?.name || "");
    const [role, setRole] = useState(data?.role || "");
    const [password, setPassword] = useState(data?.password || "");
    const [isEditing, setIsEditing] = useState(false);
    const handleSave = () => {
        setIsEditing(false);
        onSave({ name, role, password });
    };
    const labelStyle = "text-sm font-medium text-zinc-700";
    const inputBaseStyle =
        "w-full px-3 py-2 rounded-md border text-sm transition";
    const inputReadOnly = "bg-zinc-100 border-primary text-zinc-500";
    const inputEditable =
        "border-primary focus:border-black focus:ring-1 focus:ring-blue-500 bg-white";
    return (
        <div className="max-w-lg space-y-5">
            <div className="space-y-1">
                <label className={labelStyle}>Email</label>
                <input
                    type="email"
                    value={data?.email}
                    readOnly
                    className={`${inputBaseStyle} ${inputReadOnly}`}
                />
            </div>

            <div className="space-y-1">
                <label className={labelStyle}>Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                        setName(toCapitalizeFirstLetter(e.target.value))
                    }
                    readOnly={!isEditing}
                    className={`${inputBaseStyle} ${
                        isEditing ? inputEditable : inputReadOnly
                    } capitalize`}
                />
            </div>

            <div className="space-y-1">
                <label className={labelStyle}>Role</label>
                <select
                    value={role}
                    className={`${inputBaseStyle} ${
                        isEditing ? inputEditable : inputReadOnly
                    }`}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={!isEditing}
                >
                    {roleData?.map((item, index) => (
                        <option value={item?.id}>
                            {splitCamelCase(item?.name)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label className={labelStyle}>New Password</label>
                <input
                    type={isEditing ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
}
