import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "@/Components/Modal";
import LoadingSpinner from "@/Components/Loading";
import TableComponent from "@/Components/TableComponent";
import { useToast } from "@/Components/Toast/ToastProvider";

// Fields that can be edited inline on the Clients table. These are all plain
// columns on the `clients` table itself (see app/Models/Client.php $fillable),
// so they belong here -- NOT in Input Settings, which is for the separate
// per-client `daily_report_settings` (decimal/min-max/unit/performance rules).
const EDITABLE_FIELDS = [
    { name: "name", header: "Name", width: "22%" },
    { name: "gmt_offset", header: "Timezone (GMT)", width: "12%" },
    { name: "input_interval", header: "Input Interval (hrs)", width: "13%" },
    { name: "input_duration", header: "Input Duration (mins)", width: "13%" },
];

const SUMMARY_INTERVAL_OPTIONS = ["1h", "4h", "6h", "12h", "1d"];

const ClientsTab = () => {
    const { addToast } = useToast();

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [edit, setEdit] = useState(false);
    const [edits, setEdits] = useState({});
    const [savingId, setSavingId] = useState(null);

    const [isAddModal, setAddModal] = useState(false);
    const [newClientName, setNewClientName] = useState("");
    const [adding, setAdding] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const resp = await axios.get(route("client.get"));
            setClients(resp.data || []);
        } catch (err) {
            console.error(err);
            addToast({ type: "error", text: "Failed to load clients." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const editValue = (client, field) =>
        edits?.[client.client_id]?.[field] ?? client[field] ?? "";

    const handleFieldChange = (client_id, field, value) => {
        setEdits((prev) => ({
            ...prev,
            [client_id]: { ...(prev[client_id] || {}), [field]: value },
        }));
    };

    const handleSaveRow = async (client_id) => {
        const rowEdits = edits[client_id];
        if (!rowEdits) return;
        setSavingId(client_id);
        try {
            await axios.post(route("client.update"), {
                client_id,
                updateData: [rowEdits],
            });
            addToast({ type: "success", text: "Client updated." });
            setClients((prev) =>
                prev.map((item) =>
                    item.client_id === client_id
                        ? { ...item, ...rowEdits }
                        : item,
                ),
            );
            setEdits((prev) => {
                const next = { ...prev };
                delete next[client_id];
                return next;
            });
        } catch (err) {
            console.error(err);
            addToast({
                type: "error",
                text: err?.response?.data?.message || "Failed to update client.",
            });
        } finally {
            setSavingId(null);
        }
    };

    const handleAddClient = async () => {
        if (!newClientName.trim()) return;
        setAdding(true);
        try {
            const resp = await axios.post(route("client.store"), {
                name: newClientName.trim(),
            });
            addToast(resp?.data);
            if (resp?.data?.data) {
                setClients((prev) => [...prev, resp.data.data]);
            } else {
                fetchClients();
            }
            setNewClientName("");
            setAddModal(false);
        } catch (err) {
            console.error(err);
            addToast({
                type: "error",
                text: err?.response?.data?.message || "Failed to add client.",
            });
        } finally {
            setAdding(false);
        }
    };

    const handleToggleDisableDuration = async (client) => {
        try {
            const resp = await axios.post(route("duration.update.disable"), {
                client_id: client.client_id,
            });
            addToast(resp?.data);
            setClients((prev) =>
                prev.map((item) =>
                    item.client_id === client.client_id
                        ? { ...item, disable_duration: !item.disable_duration }
                        : item,
                ),
            );
        } catch (err) {
            console.error(err);
            addToast({
                type: "error",
                text:
                    err?.response?.data?.message ||
                    "Failed to update duration toggle.",
            });
        }
    };

    const handleDeleteClient = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const resp = await axios.post(route("client.delete"), {
                client_id: deleteTarget.client_id,
            });
            addToast(resp?.data);
            setClients((prev) =>
                prev.filter((item) => item.client_id !== deleteTarget.client_id),
            );
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
            addToast({
                type: "error",
                text: err?.response?.data?.message || "Failed to delete client.",
            });
        } finally {
            setDeleting(false);
        }
    };

    // Sama pola dengan resources/js/Components/utils/DataUnit/columns.jsx yang
    // dipakai UnitTable -- kolom biasa saat `edit` mati, jadi <input>+Save saat aktif.
    const columns = [
        {
            name: "no",
            header: "No.",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            width: "3%",
            Cell: ({ index }) => index + 1,
        },
        ...EDITABLE_FIELDS.map((field) => ({
            name: field.name,
            header: field.header,
            headerClassName: "bg-primary text-white",
            width: field.width,
            Cell: (client) => {
                if (edit) {
                    return (
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-2 py-1"
                            value={editValue(client, field.name)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                handleFieldChange(
                                    client.client_id,
                                    field.name,
                                    e.target.value,
                                )
                            }
                        />
                    );
                }
                return client[field.name] ?? "";
            },
        })),
        {
            name: "auto_send_interval",
            header: "Summary Interval",
            headerClassName: "bg-primary text-white",
            width: "12%",
            Cell: (client) => {
                if (edit) {
                    return (
                        <select
                            className="w-full border border-gray-300 rounded-md px-2 py-1 bg-white"
                            value={editValue(client, "auto_send_interval")}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                handleFieldChange(
                                    client.client_id,
                                    "auto_send_interval",
                                    e.target.value,
                                )
                            }
                        >
                            {SUMMARY_INTERVAL_OPTIONS.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    );
                }
                return client.auto_send_interval ?? "";
            },
        },
        {
            name: "disable_duration",
            header: "Duration Status",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            width: "10%",
            Cell: (client) => (
                <button
                    type="button"
                    className={`${
                        client.disable_duration ? "bg-red-500" : "bg-green-500"
                    } border border-transparent text-white rounded-md px-2 py-1 text-sm`}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDisableDuration(client);
                    }}
                >
                    {client.disable_duration ? "Disabled" : "Enabled"}
                </button>
            ),
        },
        {
            name: "save",
            header: "",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            width: "8%",
            Cell: (client) => {
                if (!edit || !edits[client.client_id]) return null;
                return (
                    <button
                        type="button"
                        className="bg-white text-primary border border-primary px-3 py-1 rounded-md text-sm disabled:opacity-40"
                        disabled={savingId === client.client_id}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSaveRow(client.client_id);
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
            width: "8%",
            Cell: (client) => (
                <button
                    type="button"
                    className="bg-danger text-white border border-danger px-3 py-1 rounded-md text-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(client);
                    }}
                >
                    Delete
                </button>
            ),
        },
    ];

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <TableComponent
                title="Clients"
                data={clients}
                columns={columns}
                edit={edit}
                toggleEdit={() => {
                    setEdit((prev) => !prev);
                    setEdits({});
                }}
                secondaryAction={{
                    label: "Add Client",
                    onClick: () => setAddModal(true),
                }}
            />

            {/* Add Client modal */}
            <Modal
                showModal={isAddModal}
                handleCloseModal={() => setAddModal(false)}
                title="Add Client"
                size="sm"
            >
                <Modal.Body>
                    <label className="form-label" htmlFor="new-client-name">
                        Client name
                    </label>
                    <input
                        id="new-client-name"
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-2 py-1"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder="Client name"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="border border-transparent bg-primary text-white px-4 py-2 rounded-md disabled:opacity-40 disabled:pointer-events-none"
                            disabled={!newClientName.trim() || adding}
                            onClick={handleAddClient}
                        >
                            Add
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Delete confirmation modal */}
            <Modal
                showModal={!!deleteTarget}
                handleCloseModal={() => setDeleteTarget(null)}
                title="Delete Client"
                size="sm"
            >
                <Modal.Body>
                    <p>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">
                            {deleteTarget?.name}
                        </span>
                        ? This action cannot be undone.
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
                            className="border border-transparent bg-danger text-white px-4 py-2 rounded-md disabled:opacity-40 disabled:pointer-events-none"
                            disabled={deleting}
                            onClick={handleDeleteClient}
                        >
                            Delete
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ClientsTab;
