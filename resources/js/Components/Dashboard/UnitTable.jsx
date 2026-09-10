import React, { useEffect, useState } from "react";
import tColumns from "../utils/DataUnit/columns";
import {
    FaSort,
    FaSortDown,
    FaSortUp,
    FaPlus,
    FaSearch,
    FaRegBuilding,
    FaEye,
    FaEyeSlash,
    FaAsterisk,
    FaCube,
    FaPercent,
} from "react-icons/fa";
import { Button } from "@headlessui/react";
import TableComponent from "../TableComponent";
import { router } from "@inertiajs/react";
import LoadingSpinner from "../Loading";
import { useAuth } from "../Auth/auth";
import Modal from "../Modal";
import InputValidationSetting from "@/Pages/Unit/InputValidationSetting";
import { formItems } from "../utils/dashboard-util";
import { getFields } from "../db";
import axios from "axios";
import { useToast } from "../Toast/ToastProvider";

const UnitTable = (props) => {
    const { data: propsData, pagination } = props;
    const data = propsData;

    const handlePageChange = (url) => {
        if (!url) return;
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };
    const [unitData, setUnitData] = useState(data);
    const [formData, setFormData] = useState({
        selectedRows: [],
        data: unitData,
        selectedUnitPositions: [],
    });

    // Resync local copy whenever the page's data changes (e.g. navigating
    // between pagination pages), since `unitData` is otherwise only ever
    // set once on mount and locally after settings edits.
    useEffect(() => {
        setUnitData(data);
    }, [data]);

    // Standalone mode (no `data` prop, e.g. used as a tab with no Inertia page
    // props): fetch the permitted unit list ourselves and feed it into the
    // same `unitData` state the props-driven path uses, so every other effect
    // and the actual table render (which reads `formData.data`, built from
    // `unitData`) picks it up the same way.
    const [selfFetchLoading, setSelfFetchLoading] = useState(!propsData);
    const [selfFetchError, setSelfFetchError] = useState(null);
    useEffect(() => {
        if (propsData) return;
        let ignore = false;
        (async () => {
            try {
                const resp = await axios.get(route("unit.get"));
                if (!ignore) setUnitData(resp.data || []);
            } catch (err) {
                if (!ignore) setSelfFetchError(err);
            } finally {
                if (!ignore) setSelfFetchLoading(false);
            }
        })();
        return () => {
            ignore = true;
        };
        // Only ever run once on mount for the standalone path.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [thresholdSetting, setThresholdSetting] = useState(null);
    const [visibilitySetting, setVisibilitySetting] = useState(null);
    const [curvePercentage, setCurvePercentage] = useState(null);
    const { user } = useAuth();
    const [isSettingModal, setIsSettingModal] = useState(false);
    const [isExportModal, setExportModal] = useState(false);
    // `edit` makes each row's cells inline-editable (Region/Client/Area/Location
    // dropdowns, Name/S/N text inputs). `bulkEdit` is the separate checkbox
    // multi-select mode for bulk Threshold/Visibility settings & Export BA.
    const [edit, setEdit] = useState(false);
    const [bulkEdit, setBulkEdit] = useState(false);
    const [lookups, setLookups] = useState({ regions: [], clients: [] });
    const [historyUnit, setHistoryUnit] = useState(null);
    const { addToast } = useToast();

    const formatRows = (rows) =>
        (rows || []).map((item) => ({
            ...item,
            // In edit/bulk mode rows must be selectable, not links — TableComponent
            // renders an <a href> wrapper whenever `url` is set, which would
            // navigate away on click regardless of the row's onClick handler.
            url: edit || bulkEdit ? undefined : route("daily", item.unit),
        }));

    useEffect(() => {
        // Build from `unitData` (not `data`/`propsData`), since `unitData` is what
        // actually gets updated -- by our self-fetch below in standalone mode, and
        // by handleSaveRow's local merge after an inline edit is saved.
        setFormData((prev) => ({ ...prev, data: formatRows(unitData) }));
    }, [unitData, edit, bulkEdit]);

    // The page prop is only the current server-paginated slice, so a plain
    // client-side search over it would miss every unit on another page. Once
    // the user actually searches, fetch the full permitted unit list once and
    // search across that instead — see searchQuery usage below.
    const [searchQuery, setSearchQuery] = useState("");
    const [allUnitsData, setAllUnitsData] = useState(null);
    const isSearching = searchQuery.trim().length > 0;

    useEffect(() => {
        if (!isSearching || allUnitsData !== null) return;
        const fetchAll = async () => {
            try {
                const resp = await axios.get(route("unit.get"));
                setAllUnitsData(resp.data || []);
            } catch (e) {
                console.error(e);
            }
        };
        fetchAll();
    }, [isSearching]);

    useEffect(() => {
        if (!edit || lookups.regions.length > 0) return;
        const fetchLookups = async () => {
            try {
                const [regionsResp, clientsResp] = await Promise.all([
                    axios.get(route("regions.get")),
                    axios.get(route("client.get")),
                ]);
                setLookups({
                    regions: regionsResp.data || [],
                    clients: clientsResp.data || [],
                });
            } catch (e) {
                console.error(e);
            }
        };
        fetchLookups();
    }, [edit]);

    // Sentinel id for a not-yet-saved draft row inserted by "Add Unit" (see
    // handleAddRow below) -- lets the same inline-edit cells/Save button used
    // for existing rows double as the "create new unit" form, instead of
    // navigating to a separate page.
    const NEW_UNIT_ID = "__new_unit__";

    const handleAddRow = () => {
        if ((unitData || []).some((u) => u.unit_id === NEW_UNIT_ID)) return;
        setEdit(true);
        setUnitData((prev) => [
            {
                unit_id: NEW_UNIT_ID,
                unit: "",
                unit_sn: "",
                old_sn: "",
                region_id: "",
                region: "",
                client_id: "",
                client: "",
                area_id: "",
                area: "",
                location_id: "",
                location: "",
                status: "running",
            },
            ...(prev || []),
        ]);
    };

    // Wraps setEdit so turning edit mode OFF also discards any unsaved draft
    // row from "Add Unit" -- otherwise it'd linger in the list unsaved.
    const handleToggleEdit = () => {
        setEdit((prev) => {
            if (prev) handleCancelNewRow();
            return !prev;
        });
    };

    const handleCancelNewRow = () => {
        setUnitData((prev) => (prev || []).filter((u) => u.unit_id !== NEW_UNIT_ID));
        setFormData((prev) => {
            const newEdits = { ...prev.edits };
            delete newEdits[NEW_UNIT_ID];
            return { ...prev, edits: newEdits };
        });
    };

    const handleFieldChange = (unit_id, field, value) => {
        setFormData((prev) => {
            const current = { ...(prev.edits?.[unit_id] || {}) };
            current[field] = value;
            if (field === "region_id") {
                current.area_id = "";
                current.location_id = "";
            } else if (field === "area_id") {
                current.location_id = "";
            }
            return { ...prev, edits: { ...prev.edits, [unit_id]: current } };
        });
    };

    const handleCreateRow = async () => {
        const edits = formData?.edits?.[NEW_UNIT_ID] || {};
        if (!edits.unit || !edits.client_id || !edits.area_id || !edits.location_id) {
            addToast({
                type: "error",
                text: "Unit name, Client, Area, and Location are required.",
            });
            return;
        }
        try {
            const resp = await axios.post(route("unit.add"), {
                unit: edits.unit,
                status: edits.status || "running",
                position_type: "client",
                client_id: edits.client_id,
                area_id: edits.area_id,
                location_id: edits.location_id,
            });
            addToast(resp?.data);
            handleCancelNewRow();
            // The create endpoint doesn't return the new row's flat shape
            // (client/area/location names etc.), so just refetch the list.
            const fresh = await axios.get(route("unit.get"));
            setUnitData(fresh.data || []);
        } catch (e) {
            console.error(e);
            const firstError = Object.values(e?.response?.data?.errors || {})[0]?.[0];
            addToast({
                type: "error",
                text: firstError || e?.response?.data?.message || "Failed to add unit.",
            });
        }
    };

    const handleSaveRow = async (unit_id) => {
        if (unit_id === NEW_UNIT_ID) {
            return handleCreateRow();
        }
        const edits = formData?.edits?.[unit_id];
        if (!edits) return;
        try {
            const resp = await axios.post(route("unit.update.full"), {
                unit_id,
                ...edits,
            });
            addToast(resp?.data);

            setUnitData((prev) =>
                prev.map((item) => {
                    if (item.unit_id !== unit_id) return item;
                    const merged = { ...item, ...edits };
                    if (edits.region_id) {
                        merged.region = lookups.regions.find(
                            (r) => String(r.id) === String(edits.region_id)
                        )?.name;
                    }
                    if (edits.client_id) {
                        merged.client = lookups.clients.find(
                            (c) => c.client_id === edits.client_id
                        )?.name;
                    }
                    if (edits.location_id) {
                        const region = lookups.regions.find(
                            (r) => String(r.id) === String(merged.region_id)
                        );
                        const area = region?.areas?.find((a) =>
                            (a.locations || []).some(
                                (l) => String(l.id) === String(edits.location_id)
                            )
                        );
                        merged.area = area?.area;
                        merged.area_id = area?.id;
                        merged.location = area?.locations?.find(
                            (l) => String(l.id) === String(edits.location_id)
                        )?.location;
                    }
                    return merged;
                })
            );

            setFormData((prev) => {
                const newEdits = { ...prev.edits };
                delete newEdits[unit_id];
                return { ...prev, edits: newEdits };
            });
        } catch (e) {
            console.error(e);
            addToast({
                type: "error",
                text: e?.response?.data?.message || "Failed to update unit.",
            });
        }
    };

    useEffect(() => {
        // `data` is only guaranteed when this component is given props (e.g. from
        // DailyList.jsx's server-paginated page) -- when it self-fetches (no props,
        // see the `!propsData` branch below) `data` is undefined until then.
        const safeData = unitData || [];
        setThresholdSetting(
            safeData.find(
                (item) =>
                    formData?.selectedRows[
                        formData?.selectedRows.length - 1
                    ] === item?.unit_id,
            )?.thresholdSetting || null,
        );
        setVisibilitySetting(
            safeData.find(
                (item) =>
                    formData?.selectedRows[
                        formData?.selectedRows.length - 1
                    ] === item?.unit_id,
            )?.visibilitySetting || null,
        );
        setCurvePercentage(
            safeData.find(
                (item) =>
                    formData?.selectedRows[
                        formData?.selectedRows.length - 1
                    ] === item?.unit_id,
            )?.curve_percentage ?? null,
        );
    }, [formData?.selectedRows]);

    const handleClick = (item) => {
        if (!item.unit_position_id || edit) return;
        const url = route("daily", item.unit);

        // if (e && (e.button === 1 || e.ctrlKey || e.metaKey)) {
        //     window.open(url, "_blank");
        //     window.focus();
        //     // window.open(url, "_blank");
        // } else {
            router.visit(url);
        // }
    };

    const handleSelectAll = () => {
        const safeData = unitData || [];
        if (formData.selectedRows.length === safeData.length) {
            // Unselect all
            setFormData((prev) => ({
                ...prev,
                selectedRows: [],
                selectedUnits: [],
                selectedUnitPositions: [],
            }));
        } else {
            // Select all
            setFormData((prev) => ({
                ...prev,
                selectedRows: safeData.map((item) => item.unit_id),
                selectedUnits: safeData.map((item) => item.unit),
                selectedUnitPositions: safeData.map(
                    (item) => item.unit_position_id,
                ),
            }));
        }
    };

    const handleSubmit = ({ type }) => {
        if (formData.selectedRows.length === 0) return;
        if (type === "export") {
            setExportModal(true);
            setIsSettingModal(false);
        } else {
            setIsSettingModal(true);
            setExportModal(false);
        }
    };

    const pageOffset = pagination && !isSearching
        ? (pagination.current_page - 1) * pagination.per_page
        : 0;
    const columns = tColumns(
        "unitList",
        formData,
        null,
        handleSelectAll,
        edit,
        pageOffset,
        lookups,
        handleFieldChange,
        handleSaveRow,
        bulkEdit,
        (item) => setHistoryUnit(item)
    );
    const onSelect = (selected) => {
        const currSelected = formData?.selectedRows || [];
        const currSelectedUnits = formData?.selectedUnits || [];
        const currSelectedUnitPositions = formData?.selectedUnitPositions || [];
        const isSelected = currSelected.includes(String(selected.unit_id));
        if (isSelected) {
            // Deselect
            setFormData((prev) => ({
                ...prev,
                selectedRows: currSelected.filter(
                    (item) => item !== String(selected.unit_id),
                ),
                selectedUnits: currSelectedUnits.filter(
                    (item) => item !== String(selected.unit),
                ),
                selectedUnitPositions: currSelectedUnitPositions.filter(
                    (item) => item !== selected.unit_position_id,
                ),
            }));
            return;
        }
        // Select
        setFormData({
            ...formData,
            selectedRows: [...currSelected, String(selected.unit_id)],
            selectedUnits: [...(formData.selectedUnits || []), selected.unit],
            selectedUnitPositions: [
                ...(formData.selectedUnitPositions || []),
                selected.unit_position_id,
            ],
        });
        // setThresholdSetting(selected.thresholdSetting || null);
        // setVisibilitySetting(selected.visibilitySetting || null);
    };

    if (!propsData) {
        if (selfFetchLoading) {
            return <LoadingSpinner />;
        }
        if (selfFetchError) {
            return <div>Error: {selfFetchError.message}</div>;
        }
        return (
            <>
                <TableComponent
                    handleSubmit={handleSubmit}
                    isUnitList={true}
                    filterStatus={true}
                    data={formData?.data}
                    columns={columns}
                    title={"List of Unit"}
                    // onRowClick={handleClick}
                    onRowClick={bulkEdit ? onSelect : edit ? undefined : handleClick}
                    addNewItem={true}
                    handleNew={handleAddRow}
                    toggleEdit={
                        user?.role === "super_admin" ? handleToggleEdit : undefined
                    }
                    edit={edit}
                    secondaryAction={{
                        label: "Bulk Settings",
                        activeLabel: "Done",
                        active: bulkEdit,
                        onClick: () => setBulkEdit((prev) => !prev),
                    }}
                />
                <SettingModal
                    data={unitData}
                    setData={setUnitData}
                    addToast={addToast}
                    isModal={isSettingModal}
                    setIsModal={setIsSettingModal}
                    unitName={formData?.selectedUnits}
                    thresholdSetting={thresholdSetting}
                    visibilitySetting={visibilitySetting}
                    curvePercentage={curvePercentage}
                    selectedUnits={formData?.selectedRows}
                />
                <ExportModal
                    isModal={isExportModal}
                    setIsModal={setExportModal}
                    selectedUnitPositions={formData?.selectedUnitPositions}
                />
                <UnitHistoryModal
                    unit={historyUnit}
                    onClose={() => setHistoryUnit(null)}
                />
            </>
        );
    }
    const searchData = isSearching ? formatRows(allUnitsData || []) : formData?.data;
    const paginationFooter = !isSearching && pagination && pagination.last_page > 1 && (
        <div className="sticky bottom-0 left-0 bg-white border-t flex items-center justify-between flex-wrap gap-2 px-6 py-4 rounded-b-lg">
            <p className="text-sm text-gray-500">
                Page {pagination.current_page} of {pagination.last_page} (
                {pagination.total} units)
            </p>
            <div className="flex gap-1 flex-wrap">
                {pagination.links.map((link, i) => (
                    <button
                        key={i}
                        disabled={!link.url}
                        onClick={() => handlePageChange(link.url)}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className={`px-3 py-1.5 rounded-md border text-sm min-w-[36px] disabled:opacity-40 disabled:cursor-not-allowed ${
                            link.active
                                ? "bg-primary text-white border-primary"
                                : "hover:bg-gray-50"
                        }`}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <>
            <TableComponent
                handleSubmit={handleSubmit}
                height={"55vh"}
                isUnitList={true}
                filterStatus={true}
                data={searchData}
                onSearchChange={setSearchQuery}
                columns={columns}
                title={"List of Unit"}
                route={(item) => route("daily", item.unit)}
                // onRowClick={handleClick}
                onRowClick={bulkEdit ? onSelect : edit ? undefined : handleClick}
                addNewItem={user && user.role === "super_admin" ? true : false}
                toggleEdit={
                    user?.role === "super_admin" ? handleToggleEdit : undefined
                }
                edit={edit}
                secondaryAction={{
                    label: "Bulk Settings",
                    activeLabel: "Done",
                    active: bulkEdit,
                    onClick: () => setBulkEdit((prev) => !prev),
                }}
                handleNew={handleAddRow}
                Footer={paginationFooter}
            />
            <SettingModal
                data={unitData}
                setData={setUnitData}
                addToast={addToast}
                isModal={isSettingModal}
                setIsModal={setIsSettingModal}
                unitName={formData?.selectedUnits}
                thresholdSetting={thresholdSetting}
                visibilitySetting={visibilitySetting}
                curvePercentage={curvePercentage}
                selectedUnits={formData?.selectedRows}
            />
            <ExportModal
                isModal={isExportModal}
                setIsModal={setExportModal}
                selectedUnitPositions={formData?.selectedUnitPositions}
            />
            <UnitHistoryModal
                unit={historyUnit}
                onClose={() => setHistoryUnit(null)}
            />
        </>
        // <></>
    );
};

const ExportModal = ({ isModal, setIsModal, selectedUnitPositions }) => {
    const [formData, setFormData] = useState({
        name: "",
        department: "",
        clientName: "",
        clientDepartment: "",
    });
    const handleExport = () => {
        window.open(
            route("export_doc", {
                unit_pos_id: selectedUnitPositions,
                client_name: formData?.clientName || "client name",
                client_department:
                    formData?.clientDepartment || "client department",
                name: formData?.name || "name",
                department: formData?.department || "department",
            }),
            "_blank",
        );
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <Modal
            showModal={isModal}
            handleCloseModal={() => setIsModal(false)}
            title="Export BA"
        >
            <Modal.Body>
                <div className="space-y-4 p-4 rounded-lg shadow-sm">
                    {/* From Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="col-span-1 flex items-center space-x-2">
                            <span className="font-semibold w-24">From:</span>
                            <input
                                type="text"
                                onChange={(e) =>
                                    handleChange("name", e.target.value)
                                }
                                value={formData?.name}
                                placeholder="Name"
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                        </div>
                        <div className="col-span-1 flex items-center space-x-2">
                            <input
                                type="text"
                                onChange={(e) =>
                                    handleChange("department", e.target.value)
                                }
                                value={formData?.department}
                                placeholder="Department"
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                        </div>
                    </div>

                    {/* To Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="col-span-1 flex items-center space-x-2">
                            <span className="font-semibold w-24">To:</span>
                            <input
                                type="text"
                                onChange={(e) =>
                                    handleChange("clientName", e.target.value)
                                }
                                value={formData?.clientName}
                                placeholder="Client Name"
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                        </div>
                        <div className="col-span-1 flex items-center space-x-2">
                            <input
                                type="text"
                                onChange={(e) =>
                                    handleChange(
                                        "clientDepartment",
                                        e.target.value,
                                    )
                                }
                                value={formData?.clientDepartment}
                                placeholder="Client Department"
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="flex items-center justify-end">
                    <button className="button-submit" onClick={handleExport}>
                        Export
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

// Label ramah baca buat tiap jenis perubahan -- lihat action yang dikirim
// UnitMovementLogger di backend (assign_client, remove_client, relocate, dsb).
const MOVEMENT_ACTION_LABEL = {
    created: "Unit created",
    assign_client: "Assigned to client",
    assign_workshop: "Assigned to workshop",
    remove_client: "Unassigned from client/workshop",
    assign_location: "Assigned to location",
    remove_location: "Unassigned from location",
    relocate: "Relocated",
    client_bulk_move: "Moved with client (bulk)",
};

const UnitHistoryModal = ({ unit, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        if (!unit) return;
        setLoading(true);
        axios
            .get(route("unit.movement.log", { unit_id: unit.unit_id }))
            .then((resp) => setLogs(resp.data || []))
            .catch((e) => console.error(e))
            .finally(() => setLoading(false));
    }, [unit]);

    const describe = (log, prefix) => {
        const client = log[`${prefix}Client`]?.name;
        const region = log[`${prefix}Region`]?.name;
        const location = log[`${prefix}Location`]?.location;
        const area = log[`${prefix}Location`]?.area?.area;
        const parts = [
            client && `Client: ${client}`,
            region && `Region: ${region}`,
            area && `Area: ${area}`,
            location && `Location: ${location}`,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(" · ") : "—";
    };

    return (
        <Modal showModal={!!unit} handleCloseModal={onClose} title="Movement History" size="md">
            <Modal.Body>
                <p className="text-sm text-gray-500 mb-4">
                    Unit: <span className="font-medium">{unit?.unit}</span>
                </p>
                {loading ? (
                    <LoadingSpinner />
                ) : logs.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">
                        No movement recorded yet.
                    </p>
                ) : (
                    <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="border border-gray-200 rounded-md p-3"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-sm text-primary">
                                        {MOVEMENT_ACTION_LABEL[log.action] || log.action}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(log.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    From: {describe(log, "from")}
                                </p>
                                <p className="text-xs text-gray-500">
                                    To: {describe(log, "to")}
                                </p>
                                {log.changedByUser && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        By {log.changedByUser.name}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

const SettingModal = ({
    setData,
    data,
    isModal,
    setIsModal,
    thresholdSetting,
    visibilitySetting,
    curvePercentage,
    unitName,
    selectedUnits,
    addToast,
}) => {
    const [formData, setFormData] = useState({
        thresholdSetting: {},
        visibilitySetting: {},
        requiredSetting: {},
        curve_percentage: 0,
    });

    const [fields, setFields] = useState([]);

    useEffect(() => {
        const fetchFields = async () => {
            const data = await getFields();
            setFields(data);
        };
        fetchFields();

        // 'Required' disimpan per unit di tabel unit_fields (bukan JSON di data_units
        // seperti threshold/visibility), jadi harus di-fetch terpisah per unit. Kalau
        // pilih banyak unit sekaligus, pakai unit yang terakhir dipilih sebagai acuan
        // nilai awal -- sama seperti threshold/visibility yang juga cuma ambil dari
        // unit terakhir yang dipilih (lihat useEffect [formData?.selectedRows] di UnitTable).
        const lastUnitId = selectedUnits?.[selectedUnits.length - 1];
        if (lastUnitId) {
            const fetchRequired = async () => {
                try {
                    const resp = await axios.get(
                        route("unit.fields.get", { unit_id: lastUnitId }),
                    );
                    const requiredMap = {};
                    (resp.data || []).forEach((field) => {
                        requiredMap[field.id] = field.required;
                    });
                    setFormData((prev) => ({
                        ...prev,
                        requiredSetting: requiredMap,
                    }));
                } catch (e) {
                    console.error(e);
                }
            };
            fetchRequired();
        }

        let defaultThresholdSetting = {};
        let defaultVisibilitySetting = {};

        formItems
            .filter((item) => item.name !== "time")
            .forEach((item) => {
                if (item?.subheader && item.subheader.length > 0) {
                    item.subheader.forEach((sub) => {
                        defaultThresholdSetting[sub.name] = {
                            value: 0,
                            type: "number",
                        };
                        defaultVisibilitySetting[sub.name] = true;
                    });
                    return;
                }
                defaultThresholdSetting[item.name] = {
                    value: 0,
                    type: "number",
                };
                defaultVisibilitySetting[item.name] = true;
            });
        setFormData((prev) => ({
            ...prev,
            thresholdSetting: thresholdSetting ?? defaultThresholdSetting,
            visibilitySetting: visibilitySetting ?? defaultVisibilitySetting,
            curve_percentage: curvePercentage ?? 0,
        }));
    }, [thresholdSetting, curvePercentage, selectedUnits]);

    const handleChange = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: {
                    ...prev[section][field],
                    ...value,
                },
            },
        }));
    };

    const handleClickVisibility = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    // Toggle wajib-isi per field_id. Field dengan subfields cuma punya 1 field_id
    // (punya induknya), jadi menoggle satu subfield ikut menoggle semua saudaranya
    // -- sesuai unit_fields.required yang memang disimpan per field induk, bukan
    // per subfield.
    const handleClickRequired = (fieldId, value) => {
        setFormData((prev) => ({
            ...prev,
            requiredSetting: {
                ...prev.requiredSetting,
                [fieldId]: value,
            },
        }));
    };
    const handleSave = async () => {
        try {
            const resp = await axios.post(route("unit.setSettings"), {
                unit_id: selectedUnits,
                ...formData,
            });
            if (resp.status === 200 || resp.status === 302) {
                addToast(resp.data);
                const updatedData = data.map((item) =>
                    selectedUnits.includes(item.unit_id)
                        ? { ...item, ...formData }
                        : item,
                );
                setData(updatedData);
            } else {
            }
        } catch (err) {
            console.error("Error creating report:", err);
            addToast({
                type: "error",
                text: err?.response?.data?.message || "Failed to save data!",
            });
        } finally {
            // setSaving(false);
        }
    };
    const unitList = Array.isArray(unitName) ? unitName : [unitName].filter(Boolean);

    return (
        <Modal
            showModal={isModal}
            handleCloseModal={() => setIsModal(false)}
            title="Unit Setting"
            size="xl"
        >
            <Modal.Body>
                <div className="flex flex-col gap-5">
                    {/* Ringkasan: unit yang lagi diedit + kartu Curve % */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 bg-[#F4F6FB] rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Editing {unitList.length || 1} unit
                                {unitList.length !== 1 && "s"}
                            </p>
                            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                                {unitList.slice(0, 12).map((name, i) => (
                                    <span
                                        key={i}
                                        className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-700 shadow-sm"
                                    >
                                        <FaCube className="text-primary text-[10px]" />
                                        {name}
                                    </span>
                                ))}
                                {unitList.length > 12 && (
                                    <span className="text-sm text-gray-500 px-2 py-1">
                                        +{unitList.length - 12} more
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="md:w-64 bg-primary rounded-xl p-4 text-white flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-2">
                                <FaPercent className="text-sm" />
                                <p className="text-xs font-semibold uppercase tracking-wide">
                                    Curve Adjustment
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="200"
                                    step="0.01"
                                    value={formData?.curve_percentage ?? 0}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            curve_percentage: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                                <span className="text-lg font-bold">%</span>
                            </div>
                            <p className="text-xs text-white/70 mt-2">
                                0% = no change &middot; 200% = triple
                            </p>
                        </div>
                    </div>

                    {/* Field settings */}
                    <div className="overflow-y-auto overflow-x-auto max-h-[45vh] rounded-xl border border-gray-200">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                                <tr>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                                        Field
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                                        Threshold
                                    </th>
                                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                                        Visible
                                    </th>
                                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                                        Required
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {fields
                                    .filter(
                                        (item) =>
                                            item.name !== "time" &&
                                            item.name !== "remarks",
                                    )
                                    .flatMap((item) => {
                                        const fields =
                                            item.subfields.length > 0
                                                ? item?.subfields
                                                : [item];
                                        // Semua subfield ikut field_id induknya -- required
                                        // disimpan per DailyField, bukan per subfield.
                                        const parentFieldId = item.id;
                                        return fields.map((field, idx) => {
                                            const isVisible =
                                                formData.visibilitySetting[
                                                    field.slug
                                                ] ?? true;
                                            const isRequired =
                                                formData?.requiredSetting?.[
                                                    parentFieldId
                                                ] ?? true;

                                            return (
                                                <tr
                                                    key={field.name + idx}
                                                    className={`transition-colors ${
                                                        isVisible
                                                            ? "bg-white hover:bg-[#F9FAFC]"
                                                            : "bg-gray-50/70"
                                                    }`}
                                                >
                                                    {/* FIELD NAME */}
                                                    <td className="px-5 py-3.5">
                                                        <span
                                                            className={`font-medium text-sm ${
                                                                isVisible
                                                                    ? "text-gray-800"
                                                                    : "text-gray-400"
                                                            }`}
                                                        >
                                                            {field.name}
                                                        </span>
                                                    </td>

                                                    {/* THRESHOLD */}
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden w-fit focus-within:ring-2 focus-within:ring-primary/30">
                                                            <input
                                                                type="text"
                                                                inputMode="decimal"
                                                                placeholder="0"
                                                                disabled={
                                                                    !isVisible
                                                                }
                                                                className="w-20 px-3 py-2 text-sm text-[#344054] outline-none disabled:bg-gray-50 disabled:text-gray-400"
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        "thresholdSetting",
                                                                        field.slug,
                                                                        {
                                                                            value: e
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                                value={
                                                                    formData
                                                                        ?.thresholdSetting?.[
                                                                        field
                                                                            .slug
                                                                    ]
                                                                        ?.value ||
                                                                    ""
                                                                }
                                                            />
                                                            <select
                                                                disabled={
                                                                    !isVisible
                                                                }
                                                                className="border-l border-gray-200 bg-gray-50 text-sm px-2 py-2 text-[#344054] outline-none disabled:text-gray-400"
                                                                value={
                                                                    formData
                                                                        ?.thresholdSetting?.[
                                                                        field
                                                                            .slug
                                                                    ]?.type ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        "thresholdSetting",
                                                                        field.slug,
                                                                        {
                                                                            type: e
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                {[
                                                                    {
                                                                        label: "%",
                                                                        value: "percentage",
                                                                    },
                                                                    {
                                                                        label: "Num",
                                                                        value: "number",
                                                                    },
                                                                ].map((opt) => (
                                                                    <option
                                                                        key={
                                                                            opt.value
                                                                        }
                                                                        value={
                                                                            opt.value
                                                                        }
                                                                    >
                                                                        {
                                                                            opt.label
                                                                        }
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </td>

                                                    {/* VISIBLE */}
                                                    <td className="px-5 py-3.5 text-center">
                                                        <button
                                                            type="button"
                                                            title={
                                                                isVisible
                                                                    ? "Visible -- click to hide"
                                                                    : "Hidden -- click to show"
                                                            }
                                                            onClick={() =>
                                                                handleClickVisibility(
                                                                    "visibilitySetting",
                                                                    field.slug,
                                                                    !isVisible,
                                                                )
                                                            }
                                                            className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition ${
                                                                isVisible
                                                                    ? "bg-success/10 border-success text-success"
                                                                    : "bg-gray-100 border-gray-300 text-gray-400"
                                                            }`}
                                                        >
                                                            {isVisible ? (
                                                                <FaEye />
                                                            ) : (
                                                                <FaEyeSlash />
                                                            )}
                                                        </button>
                                                    </td>

                                                    {/* REQUIRED */}
                                                    <td className="px-5 py-3.5 text-center">
                                                        <button
                                                            type="button"
                                                            title={
                                                                isRequired
                                                                    ? "Required -- click to make optional"
                                                                    : "Optional -- click to make required"
                                                            }
                                                            onClick={() =>
                                                                handleClickRequired(
                                                                    parentFieldId,
                                                                    !isRequired,
                                                                )
                                                            }
                                                            className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition ${
                                                                isRequired
                                                                    ? "bg-primary/10 border-primary text-primary"
                                                                    : "bg-gray-100 border-gray-300 text-gray-400"
                                                            }`}
                                                        >
                                                            <FaAsterisk className="text-[10px]" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setIsModal(false)}
                        className="border border-white/30 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSave()}
                        className="border border-transparent bg-white text-primary font-semibold px-5 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        Save Changes
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default UnitTable;
