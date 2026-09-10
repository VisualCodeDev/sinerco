import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "@/Components/Modal";
import LoadingSpinner from "@/Components/Loading";
import TableComponent from "@/Components/TableComponent";
import { useToast } from "@/Components/Toast/ToastProvider";

const NEW_WORKSHOP_ID = "__new_workshop__";

const WorkshopsTab = () => {
    const { addToast } = useToast();

    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [edit, setEdit] = useState(false);
    const [edits, setEdits] = useState({});
    const [savingId, setSavingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchWorkshops = async () => {
        setLoading(true);
        try {
            const resp = await axios.get(route("workshop.get"));
            setWorkshops(resp.data || []);
        } catch (err) {
            console.error(err);
            addToast({ type: "error", text: "Failed to load workshops." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkshops();
    }, []);

    const editValue = (item, field) =>
        edits?.[item.workshop_id]?.[field] ?? item[field] ?? "";

    const handleFieldChange = (workshop_id, field, value) => {
        setEdits((prev) => ({
            ...prev,
            [workshop_id]: { ...(prev[workshop_id] || {}), [field]: value },
        }));
    };

    const handleAddRow = () => {
        if (workshops.some((w) => w.workshop_id === NEW_WORKSHOP_ID)) return;
        setEdit(true);
        setWorkshops((prev) => [
            { workshop_id: NEW_WORKSHOP_ID, name: "", units: [] },
            ...(prev || []),
        ]);
    };

    const handleCancelNewRow = () => {
        setWorkshops((prev) => prev.filter((w) => w.workshop_id !== NEW_WORKSHOP_ID));
        setEdits((prev) => {
            const next = { ...prev };
            delete next[NEW_WORKSHOP_ID];
            return next;
        });
    };

    const handleSaveRow = async (workshop_id) => {
        const rowEdits = edits[workshop_id];
        if (!rowEdits?.name?.trim()) return;
        setSavingId(workshop_id);
        try {
            if (workshop_id === NEW_WORKSHOP_ID) {
                const resp = await axios.post(route("workshop.store"), {
                    name: rowEdits.name.trim(),
                });
                addToast(resp?.data);
                setWorkshops((prev) =>
                    prev.map((w) =>
                        w.workshop_id === NEW_WORKSHOP_ID
                            ? { ...resp.data.data, units: [] }
                            : w,
                    ),
                );
            } else {
                const resp = await axios.put(
                    route("workshop.update", { workshop: workshop_id }),
                    { name: rowEdits.name.trim() },
                );
                addToast(resp?.data);
                setWorkshops((prev) =>
                    prev.map((w) =>
                        w.workshop_id === workshop_id
                            ? { ...w, name: rowEdits.name.trim() }
                            : w,
                    ),
                );
            }
            setEdits((prev) => {
                const next = { ...prev };
                delete next[workshop_id];
                return next;
            });
        } catch (err) {
            console.error(err);
            addToast({
                type: "error",
                text: err?.response?.data?.message || "Failed to save workshop.",
            });
        } finally {
            setSavingId(null);
        }
    };

    const handleDeleteWorkshop = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const resp = await axios.delete(
                route("workshop.destroy", { workshop: deleteTarget.workshop_id }),
            );
            addToast(resp?.data);
            setWorkshops((prev) =>
                prev.filter((w) => w.workshop_id !== deleteTarget.workshop_id),
            );
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
            addToast({
                type: "error",
                text: err?.response?.data?.message || "Failed to delete workshop.",
            });
        } finally {
            setDeleting(false);
        }
    };

    const isDraftRow = (item) => item.workshop_id === NEW_WORKSHOP_ID;

    const columns = [
        {
            name: "no",
            header: "No.",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            width: "5%",
            Cell: ({ index }) => index + 1,
        },
        {
            name: "name",
            header: "Workshop Name",
            headerClassName: "bg-primary text-white",
            sortable: true,
            Cell: (workshop) => {
                if (edit) {
                    return (
                        <input
                            type="text"
                            autoFocus={isDraftRow(workshop)}
                            className="w-full border border-gray-300 rounded-md px-2 py-1"
                            value={editValue(workshop, "name")}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                handleFieldChange(
                                    workshop.workshop_id,
                                    "name",
                                    e.target.value,
                                )
                            }
                        />
                    );
                }
                return workshop.name;
            },
        },
        {
            name: "unit_count",
            header: "Units",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            width: "12%",
            Cell: (workshop) =>
                isDraftRow(workshop) ? "-" : workshop.units?.length ?? 0,
        },
        {
            name: "save",
            header: "",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            width: "10%",
            Cell: (workshop) => {
                if (!edit || !edits[workshop.workshop_id]) return null;
                return (
                    <button
                        type="button"
                        className="bg-white text-primary border border-primary px-3 py-1 rounded-md text-sm disabled:opacity-40"
                        disabled={savingId === workshop.workshop_id}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSaveRow(workshop.workshop_id);
                        }}
                    >
                        Save
                    </button>
                );
            },
        },
        {
            name: "delete",
            header: "",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            width: "10%",
            Cell: (workshop) => {
                if (isDraftRow(workshop)) {
                    return (
                        <button
                            type="button"
                            className="border border-gray-300 bg-white text-gray-600 px-3 py-1.5 rounded-md text-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCancelNewRow();
                            }}
                        >
                            Cancel
                        </button>
                    );
                }
                return (
                    <button
                        type="button"
                        className="bg-danger text-white border border-danger px-3 py-1 rounded-md text-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(workshop);
                        }}
                    >
                        Delete
                    </button>
                );
            },
        },
    ];

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <TableComponent
                title="Workshops"
                data={workshops}
                columns={columns}
                edit={edit}
                toggleEdit={() => {
                    setEdit((prev) => !prev);
                    setEdits({});
                    handleCancelNewRow();
                }}
                secondaryAction={{
                    label: "Add Workshop",
                    onClick: handleAddRow,
                }}
            />

            <Modal
                showModal={!!deleteTarget}
                handleCloseModal={() => setDeleteTarget(null)}
                title="Delete Workshop"
                size="sm"
            >
                <Modal.Body>
                    <p>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{deleteTarget?.name}</span>?
                        {deleteTarget?.units?.length > 0 && (
                            <>
                                {" "}
                                Its {deleteTarget.units.length} unit(s) will be
                                unassigned, not deleted.
                            </>
                        )}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="border border-transparent bg-danger text-white px-4 py-2 rounded-md disabled:opacity-40"
                            disabled={deleting}
                            onClick={handleDeleteWorkshop}
                        >
                            Delete
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default WorkshopsTab;
