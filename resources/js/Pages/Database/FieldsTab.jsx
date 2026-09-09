import React, { useEffect, useState } from "react";
import axios from "axios";
import { getFields } from "@/Components/db";
import { useToast } from "@/Components/Toast/ToastProvider";
import Modal from "@/Components/Modal";
import LoadingSpinner from "@/Components/Loading";

const FieldsTab = () => {
    const { addToast } = useToast();
    const [fields, setFields] = useState(null);
    const [loading, setLoading] = useState(true);
    const [edit, setEdit] = useState(false);
    const [edits, setEdits] = useState({});
    const [expanded, setExpanded] = useState({});

    const [isAddModal, setIsAddModal] = useState(false);
    const [newField, setNewField] = useState({ name: "", slug: "" });

    const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'field'|'subfield', id, name }
    const [deleteError, setDeleteError] = useState("");

    const [subfieldForms, setSubfieldForms] = useState({}); // field_id -> { name }
    const [subfieldEdits, setSubfieldEdits] = useState({}); // subfield_id -> name

    const loadFields = async () => {
        setLoading(true);
        const data = await getFields();
        setFields(data || []);
        setLoading(false);
    };

    useEffect(() => {
        loadFields();
    }, []);

    const toggleExpand = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFieldNameChange = (id, value) => {
        setEdits((prev) => ({ ...prev, [id]: value }));
    };

    const handleSaveField = async (field) => {
        const newName = edits[field.id];
        if (newName === undefined || newName === field.name) {
            setEdits((prev) => {
                const next = { ...prev };
                delete next[field.id];
                return next;
            });
            return;
        }
        try {
            const resp = await axios.post(route("field.update", field.id), {
                name: newName,
            });
            addToast(resp?.data);
            setFields((prev) =>
                prev.map((f) =>
                    f.id === field.id ? { ...f, name: newName } : f,
                ),
            );
            setEdits((prev) => {
                const next = { ...prev };
                delete next[field.id];
                return next;
            });
        } catch (e) {
            console.error(e);
            addToast({
                type: "error",
                text: e?.response?.data?.text || "Failed to update field.",
            });
        }
    };

    const handleAddField = async () => {
        if (!newField.name.trim()) return;
        try {
            const resp = await axios.post(route("field.add"), newField);
            addToast(resp?.data);
            const created = resp?.data?.data;
            setFields((prev) => [...(prev || []), created]);
            setNewField({ name: "", slug: "" });
            setIsAddModal(false);
        } catch (e) {
            console.error(e);
            addToast({
                type: "error",
                text: e?.response?.data?.text || "Failed to add field.",
            });
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleteError("");
        try {
            if (deleteTarget.type === "field") {
                const resp = await axios.post(
                    route("field.delete", deleteTarget.id),
                );
                addToast(resp?.data);
                setFields((prev) =>
                    prev.filter((f) => f.id !== deleteTarget.id),
                );
            } else {
                const resp = await axios.post(
                    route("subfield.delete", deleteTarget.id),
                );
                addToast(resp?.data);
                setFields((prev) =>
                    prev.map((f) =>
                        f.id === deleteTarget.fieldId
                            ? {
                                  ...f,
                                  subfields: f.subfields.filter(
                                      (s) => s.id !== deleteTarget.id,
                                  ),
                              }
                            : f,
                    ),
                );
            }
            setDeleteTarget(null);
        } catch (e) {
            console.error(e);
            setDeleteError(
                e?.response?.data?.text ||
                    "Failed to delete. It may still be in use.",
            );
        }
    };

    const handleAddSubfield = async (field) => {
        const name = subfieldForms[field.id]?.name?.trim();
        if (!name) return;
        try {
            const resp = await axios.post(
                route("subfield.add", field.id),
                { name },
            );
            addToast(resp?.data);
            const created = resp?.data?.data;
            setFields((prev) =>
                prev.map((f) =>
                    f.id === field.id
                        ? { ...f, subfields: [...(f.subfields || []), created] }
                        : f,
                ),
            );
            setSubfieldForms((prev) => ({ ...prev, [field.id]: { name: "" } }));
        } catch (e) {
            console.error(e);
            addToast({
                type: "error",
                text: e?.response?.data?.text || "Failed to add subfield.",
            });
        }
    };

    const handleSaveSubfield = async (field, subfield) => {
        const newName = subfieldEdits[subfield.id];
        if (newName === undefined || newName === subfield.name) {
            setSubfieldEdits((prev) => {
                const next = { ...prev };
                delete next[subfield.id];
                return next;
            });
            return;
        }
        try {
            const resp = await axios.post(
                route("subfield.update", subfield.id),
                { name: newName },
            );
            addToast(resp?.data);
            setFields((prev) =>
                prev.map((f) =>
                    f.id === field.id
                        ? {
                              ...f,
                              subfields: f.subfields.map((s) =>
                                  s.id === subfield.id
                                      ? { ...s, name: newName }
                                      : s,
                              ),
                          }
                        : f,
                ),
            );
            setSubfieldEdits((prev) => {
                const next = { ...prev };
                delete next[subfield.id];
                return next;
            });
        } catch (e) {
            console.error(e);
            addToast({
                type: "error",
                text: e?.response?.data?.text || "Failed to update subfield.",
            });
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-white rounded-lg border shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                    Daily Report Fields
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddModal(true)}
                        className="border border-primary bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                        Add Field
                    </button>
                    <button
                        onClick={() => setEdit((prev) => !prev)}
                        className={`border px-4 py-2 rounded-lg text-sm transition ${
                            edit
                                ? "bg-gray-100 border-gray-300 text-gray-700"
                                : "bg-primary border-primary text-white hover:bg-blue-700"
                        }`}
                    >
                        {edit ? "Done" : "Edit"}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full table-auto border-collapse [&_th]:border [&_th]:border-[#3a56b0] [&_td]:border [&_td]:border-gray-200">
                    <thead className="bg-[#243F96] text-white">
                        <tr>
                            <th className="w-10 px-3 py-3"></th>
                            <th className="text-left px-4 py-3 font-semibold">
                                Name
                            </th>
                            <th className="text-left px-4 py-3 font-semibold">
                                Slug
                            </th>
                            <th className="text-left px-4 py-3 font-semibold w-40">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {(fields || []).map((field) => {
                            const hasSubfields =
                                (field.subfields || []).length > 0;
                            const isExpanded = expanded[field.id];
                            return (
                                <React.Fragment key={field.id}>
                                    <tr className="bg-[#F9FAFB] hover:bg-[#F3F4F6]">
                                        <td className="px-3 py-2 text-center">
                                            {hasSubfields && (
                                                <button
                                                    onClick={() =>
                                                        toggleExpand(field.id)
                                                    }
                                                    className="border border-gray-300 bg-white rounded px-2 py-1 text-xs"
                                                >
                                                    {isExpanded ? "-" : "+"}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            {edit ? (
                                                <input
                                                    type="text"
                                                    value={
                                                        edits[field.id] ??
                                                        field.name
                                                    }
                                                    onChange={(e) =>
                                                        handleFieldNameChange(
                                                            field.id,
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                field.name
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-gray-400">
                                            <input
                                                type="text"
                                                value={field.slug}
                                                disabled
                                                className="border border-gray-200 bg-gray-100 rounded px-2 py-1 w-full text-gray-400 cursor-not-allowed"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex gap-2">
                                                {edit &&
                                                    edits[field.id] !==
                                                        undefined &&
                                                    edits[field.id] !==
                                                        field.name && (
                                                        <button
                                                            onClick={() =>
                                                                handleSaveField(
                                                                    field,
                                                                )
                                                            }
                                                            className="border border-green-700 bg-green-600 text-white px-2 py-1 rounded text-xs"
                                                        >
                                                            Save
                                                        </button>
                                                    )}
                                                {edit && (
                                                    <button
                                                        onClick={() =>
                                                            setDeleteTarget({
                                                                type: "field",
                                                                id: field.id,
                                                                name: field.name,
                                                            })
                                                        }
                                                        className="border border-red-700 bg-danger text-white px-2 py-1 rounded text-xs"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr>
                                            <td></td>
                                            <td colSpan={3} className="px-4 py-3 bg-white">
                                                <table className="w-full table-auto border-collapse [&_th]:border [&_th]:border-gray-300 [&_td]:border [&_td]:border-gray-200">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="text-left px-3 py-2 text-xs font-semibold">
                                                                Subfield Name
                                                            </th>
                                                            <th className="text-left px-3 py-2 text-xs font-semibold">
                                                                Slug
                                                            </th>
                                                            <th className="text-left px-3 py-2 text-xs font-semibold w-40">
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(field.subfields || []).map(
                                                            (sub) => (
                                                                <tr key={sub.id}>
                                                                    <td className="px-3 py-2 text-sm">
                                                                        {edit ? (
                                                                            <input
                                                                                type="text"
                                                                                value={
                                                                                    subfieldEdits[
                                                                                        sub.id
                                                                                    ] ??
                                                                                    sub.name
                                                                                }
                                                                                onChange={(e) =>
                                                                                    setSubfieldEdits(
                                                                                        (prev) => ({
                                                                                            ...prev,
                                                                                            [sub.id]:
                                                                                                e.target
                                                                                                    .value,
                                                                                        }),
                                                                                    )
                                                                                }
                                                                                className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                                                                            />
                                                                        ) : (
                                                                            sub.name
                                                                        )}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-sm text-gray-400">
                                                                        {sub.slug}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        <div className="flex gap-2">
                                                                            {edit &&
                                                                                subfieldEdits[
                                                                                    sub.id
                                                                                ] !==
                                                                                    undefined &&
                                                                                subfieldEdits[
                                                                                    sub.id
                                                                                ] !==
                                                                                    sub.name && (
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleSaveSubfield(
                                                                                                field,
                                                                                                sub,
                                                                                            )
                                                                                        }
                                                                                        className="border border-green-700 bg-green-600 text-white px-2 py-1 rounded text-xs"
                                                                                    >
                                                                                        Save
                                                                                    </button>
                                                                                )}
                                                                            {edit && (
                                                                                <button
                                                                                    onClick={() =>
                                                                                        setDeleteTarget({
                                                                                            type: "subfield",
                                                                                            id: sub.id,
                                                                                            fieldId: field.id,
                                                                                            name: sub.name,
                                                                                        })
                                                                                    }
                                                                                    className="border border-red-700 bg-danger text-white px-2 py-1 rounded text-xs"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )}
                                                        {edit && (
                                                            <tr>
                                                                <td className="px-3 py-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="New subfield name"
                                                                        value={
                                                                            subfieldForms[
                                                                                field.id
                                                                            ]?.name || ""
                                                                        }
                                                                        onChange={(e) =>
                                                                            setSubfieldForms(
                                                                                (prev) => ({
                                                                                    ...prev,
                                                                                    [field.id]: {
                                                                                        name: e
                                                                                            .target
                                                                                            .value,
                                                                                    },
                                                                                }),
                                                                            )
                                                                        }
                                                                        className="border border-gray-300 rounded px-2 py-1 w-full text-sm"
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-2 text-xs text-gray-400">
                                                                    auto-generated
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleAddSubfield(
                                                                                field,
                                                                            )
                                                                        }
                                                                        className="border border-primary bg-primary text-white px-2 py-1 rounded text-xs"
                                                                    >
                                                                        Add
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        {(!fields || fields.length === 0) && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-8 text-center text-gray-400"
                                >
                                    No fields yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add field modal */}
            <Modal
                showModal={isAddModal}
                handleCloseModal={() => setIsAddModal(false)}
                title="Add Field"
                size="sm"
            >
                <Modal.Body>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={newField.name}
                                onChange={(e) =>
                                    setNewField((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Slug (optional, auto-generated from name)
                            </label>
                            <input
                                type="text"
                                value={newField.slug}
                                onChange={(e) =>
                                    setNewField((prev) => ({
                                        ...prev,
                                        slug: e.target.value,
                                    }))
                                }
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex justify-end">
                        <button
                            onClick={handleAddField}
                            className="border border-white bg-white/10 text-white px-4 py-2 rounded"
                        >
                            Save
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Delete confirmation modal */}
            <Modal
                showModal={!!deleteTarget}
                handleCloseModal={() => {
                    setDeleteTarget(null);
                    setDeleteError("");
                }}
                title="Confirm Delete"
                size="sm"
            >
                <Modal.Body>
                    <p>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">
                            {deleteTarget?.name}
                        </span>
                        ?
                    </p>
                    {deleteError && (
                        <p className="text-danger text-sm mt-2">
                            {deleteError}
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                setDeleteTarget(null);
                                setDeleteError("");
                            }}
                            className="border border-white bg-white/10 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="border border-red-700 bg-danger text-white px-4 py-2 rounded"
                        >
                            Delete
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FieldsTab;
