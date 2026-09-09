import React, { useEffect, useState } from "react";
import tColumns from "../utils/DataUnit/columns";
import {
    FaSort,
    FaSortDown,
    FaSortUp,
    FaPlus,
    FaSearch,
    FaRegBuilding,
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
        bulkEdit
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
        curve_percentage: 0,
    });

    const [fields, setFields] = useState([]);

    useEffect(() => {
        const fetchFields = async () => {
            const data = await getFields();
            setFields(data);
        };
        fetchFields();

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
    }, [thresholdSetting, curvePercentage]);

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
    return (
        <Modal
            showModal={isModal}
            handleCloseModal={() => setIsModal(false)}
            title="Unit Setting"
            size="xl"
        >
            <Modal.Body>
                <div className="flex flex-col items-center gap-4">
                    <span className="font-bold text-2xl text-center">
                        {Array.isArray(unitName) && unitName?.length > 5
                            ? unitName.slice(0, 5).join(", ") + ", ..."
                            : unitName?.join(", ") || unitName}
                    </span>
                    <div className="flex items-center gap-2">
                        <label className="font-medium">Curve %</label>
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
                            className="w-24 border border-gray-300 rounded px-2 py-1"
                        />
                        <span className="text-sm text-gray-500">
                            (0% = no change, 200% = triple)
                        </span>
                    </div>
                    <div className="overflow-y-auto overflow-x-auto w-full max-h-[50vh] rounded-lg border">
                    <table className="w-full h-full table-auto border-collapse [&_th]:border [&_th]:border-[#3a56b0] [&_td]:border [&_td]:border-gray-200">
                        <thead className="bg-[#243F96] text-white z-10 shadow-sm w-full sticky top-0">
                            <tr className="sticky top-0">
                                <th className="font-semibold text-nowrap text-left px-6 py-4 w-[45%]">
                                    Item
                                </th>
                                <th className="font-semibold text-nowrap text-left px-6 py-4 w-[45%]">
                                    Input Threshold
                                </th>
                                <th className="font-semibold text-nowrap text-left px-6 py-4 w-[10%]">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
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
                                    return fields.map((field, idx) => {
                                        return (
                                            <tr
                                                key={field.name + idx}
                                                className={`${
                                                    !formData.visibilitySetting[
                                                        field.slug
                                                    ]
                                                        ? "bg-[#cecece]"
                                                        : "bg-[#F9FAFB] hover:bg-[#F3F4F6]"
                                                } border-b border-[#E4E7EC] transition-colors`}
                                            >
                                                {/* ITEM NAME */}
                                                <td
                                                    className={`py-6 px-6 font-medium text-[#101828] whitespace-nowrap ${
                                                        !formData
                                                            .visibilitySetting[
                                                            field.slug
                                                        ] && "text-gray-400"
                                                    }`}
                                                >
                                                    {field.name}
                                                </td>

                                                {/* INPUT THRESHOLD */}
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            placeholder="Threshold"
                                                            disabled={
                                                                !formData
                                                                    .visibilitySetting[
                                                                    field.slug
                                                                ]
                                                            }
                                                            className={`w-[120px] h-[40px] border border-[#D0D5DD] rounded-lg px-3 text-[#344054] shadow-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition ${
                                                                !formData
                                                                    .visibilitySetting[
                                                                    field.slug
                                                                ] &&
                                                                "text-gray-400"
                                                            }`}
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
                                                                    field.slug
                                                                ]?.value || ""
                                                            }
                                                        />
                                                        <select
                                                            disabled={
                                                                !formData
                                                                    .visibilitySetting[
                                                                    field.slug
                                                                ]
                                                            }
                                                            className="w-[80px] h-[40px] border border-[#D0D5DD] rounded-lg px-2 text-[#344054] bg-white shadow-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                                                            value={
                                                                formData
                                                                    ?.thresholdSetting?.[
                                                                    field.slug
                                                                ]?.type || ""
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
                                                                    label: "Number",
                                                                    value: "number",
                                                                },
                                                            ].map((item) => (
                                                                <option
                                                                    key={
                                                                        item.value
                                                                    }
                                                                    value={
                                                                        item.value
                                                                    }
                                                                >
                                                                    {item.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>

                                                {/* Hide */}
                                                <td className="px-6 py-4">
                                                    <div className="">
                                                        {formData
                                                            ?.visibilitySetting?.[
                                                            field.slug
                                                        ] ? (
                                                            <button
                                                                onClick={(e) =>
                                                                    handleClickVisibility(
                                                                        "visibilitySetting",
                                                                        field.slug,
                                                                        !formData
                                                                            ?.visibilitySetting?.[
                                                                            field
                                                                                .slug
                                                                        ],
                                                                    )
                                                                }
                                                                className="text-red-50 border border-transparent bg-success font-bold px-2 py-1 rounded-lg"
                                                            >
                                                                Active
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) =>
                                                                    handleClickVisibility(
                                                                        "visibilitySetting",
                                                                        field.slug,
                                                                        !formData
                                                                            ?.visibilitySetting?.[
                                                                            field
                                                                                .slug
                                                                        ],
                                                                    )
                                                                }
                                                                className="text-red-50 border border-transparent bg-danger font-bold px-2 py-1 rounded-lg"
                                                            >
                                                                Hidden
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })}
                        </tbody>
                    </table>
                </div>
                <div>
                    <button
                        className="border border-transparent bg-primary text-white px-6 py-3 rounded-lg mt-4 hover:bg-blue-700 transition"
                        onClick={() => handleSave()}
                    >
                        Save
                    </button>
                </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default UnitTable;
