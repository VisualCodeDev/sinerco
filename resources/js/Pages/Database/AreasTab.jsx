import { FaPlus, FaTimes } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { useToast } from "@/Components/Toast/ToastProvider";
import Modal from "@/Components/Modal";
import LoadingSpinner from "@/Components/Loading";
import TableComponent from "@/Components/TableComponent";

const NEW_REGION_ID = "__new_region__";
const NEW_AREA_ID = "__new_area__";

const AreasTab = () => {
    const [loading, setLoading] = useState(true);
    const [areas, setAreas] = useState([]);
    const [regions, setRegions] = useState([]);
    const { addToast } = useToast();

    const [editRegions, setEditRegions] = useState(false);
    const [regionEdits, setRegionEdits] = useState({});
    const [newRegionId, setNewRegionId] = useState(null);

    const [editAreas, setEditAreas] = useState(false);
    const [areaEdits, setAreaEdits] = useState({});
    const [newAreaId, setNewAreaId] = useState(null);
    const [newLocationName, setNewLocationName] = useState({});
    const [regionFilter, setRegionFilter] = useState("");

    // Delete confirmation modal state
    const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'region'|'area'|'location', id, label }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [areasResp, regionsResp] = await Promise.all([
                    axios.get(route("areas.get")),
                    axios.get(route("regions.get")),
                ]);
                setAreas(areasResp.data || []);
                setRegions(regionsResp.data || []);
            } catch (e) {
                addToast({ type: "error", text: "Failed to load area/location data." });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleError = (e) => {
        const msg =
            e.response?.data?.text ||
            Object.values(e.response?.data?.errors || {}).flat()[0] ||
            "Operation failed.";
        addToast({ type: "error", text: msg });
    };

    // --- Region CRUD ---
    const regionEditValue = (item, field) =>
        regionEdits?.[item.id]?.[field] ?? item[field] ?? "";

    const handleRegionFieldChange = (id, field, value) => {
        setRegionEdits((prev) => ({
            ...prev,
            [id]: { ...(prev[id] || {}), [field]: value },
        }));
    };

    const handleAddRegionRow = () => {
        setEditRegions(true);
        setNewRegionId(NEW_REGION_ID);
        setRegionEdits((prev) => ({ ...prev, [NEW_REGION_ID]: { name: "" } }));
        setRegions((prev) => [...prev, { id: NEW_REGION_ID, name: "" }]);
    };

    const handleCancelNewRegion = () => {
        setRegions((prev) => prev.filter((r) => r.id !== NEW_REGION_ID));
        setRegionEdits((prev) => {
            const next = { ...prev };
            delete next[NEW_REGION_ID];
            return next;
        });
        setNewRegionId(null);
    };

    const handleSaveRegionRow = async (regionId) => {
        const rowEdits = regionEdits[regionId];
        if (!rowEdits?.name?.trim()) return;
        try {
            if (regionId === NEW_REGION_ID) {
                const resp = await axios.post(route("region.store"), {
                    name: rowEdits.name.trim(),
                });
                setRegions((prev) =>
                    prev.map((r) => (r.id === NEW_REGION_ID ? resp.data.region : r)),
                );
                setNewRegionId(null);
                addToast(resp.data);
            } else {
                const resp = await axios.put(
                    route("region.update", { region: regionId }),
                    { name: rowEdits.name.trim() },
                );
                setRegions((prev) =>
                    prev.map((r) =>
                        r.id === regionId ? { ...r, name: rowEdits.name.trim() } : r,
                    ),
                );
                addToast(resp.data);
            }
            setRegionEdits((prev) => {
                const next = { ...prev };
                delete next[regionId];
                return next;
            });
        } catch (e) {
            handleError(e);
        }
    };

    const handleDeleteRegion = async (regionId) => {
        try {
            const resp = await axios.delete(route("region.destroy", { region: regionId }));
            setRegions((prev) => prev.filter((r) => r.id !== regionId));
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        } finally {
            setDeleteTarget(null);
        }
    };

    // --- Area CRUD ---
    const areaEditValue = (item, field) =>
        areaEdits?.[item.id]?.[field] ?? item[field] ?? "";

    const handleAreaFieldChange = (id, field, value) => {
        setAreaEdits((prev) => ({
            ...prev,
            [id]: { ...(prev[id] || {}), [field]: value },
        }));
    };

    const handleAddAreaRow = () => {
        setEditAreas(true);
        setNewAreaId(NEW_AREA_ID);
        setAreaEdits((prev) => ({
            ...prev,
            [NEW_AREA_ID]: { area: "", region_id: "" },
        }));
        setAreas((prev) => [...prev, { id: NEW_AREA_ID, area: "", region_id: null, locations: [] }]);
    };

    const handleCancelNewArea = () => {
        setAreas((prev) => prev.filter((a) => a.id !== NEW_AREA_ID));
        setAreaEdits((prev) => {
            const next = { ...prev };
            delete next[NEW_AREA_ID];
            return next;
        });
        setNewAreaId(null);
    };

    const handleSaveAreaRow = async (areaId) => {
        const rowEdits = areaEdits[areaId];
        if (!rowEdits?.area?.trim()) return;
        try {
            if (areaId === NEW_AREA_ID) {
                const resp = await axios.post(route("area.store"), {
                    area: rowEdits.area.trim(),
                    region_id: rowEdits.region_id || null,
                });
                setAreas((prev) =>
                    prev.map((a) =>
                        a.id === NEW_AREA_ID ? { ...resp.data.area, locations: [] } : a,
                    ),
                );
                setNewAreaId(null);
                addToast(resp.data);
            } else {
                const resp = await axios.put(route("area.update", { area: areaId }), {
                    area: rowEdits.area.trim(),
                    region_id: rowEdits.region_id ?? undefined,
                });
                setAreas((prev) =>
                    prev.map((a) =>
                        a.id === areaId
                            ? {
                                  ...a,
                                  area: rowEdits.area.trim(),
                                  region_id:
                                      rowEdits.region_id !== undefined
                                          ? rowEdits.region_id || null
                                          : a.region_id,
                              }
                            : a,
                    ),
                );
                addToast(resp.data);
            }
            setAreaEdits((prev) => {
                const next = { ...prev };
                delete next[areaId];
                return next;
            });
        } catch (e) {
            handleError(e);
        }
    };

    const handleDeleteArea = async (areaId) => {
        try {
            const resp = await axios.delete(route("area.destroy", { area: areaId }));
            setAreas((prev) => prev.filter((a) => a.id !== areaId));
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        } finally {
            setDeleteTarget(null);
        }
    };

    // --- Location CRUD (managed inline within an Area row) ---
    const handleAddLocation = async (area) => {
        const name = (newLocationName[area.id] || "").trim();
        if (!name) return;
        try {
            const resp = await axios.post(route("location.store"), {
                location: name,
                area_id: area.id,
            });
            const newLoc = resp.data.location;
            setAreas((prev) =>
                prev.map((a) =>
                    a.id === area.id
                        ? { ...a, locations: [...(a.locations || []), newLoc] }
                        : a,
                ),
            );
            setNewLocationName((prev) => ({ ...prev, [area.id]: "" }));
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        }
    };

    const handleDeleteLocation = async (locationId) => {
        try {
            const resp = await axios.delete(
                route("location.destroy", { location: locationId }),
            );
            setAreas((prev) =>
                prev.map((a) => ({
                    ...a,
                    locations: (a.locations || []).filter((l) => l.id !== locationId),
                })),
            );
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        } finally {
            setDeleteTarget(null);
        }
    };

    // Derived fields so the plain a[sortConfig.key] sort in TableComponent can
    // sort by the region's name / a readable locations string instead of raw
    // region_id / the locations array.
    const displayAreas = areas
        .map((a) => ({
            ...a,
            region_name:
                regions.find((r) => String(r.id) === String(a.region_id))?.name || "",
            locations_text: (a.locations || []).map((l) => l.location).join(", "),
        }))
        .filter((a) =>
            regionFilter ? String(a.region_id) === String(regionFilter) : true,
        );

    const confirmDelete = () => {
        if (!deleteTarget) return;
        if (deleteTarget.type === "region") handleDeleteRegion(deleteTarget.id);
        else if (deleteTarget.type === "area") handleDeleteArea(deleteTarget.id);
        else if (deleteTarget.type === "location") handleDeleteLocation(deleteTarget.id);
    };

    const regionColumns = [
        {
            name: "no",
            header: "No.",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            width: "8%",
            Cell: ({ index }) => index + 1,
        },
        {
            name: "name",
            header: "Region Name",
            headerClassName: "bg-primary text-white",
            Cell: (item) => {
                if (editRegions) {
                    return (
                        <input
                            type="text"
                            autoFocus={item.id === newRegionId}
                            className="w-full border border-gray-300 rounded-md px-2 py-1"
                            value={regionEditValue(item, "name")}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                handleRegionFieldChange(item.id, "name", e.target.value)
                            }
                        />
                    );
                }
                return item.name;
            },
        },
        {
            name: "save",
            header: "",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            width: "8%",
            Cell: (item) => {
                if (!editRegions || !regionEdits[item.id]) return null;
                return (
                    <button
                        type="button"
                        className="bg-white text-primary border border-primary px-3 py-1 rounded-md text-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSaveRegionRow(item.id);
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
            Cell: (item) => {
                if (item.id === newRegionId) {
                    return (
                        <button
                            type="button"
                            className="border border-gray-300 bg-white text-gray-600 px-3 py-1 rounded-md text-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCancelNewRegion();
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
                            setDeleteTarget({ type: "region", id: item.id, label: item.name });
                        }}
                    >
                        Delete
                    </button>
                );
            },
        },
    ];

    const areaColumns = [
        {
            name: "no",
            header: "No.",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            width: "5%",
            Cell: ({ index }) => index + 1,
        },
        {
            name: "area",
            header: "Area Name",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "18%",
            Cell: (item) => {
                if (editAreas) {
                    return (
                        <input
                            type="text"
                            autoFocus={item.id === newAreaId}
                            className="w-full border border-gray-300 rounded-md px-2 py-1"
                            value={areaEditValue(item, "area")}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                handleAreaFieldChange(item.id, "area", e.target.value)
                            }
                        />
                    );
                }
                return item.area;
            },
        },
        {
            name: "region_name",
            header: "Region",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "16%",
            Cell: (item) => {
                if (editAreas) {
                    return (
                        <select
                            className="w-full border border-gray-300 rounded-md px-2 py-1 bg-white"
                            value={areaEditValue(item, "region_id") || ""}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                handleAreaFieldChange(item.id, "region_id", e.target.value)
                            }
                        >
                            <option value="">-- No Region --</option>
                            {regions
                                .filter((r) => r.id !== NEW_REGION_ID)
                                .map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                        </select>
                    );
                }
                return regions.find((r) => String(r.id) === String(item.region_id))?.name || "-";
            },
        },
        {
            name: "locations_text",
            header: "Locations",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "35%",
            Cell: (item) => {
                if (item.id === newAreaId) {
                    return (
                        <span className="text-xs text-gray-400 italic">
                            Save area first
                        </span>
                    );
                }
                return (
                    <div className="flex flex-wrap gap-1.5 items-center">
                        {(item.locations || []).map((loc) => (
                            <span
                                key={loc.id}
                                className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                                {loc.location}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteTarget({
                                            type: "location",
                                            id: loc.id,
                                            label: loc.location,
                                        });
                                    }}
                                    className="text-blue-400 hover:text-red-500"
                                >
                                    <FaTimes className="text-[10px]" />
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            placeholder="+ new location"
                            value={newLocationName[item.id] || ""}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                setNewLocationName((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.value,
                                }))
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddLocation(item);
                            }}
                            className="w-32 border border-gray-300 rounded-full px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddLocation(item);
                            }}
                            className="border border-primary text-primary bg-white rounded-full p-1"
                        >
                            <FaPlus className="text-[10px]" />
                        </button>
                    </div>
                );
            },
        },
        {
            name: "save",
            header: "",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            width: "8%",
            Cell: (item) => {
                if (!editAreas || !areaEdits[item.id]) return null;
                return (
                    <button
                        type="button"
                        className="bg-white text-primary border border-primary px-3 py-1 rounded-md text-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSaveAreaRow(item.id);
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
            Cell: (item) => {
                if (item.id === newAreaId) {
                    return (
                        <button
                            type="button"
                            className="border border-gray-300 bg-white text-gray-600 px-3 py-1 rounded-md text-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCancelNewArea();
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
                            setDeleteTarget({ type: "area", id: item.id, label: item.area });
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
        <div className="flex flex-col gap-8">
            <TableComponent
                title="Regions"
                data={regions}
                columns={regionColumns}
                edit={editRegions}
                toggleEdit={() => {
                    setEditRegions((prev) => !prev);
                    setRegionEdits({});
                    setNewRegionId(null);
                    setRegions((prev) => prev.filter((r) => r.id !== NEW_REGION_ID));
                }}
                secondaryAction={{
                    label: "Add Region",
                    onClick: handleAddRegionRow,
                }}
            />

            <TableComponent
                title="Areas"
                data={displayAreas}
                columns={areaColumns}
                edit={editAreas}
                toggleEdit={() => {
                    setEditAreas((prev) => !prev);
                    setAreaEdits({});
                    setNewAreaId(null);
                    setAreas((prev) => prev.filter((a) => a.id !== NEW_AREA_ID));
                }}
                secondaryAction={{
                    label: "Add Area",
                    onClick: handleAddAreaRow,
                }}
                customFilter={
                    <select
                        className="border-none focus:border-none outline-none focus:outline-none text-sm md:text-base"
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                    >
                        <option value="">-- All Regions --</option>
                        {regions
                            .filter((r) => r.id !== NEW_REGION_ID)
                            .map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                    </select>
                }
            />

            <Modal
                showModal={!!deleteTarget}
                handleCloseModal={() => setDeleteTarget(null)}
                title="Confirm Delete"
                size="sm"
            >
                <Modal.Body>
                    <p className="text-gray-700">
                        {deleteTarget?.type === "area"
                            ? `Delete area "${deleteTarget?.label}"? All its locations will also be deleted.`
                            : `Delete this ${deleteTarget?.type} "${deleteTarget?.label}"?`}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setDeleteTarget(null)}
                            className="px-3 py-1.5 border border-white bg-transparent text-white text-sm rounded-md hover:bg-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-3 py-1.5 border border-red-500 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AreasTab;
