import { deleteClient, getFields, updateClientData } from "@/Components/db";
import LoadingSpinner from "@/Components/Loading";
import Modal from "@/Components/Modal";
import TableComponent from "@/Components/TableComponent";
import { useToast } from "@/Components/Toast/ToastProvider";
import {
    formItems,
    getRequestTypeName,
} from "@/Components/utils/dashboard-util";
import { fetch } from "@/Components/utils/database-util";
import tColumns from "@/Components/utils/User/columns";
import PageLayout from "@/Layouts/PageLayout";
import { router } from "@inertiajs/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    FaAngleDown,
    FaCog,
    FaFileContract,
    FaList,
    FaUserFriends,
} from "react-icons/fa";
import InputValidationSetting from "../Unit/InputValidationSetting";
import columns from "@/Components/utils/Client/columns";

const ClientList = () => {
    // const columns = tColumns();
    const { data: initData, loading, error } = fetch("client.get");
    const [data, setData] = useState(initData);
    const [expanded, setExpanded] = useState(false);
    const [selectedClient, setSelectedClients] = useState(null);
    const [filteredArea, setArea] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState();
    const [isLoading, setLoading] = useState(false);
    // const dailyReportSettingData = unitData?.daily_report_setting || {};
    const [isSettingModal, setSettingModal] = useState(false);
    const [isDeleteModal, setDeleteModal] = useState(false);
    const [actionClient, setActionClient] = useState(null);
    const { addToast } = useToast();

    // Inline edit -- sama pola dengan UnitTable.jsx: toggle Edit membuat sel jadi
    // <input>/<select>, tombol Save per baris muncul untuk commit perubahan baris itu saja.
    const [edit, setEdit] = useState(false);
    const [edits, setEdits] = useState({});
    // Region/Area/Location buat dropdown cascading -- di-fetch pas Edit diaktifkan
    // (sama seperti lookups di UnitTable.jsx), bukan langsung di awal biar hemat.
    const [lookups, setLookups] = useState({ regions: [] });
    // Client tidak punya 1 area/location sendiri (lihat comment di
    // ClientController::updateClientLocation) -- edit Region/Area/Location di sini
    // BENERAN memindahkan semua unit client itu ke lokasi baru. Karena efeknya bulk
    // & langsung, minta konfirmasi dulu sebelum benar-benar disimpan.
    const [moveConfirm, setMoveConfirm] = useState(null); // { client, rowEdits, regionName, locationName }
    const [moving, setMoving] = useState(false);

    // Sentinel id buat baris draft "Add Client" -- sama pola dengan handleAddRow di
    // UnitTable.jsx: klik "Add Client" nyisipin baris kosong yang bisa diisi langsung
    // di tabel, bukan buka modal terpisah.
    const NEW_CLIENT_ID = "__new_client__";

    const handleAddRow = () => {
        if (data.some((item) => item.client_id === NEW_CLIENT_ID)) return;
        setEdit(true);
        setData((prev) => [
            {
                client_id: NEW_CLIENT_ID,
                name: "",
                is_invoice: false,
                disable_duration: false,
                regions: "",
                areas: "",
                locations: "",
                unit_count: 0,
            },
            ...(prev || []),
        ]);
    };

    const handleCancelNewRow = () => {
        setData((prev) =>
            (prev || []).filter((item) => item.client_id !== NEW_CLIENT_ID),
        );
        clearRowEdits(NEW_CLIENT_ID);
    };

    const handleCreateRow = async () => {
        const rowEdits = edits[NEW_CLIENT_ID] || {};
        if (!rowEdits.name?.trim()) {
            addToast({ type: "error", text: "Client name is required." });
            return;
        }
        try {
            const resp = await axios.post(route("client.store"), {
                name: rowEdits.name.trim(),
            });
            addToast(resp?.data);
            handleCancelNewRow();
            const fresh = await axios.get(route("client.get"));
            setData(fresh.data || []);
        } catch (err) {
            console.error(err);
            addToast({
                type: "error",
                text: err?.response?.data?.message || "Failed to add client.",
            });
        }
    };

    useEffect(() => {
        if (!edit || lookups.regions.length > 0) return;
        const fetchLookups = async () => {
            try {
                const resp = await axios.get(route("regions.get"));
                setLookups({ regions: resp.data || [] });
            } catch (e) {
                console.error(e);
            }
        };
        fetchLookups();
    }, [edit]);

    const handleFieldChange = (client_id, field, value) => {
        setEdits((prev) => {
            const current = { ...(prev[client_id] || {}) };
            current[field] = value;
            // Reset pilihan di bawahnya kalau region/area diganti, sama seperti
            // cascading select Region -> Area -> Location di UnitTable.jsx.
            if (field === "region_id") {
                current.area_id = "";
                current.location_id = "";
            } else if (field === "area_id") {
                current.location_id = "";
            }
            return { ...prev, [client_id]: current };
        });
    };

    const clearRowEdits = (client_id) => {
        setEdits((prev) => {
            const next = { ...prev };
            delete next[client_id];
            return next;
        });
    };

    const handleSaveRow = async (client_id) => {
        if (client_id === NEW_CLIENT_ID) {
            return handleCreateRow();
        }

        const rowEdits = edits[client_id];
        if (!rowEdits) return;

        const isMovingLocation =
            "region_id" in rowEdits || "location_id" in rowEdits;
        const { area_id, ...fieldsToSave } = rowEdits; // area_id cuma bantu filter dropdown, bukan field asli

        if (isMovingLocation) {
            const client = data.find((item) => item.client_id === client_id);
            const regionName =
                lookups.regions.find(
                    (r) => String(r.id) === String(rowEdits.region_id),
                )?.name || "-";
            const locationName =
                lookups.regions
                    .find((r) => String(r.id) === String(rowEdits.region_id))
                    ?.areas?.find(
                        (a) => String(a.id) === String(rowEdits.area_id),
                    )
                    ?.locations?.find(
                        (l) => String(l.id) === String(rowEdits.location_id),
                    )?.location || "-";
            setMoveConfirm({
                client,
                rowEdits: fieldsToSave,
                regionName,
                locationName,
            });
            return;
        }

        await saveClientFields(client_id, fieldsToSave);
    };

    const saveClientFields = async (client_id, fieldsToSave) => {
        try {
            const resp = await updateClientData(client_id, [fieldsToSave]);
            if (resp?.response === "success") {
                setData((prev) =>
                    prev.map((item) =>
                        item.client_id === client_id
                            ? { ...item, ...fieldsToSave }
                            : item,
                    ),
                );
                addToast({ type: "success", text: "Client updated" });
                clearRowEdits(client_id);
            } else {
                addToast({ type: "error", text: "Failed to update client" });
            }
        } catch (err) {
            console.error(err);
            addToast({ type: "error", text: "Failed to update client" });
        }
    };

    const handleConfirmMove = async () => {
        if (!moveConfirm) return;
        setMoving(true);
        try {
            const resp = await axios.post(route("client.update.location"), {
                client_id: moveConfirm.client.client_id,
                region_id: moveConfirm.rowEdits.region_id || null,
                location_id: moveConfirm.rowEdits.location_id || null,
            });
            addToast(resp?.data);
            // Region/Area/Location cuma diringkas balik ke label "areas"/"locations"
            // di tabel -- refetch lebih akurat daripada nebak ulang string gabungannya.
            const fresh = await axios.get(route("client.get"));
            setData(fresh.data || []);
            clearRowEdits(moveConfirm.client.client_id);
            setMoveConfirm(null);
        } catch (err) {
            console.error(err);
            addToast({
                type: "error",
                text:
                    err?.response?.data?.message ||
                    "Failed to move units to the new location.",
            });
        } finally {
            setMoving(false);
        }
    };

    useEffect(() => {
        setData(initData);
    }, [initData]);

    if (loading) {
        return <LoadingSpinner />;
    }
    const handleToggleInvoice = async (id, is_invoice) => {
        if (!id) return;
        try {
            const updateData = [{ is_invoice: !is_invoice }];
            console.log(updateData);
            const resp = await updateClientData(id, updateData);
            if (resp.response === "success") {
                const newTabData = data.map((item) =>
                    item?.client_id === id
                        ? {
                              ...item,
                              is_invoice: !is_invoice,
                          }
                        : item,
                );
                setData(newTabData);
                addToast({
                    type: "success",
                    text: "Data Updated",
                });
            }
        } catch (err) {
            addToast({
                type: "error",
                text: err?.response?.data?.message || "Error updating data",
            });
        }
    };
    const handleClick = (item) => {
        if (!item.unitAreaLocationId) return;
        router.visit(route("daily", item.unitAreaLocationId));
    };

    const handleExpandArea = (item) => {
        setArea((prevAreas) =>
            prevAreas.map((area) =>
                area.id === item.id
                    ? { ...area, isExpanded: !area.isExpanded }
                    : area,
            ),
        );
    };

    const handleOpenSetting = (value) => {
        setSelectedClients(value);
        setSettingModal(true);
    };

    const handleOpenDelete = (value) => {
        setActionClient(value);
        setDeleteModal(true);
    };

    const handleClientDeleted = (client_id) => {
        setData((prev) => prev.filter((item) => item.client_id !== client_id));
    };

    const col = columns({
        isEdit: edit,
        edits,
        lookups,
        newRowId: NEW_CLIENT_ID,
        handleCancelNewRow,
        handleOpenSetting,
        handleToggleInvoice,
        handleFieldChange,
        handleSaveRow,
        handleOpenDelete,
    });

    return (
        <PageLayout>
            {/* {Array.isArray(selectedRows) && selectedRows.length > 0 && (
                <div className="fixed bottom-0 left-0 w-[100%] p-6 z-[100]">
                    <div className="bg-primary rounded-xl p-2">
                        <button>Invoice</button>
                    </div>
                </div>
            )} */}
            <TableComponent
                title="Clients"
                columns={col}
                data={data}
                edit={edit}
                toggleEdit={() => {
                    setEdit((prev) => {
                        if (prev) handleCancelNewRow();
                        return !prev;
                    });
                    setEdits({});
                }}
                addNewItem={true}
                newItemPlaceholder="Add Client"
                handleNew={handleAddRow}
            />

            {isSettingModal && (
                <SettingModal
                    // data={data?.filter()}
                    clientData={selectedClient}
                    handleCloseModal={() => setSettingModal(false)}
                    // handleConfirmSettings={handleConfirmSettings}
                />
            )}
            <DeleteClientModal
                isModal={isDeleteModal}
                handleCloseModal={() => setDeleteModal(false)}
                client={actionClient}
                addToast={addToast}
                onDeleted={handleClientDeleted}
            />
            <Modal
                showModal={!!moveConfirm}
                handleCloseModal={() => setMoveConfirm(null)}
                title="Move Units to New Location"
                size="sm"
            >
                <Modal.Body>
                    <p>
                        This will move{" "}
                        <span className="font-semibold">
                            {moveConfirm?.client?.unit_count ?? 0} unit(s)
                        </span>{" "}
                        currently under{" "}
                        <span className="font-semibold">
                            {moveConfirm?.client?.name}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold">
                            {moveConfirm?.regionName} /{" "}
                            {moveConfirm?.locationName}
                        </span>
                        . This changes where those units report to, are you
                        sure?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md"
                            onClick={() => setMoveConfirm(null)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="border border-transparent bg-primary text-white px-4 py-2 rounded-md disabled:opacity-40 disabled:pointer-events-none"
                            disabled={moving}
                            onClick={handleConfirmMove}
                        >
                            Yes, Move Units
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </PageLayout>
    );
};

const DeleteClientModal = ({
    isModal,
    handleCloseModal,
    client,
    addToast,
    onDeleted,
}) => {
    const [confirmText, setConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setConfirmText("");
    }, [client, isModal]);

    const isConfirmed = confirmText === client?.name;

    const handleDelete = async () => {
        if (!isConfirmed) return;
        setDeleting(true);
        try {
            const resp = await deleteClient(client?.client_id);
            if (resp?.type === "success") {
                onDeleted(client?.client_id);
                addToast(resp);
                handleCloseModal();
            } else {
                addToast({
                    type: "error",
                    text: resp?.text || "Failed to delete client",
                });
            }
        } catch (err) {
            console.error(err);
            addToast({ type: "error", text: "Failed to delete client" });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Modal
            showModal={isModal}
            handleCloseModal={handleCloseModal}
            title="Delete Client"
            size="sm"
        >
            <Modal.Body>
                <p className="mb-3">
                    This will remove{" "}
                    <span className="font-semibold">{client?.name}</span> from
                    every list. Type the client name below to confirm.
                </p>
                <label className="form-label" htmlFor="client-delete-confirm">
                    Confirm client name
                </label>
                <input
                    id="client-delete-confirm"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={client?.name}
                    className="input-base"
                />
            </Modal.Body>
            <Modal.Footer>
                <div className="flex justify-end">
                    <button
                        className="border border-transparent bg-danger text-white px-4 py-2 rounded-md disabled:opacity-40 disabled:pointer-events-none"
                        disabled={!isConfirmed || deleting}
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

const SettingModal = (props) => {
    const { clientData, handleCloseModal } = props;
    const [loading, setLoading] = useState({});
    const [settingData, setSettingData] = useState({});
    const [saving, setSaving] = useState(false);
    const [fields, setFields] = useState([]);

    useEffect(() => {
        if (!clientData?.client_id) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const resp = await axios.get(
                    route("unit.setting.get", clientData?.client_id),
                );
                setSettingData(resp.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clientData]);

    useEffect(() => {
        const fetchFields = async () => {
            const data = await getFields();
            setFields(data);
        };
        fetchFields();
    }, []);

    return (
        <Modal
            showModal
            handleCloseModal={handleCloseModal}
            title={clientData?.name}
            size="xl"
        >
            <Modal.Body>
                {loading && <LoadingSpinner />}
                <InputValidationSetting
                    data={settingData}
                    clientData={clientData}
                    selectedClients={[clientData?.client_id]}
                />
            </Modal.Body>
        </Modal>
    );
};

export default ClientList;
