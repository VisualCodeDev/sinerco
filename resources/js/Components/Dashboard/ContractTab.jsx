import { useToast } from "@/Components/Toast/ToastProvider";
import LoadingSpinner from "@/Components/Loading";
import { FaFilePdf, FaTrash, FaUpload } from "react-icons/fa";
import React, { useEffect, useRef, useState } from "react";

const STATUS_OPTIONS = [
    { value: "active", label: "Active", className: "bg-success/10 text-success" },
    { value: "expired", label: "Expired", className: "bg-yellow-100 text-yellow-700" },
    { value: "terminated", label: "Terminated", className: "bg-danger/10 text-danger" },
];

// Tab "Contract" di halaman Daily -- 1 kontrak per unit_position (bukan per unit
// fisik), karena kontrak itu perjanjian dengan client SAAT INI. Lihat
// app/Models/Contract.php & ContractController buat detail backend-nya.
const ContractTab = ({ unitPositionId }) => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [contract, setContract] = useState(null);
    const [formData, setFormData] = useState({
        contract_number: "",
        start_date: "",
        end_date: "",
        status: "active",
    });
    const fileInputRef = useRef();

    const fetchContract = async () => {
        setLoading(true);
        try {
            const resp = await axios.get(
                route("contract.get", unitPositionId),
            );
            setContract(resp.data || null);
            setFormData({
                contract_number: resp.data?.contract_number || "",
                start_date: resp.data?.start_date || "",
                end_date: resp.data?.end_date || "",
                status: resp.data?.status || "active",
            });
        } catch (e) {
            console.error(e);
            addToast({ type: "error", text: "Failed to load contract." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (unitPositionId) fetchContract();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unitPositionId]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const resp = await axios.post(route("contract.store"), {
                unit_position_id: unitPositionId,
                ...formData,
            });
            addToast(resp?.data);
            setContract(resp?.data?.data);
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            addToast({
                type: "error",
                text: e?.response?.data?.message || "Failed to save contract.",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            contract_number: contract?.contract_number || "",
            start_date: contract?.start_date || "",
            end_date: contract?.end_date || "",
            status: contract?.status || "active",
        });
        setIsEditing(false);
    };

    const handleUploadDocument = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const form = new FormData();
            form.append("unit_position_id", unitPositionId);
            form.append("document", file);
            const resp = await axios.post(
                route("contract.document.upload"),
                form,
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            addToast(resp?.data);
            setContract(resp?.data?.data);
        } catch (e) {
            console.error(e);
            addToast({
                type: "error",
                text:
                    e?.response?.data?.message ||
                    "Failed to upload document (PDF only, max 10MB).",
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveDocument = async () => {
        try {
            const resp = await axios.delete(
                route("contract.document.destroy", unitPositionId),
            );
            addToast(resp?.data);
            setContract((prev) => ({ ...prev, document_path: null }));
        } catch (e) {
            console.error(e);
            addToast({
                type: "error",
                text: "Failed to remove document.",
            });
        }
    };

    const labelStyle = "text-sm font-medium text-zinc-700";
    const inputBaseStyle =
        "w-full px-3 py-2 rounded-md border text-sm transition";
    const inputReadOnly = "bg-zinc-100 border-primary text-zinc-500";
    const inputEditable =
        "border-primary focus:border-black focus:ring-1 focus:ring-blue-500 bg-white";

    if (loading) {
        return <LoadingSpinner />;
    }

    const statusMeta =
        STATUS_OPTIONS.find((s) => s.value === formData.status) ||
        STATUS_OPTIONS[0];

    return (
        <div className="w-full mx-auto p-8 bg-white rounded-2xl shadow-sm flex flex-col items-center">
            <h2 className="text-xl font-semibold text-zinc-800 mb-6 border-b pb-2 w-full text-center">
                Contract
            </h2>

            <div className="w-full max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1">
                        <label className={labelStyle}>Contract Number</label>
                        <input
                            type="text"
                            placeholder="e.g. CTR-2026-001"
                            value={formData.contract_number}
                            onChange={(e) =>
                                handleChange("contract_number", e.target.value)
                            }
                            readOnly={!isEditing}
                            className={`${inputBaseStyle} ${
                                isEditing ? inputEditable : inputReadOnly
                            }`}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className={labelStyle}>Status</label>
                        {isEditing ? (
                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    handleChange("status", e.target.value)
                                }
                                className={`${inputBaseStyle} ${inputEditable} bg-white`}
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div
                                className={`${inputBaseStyle} border-primary flex items-center`}
                            >
                                <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusMeta.className}`}
                                >
                                    {statusMeta.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className={labelStyle}>Start Date</label>
                        <input
                            type="date"
                            value={formData.start_date || ""}
                            onChange={(e) =>
                                handleChange("start_date", e.target.value)
                            }
                            readOnly={!isEditing}
                            disabled={!isEditing}
                            className={`${inputBaseStyle} ${
                                isEditing ? inputEditable : inputReadOnly
                            }`}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className={labelStyle}>End Date</label>
                        <input
                            type="date"
                            value={formData.end_date || ""}
                            onChange={(e) =>
                                handleChange("end_date", e.target.value)
                            }
                            readOnly={!isEditing}
                            disabled={!isEditing}
                            className={`${inputBaseStyle} ${
                                isEditing ? inputEditable : inputReadOnly
                            }`}
                        />
                    </div>
                </div>

                {/* Dokumen kontrak */}
                <div className="mt-6 pt-4 border-t">
                    <label className={`${labelStyle} block mb-2`}>
                        Contract Document
                    </label>
                    {contract?.document_path ? (
                        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-md px-4 py-3">
                            <FaFilePdf className="text-danger text-xl shrink-0" />
                            <a
                                href={`/storage/${contract.document_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-primary hover:underline truncate flex-1"
                            >
                                View contract PDF
                            </a>
                            <button
                                type="button"
                                onClick={handleRemoveDocument}
                                className="flex items-center gap-1.5 text-sm border border-danger text-danger bg-white px-3 py-1.5 rounded-md hover:bg-danger/5 transition"
                            >
                                <FaTrash className="text-xs" /> Remove
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-400 italic mb-2">
                            No document uploaded yet.
                        </p>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleUploadDocument}
                    />
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 flex items-center gap-1.5 text-sm border border-primary text-primary bg-white px-3 py-1.5 rounded-md hover:bg-primary/5 transition disabled:opacity-40"
                    >
                        <FaUpload className="text-xs" />
                        {uploading
                            ? "Uploading..."
                            : contract?.document_path
                              ? "Replace PDF"
                              : "Upload PDF"}
                    </button>
                    <p className="text-xs text-zinc-400 mt-1">
                        PDF only, max 10MB.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t mt-8 w-full">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-4 py-1.5 text-sm rounded-md border border-primary bg-white text-zinc-700 hover:bg-zinc-100 transition disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-1.5 text-sm rounded-md border border-transparent bg-primary text-white hover:bg-blue-900 transition disabled:opacity-40"
                            >
                                {saving ? "Saving..." : "Save"}
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

export default ContractTab;
