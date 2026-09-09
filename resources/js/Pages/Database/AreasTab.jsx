import {
    FaMapPin,
    FaMapMarkedAlt,
    FaGlobeAsia,
    FaPlus,
    FaTrash,
    FaPencilAlt,
    FaCheck,
    FaTimes,
} from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { useToast } from "@/Components/Toast/ToastProvider";
import Modal from "@/Components/Modal";

const AreasTab = () => {
    const [loading, setLoading] = useState(true);
    const [areas, setAreas] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    const { addToast } = useToast();

    const [editingRegionId, setEditingRegionId] = useState(null);
    const [editingRegionName, setEditingRegionName] = useState("");
    const [addingRegion, setAddingRegion] = useState(false);
    const [newRegionName, setNewRegionName] = useState("");

    const [editingAreaId, setEditingAreaId] = useState(null);
    const [editingAreaName, setEditingAreaName] = useState("");
    const [addingArea, setAddingArea] = useState(false);
    const [newAreaName, setNewAreaName] = useState("");

    const [editingLocationId, setEditingLocationId] = useState(null);
    const [editingLocationName, setEditingLocationName] = useState("");
    const [addingLocation, setAddingLocation] = useState(false);
    const [newLocationName, setNewLocationName] = useState("");

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

    const filteredAreas = selectedRegion
        ? areas.filter((a) => String(a.region_id) === String(selectedRegion.id))
        : areas;

    useEffect(() => {
        if (filteredAreas.length > 0 && !filteredAreas.find((a) => a.id === selectedArea?.id)) {
            setSelectedArea(filteredAreas[0]);
        }
        if (filteredAreas.length === 0) {
            setSelectedArea(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [areas, selectedRegion]);

    const filteredLocations = selectedArea
        ? areas.find((a) => a.id === selectedArea.id)?.locations || []
        : [];

    const handleError = (e) => {
        const msg =
            e.response?.data?.text ||
            Object.values(e.response?.data?.errors || {}).flat()[0] ||
            "Operation failed.";
        addToast({ type: "error", text: msg });
    };

    // --- Region CRUD ---
    const handleAddRegion = async () => {
        if (!newRegionName.trim()) return;
        try {
            const resp = await axios.post(route("region.store"), {
                name: newRegionName.trim(),
            });
            setRegions((prev) => [...prev, resp.data.region]);
            setNewRegionName("");
            setAddingRegion(false);
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        }
    };

    const handleUpdateRegion = async (regionId) => {
        if (!editingRegionName.trim()) return;
        try {
            const resp = await axios.put(
                route("region.update", { region: regionId }),
                { name: editingRegionName.trim() }
            );
            setRegions((prev) =>
                prev.map((r) =>
                    r.id === regionId ? { ...r, name: editingRegionName.trim() } : r
                )
            );
            if (selectedRegion?.id === regionId) {
                setSelectedRegion((prev) => ({ ...prev, name: editingRegionName.trim() }));
            }
            setEditingRegionId(null);
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        }
    };

    const handleDeleteRegion = async (regionId) => {
        try {
            const resp = await axios.delete(route("region.destroy", { region: regionId }));
            setRegions((prev) => prev.filter((r) => r.id !== regionId));
            if (selectedRegion?.id === regionId) setSelectedRegion(null);
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        } finally {
            setDeleteTarget(null);
        }
    };

    // --- Area CRUD ---
    const handleAddArea = async () => {
        if (!newAreaName.trim()) return;
        try {
            const resp = await axios.post(route("area.store"), {
                area: newAreaName.trim(),
                region_id: selectedRegion?.id || null,
            });
            const newArea = { ...resp.data.area, locations: [] };
            setAreas((prev) => [...prev, newArea]);
            setSelectedArea(newArea);
            setNewAreaName("");
            setAddingArea(false);
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        }
    };

    const handleUpdateArea = async (areaId) => {
        if (!editingAreaName.trim()) return;
        try {
            const resp = await axios.put(
                route("area.update", { area: areaId }),
                { area: editingAreaName.trim() }
            );
            setAreas((prev) =>
                prev.map((a) =>
                    a.id === areaId ? { ...a, area: editingAreaName.trim() } : a
                )
            );
            if (selectedArea?.id === areaId) {
                setSelectedArea((prev) => ({ ...prev, area: editingAreaName.trim() }));
            }
            setEditingAreaId(null);
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        }
    };

    const handleMoveAreaRegion = async (area, regionId) => {
        try {
            const resp = await axios.put(route("area.update", { area: area.id }), {
                area: area.area,
                region_id: regionId || null,
            });
            const region = regions.find((r) => String(r.id) === String(regionId));
            setAreas((prev) =>
                prev.map((a) =>
                    a.id === area.id
                        ? { ...a, region_id: regionId || null, region: region || null }
                        : a
                )
            );
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        }
    };

    const handleDeleteArea = async (areaId) => {
        try {
            const resp = await axios.delete(route("area.destroy", { area: areaId }));
            const newAreas = areas.filter((a) => a.id !== areaId);
            setAreas(newAreas);
            if (selectedArea?.id === areaId) setSelectedArea(null);
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        } finally {
            setDeleteTarget(null);
        }
    };

    // --- Location CRUD ---
    const handleAddLocation = async () => {
        if (!newLocationName.trim() || !selectedArea) return;
        try {
            const resp = await axios.post(route("location.store"), {
                location: newLocationName.trim(),
                area_id: selectedArea.id,
            });
            const newLoc = resp.data.location;
            setAreas((prev) =>
                prev.map((a) =>
                    a.id === selectedArea.id
                        ? { ...a, locations: [...(a.locations || []), newLoc] }
                        : a
                )
            );
            setNewLocationName("");
            setAddingLocation(false);
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        }
    };

    const handleUpdateLocation = async (locationId) => {
        if (!editingLocationName.trim()) return;
        try {
            const resp = await axios.put(
                route("location.update", { location: locationId }),
                { location: editingLocationName.trim() }
            );
            setAreas((prev) =>
                prev.map((a) => ({
                    ...a,
                    locations: (a.locations || []).map((l) =>
                        l.id === locationId
                            ? { ...l, location: editingLocationName.trim() }
                            : l
                    ),
                }))
            );
            setEditingLocationId(null);
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        }
    };

    const handleMoveLocationArea = async (location, newAreaId) => {
        if (!newAreaId || String(newAreaId) === String(selectedArea?.id)) return;
        try {
            const resp = await axios.put(
                route("location.update", { location: location.id }),
                { location: location.location, area_id: newAreaId }
            );
            setAreas((prev) =>
                prev.map((a) => {
                    if (a.id === selectedArea.id) {
                        return {
                            ...a,
                            locations: (a.locations || []).filter((l) => l.id !== location.id),
                        };
                    }
                    if (String(a.id) === String(newAreaId)) {
                        return {
                            ...a,
                            locations: [...(a.locations || []), { ...location, area_id: newAreaId }],
                        };
                    }
                    return a;
                })
            );
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        }
    };

    const handleDeleteLocation = async (locationId) => {
        try {
            const resp = await axios.delete(
                route("location.destroy", { location: locationId })
            );
            setAreas((prev) =>
                prev.map((a) => ({
                    ...a,
                    locations: (a.locations || []).filter((l) => l.id !== locationId),
                }))
            );
            addToast(resp.data);
        } catch (e) {
            handleError(e);
        } finally {
            setDeleteTarget(null);
        }
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        if (deleteTarget.type === "region") handleDeleteRegion(deleteTarget.id);
        else if (deleteTarget.type === "area") handleDeleteArea(deleteTarget.id);
        else if (deleteTarget.type === "location") handleDeleteLocation(deleteTarget.id);
    };

    if (loading) {
        return (
            <div className="bg-white flex items-center justify-center rounded-lg border shadow-lg p-10 text-gray-400">
                Loading...
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row w-full gap-6 md:gap-8">
            {/* Region panel */}
            <div className="md:w-1/4 w-full bg-white border shadow-md rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#e8edfc] text-primary p-1.5 rounded-md border border-[#c9d6f7]">
                            <FaGlobeAsia className="text-xl" />
                        </div>
                        <h2 className="font-bold text-base text-gray-700">Region</h2>
                    </div>
                    <button
                        onClick={() => { setAddingRegion(true); setNewRegionName(""); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-primary bg-primary text-white text-sm rounded-md hover:bg-blue-800 transition-colors"
                    >
                        <FaPlus className="text-xs" /> Add
                    </button>
                </div>

                {addingRegion && (
                    <div className="flex items-center gap-2 mb-3">
                        <input
                            autoFocus
                            type="text"
                            value={newRegionName}
                            onChange={(e) => setNewRegionName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddRegion();
                                if (e.key === "Escape") setAddingRegion(false);
                            }}
                            placeholder="New region name"
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button onClick={handleAddRegion} className="border border-green-600 bg-green-50 rounded px-2 py-1 text-green-700 hover:bg-green-100">
                            <FaCheck />
                        </button>
                        <button onClick={() => setAddingRegion(false)} className="border border-red-500 bg-red-50 rounded px-2 py-1 text-red-600 hover:bg-red-100">
                            <FaTimes />
                        </button>
                    </div>
                )}

                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                    <button
                        onClick={() => setSelectedRegion(null)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 border ${
                            !selectedRegion ? "bg-blue-100 text-gray-800 border-blue-300" : "bg-gray-100 hover:bg-blue-50 text-gray-600 border-gray-200"
                        }`}
                    >
                        All Regions
                    </button>
                    {regions.map((item) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-2 w-full px-3 py-2 rounded-md border transition-all duration-150 ${
                                selectedRegion?.id === item.id
                                    ? "bg-blue-100 border-blue-300"
                                    : "bg-gray-100 hover:bg-blue-50 border-gray-200"
                            }`}
                        >
                            {editingRegionId === item.id ? (
                                <>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editingRegionName}
                                        onChange={(e) => setEditingRegionName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleUpdateRegion(item.id);
                                            if (e.key === "Escape") setEditingRegionId(null);
                                        }}
                                        className="flex-1 px-2 py-0.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <button
                                        onClick={() => handleUpdateRegion(item.id)}
                                        className="border border-green-600 bg-green-50 rounded px-1.5 py-1 text-green-700 hover:bg-green-100 flex-shrink-0"
                                    >
                                        <FaCheck className="text-xs" />
                                    </button>
                                    <button
                                        onClick={() => setEditingRegionId(null)}
                                        className="border border-red-500 bg-red-50 rounded px-1.5 py-1 text-red-600 hover:bg-red-100 flex-shrink-0"
                                    >
                                        <FaTimes className="text-xs" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setSelectedRegion(item)}
                                        className="flex-1 text-left text-gray-800 font-medium text-sm truncate border border-transparent bg-transparent"
                                    >
                                        {item.name}
                                    </button>
                                    <button
                                        onClick={() => { setEditingRegionId(item.id); setEditingRegionName(item.name); }}
                                        className="border border-gray-300 bg-white rounded px-1.5 py-1 text-gray-500 hover:text-primary flex-shrink-0"
                                    >
                                        <FaPencilAlt className="text-xs" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget({ type: "region", id: item.id, label: item.name })}
                                        className="border border-gray-300 bg-white rounded px-1.5 py-1 text-gray-500 hover:text-red-500 flex-shrink-0"
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                    {regions.length === 0 && (
                        <p className="text-gray-400 italic text-sm">No regions yet.</p>
                    )}
                </div>
            </div>

            {/* Area panel */}
            <div className="md:w-1/4 w-full bg-white border shadow-md rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#e8edfc] text-primary p-1.5 rounded-md border border-[#c9d6f7]">
                            <FaMapPin className="text-xl" />
                        </div>
                        <h2 className="font-bold text-base text-gray-700">Area</h2>
                    </div>
                    <button
                        onClick={() => { setAddingArea(true); setNewAreaName(""); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-primary bg-primary text-white text-sm rounded-md hover:bg-blue-800 transition-colors"
                    >
                        <FaPlus className="text-xs" /> Add
                    </button>
                </div>

                {addingArea && (
                    <div className="flex items-center gap-2 mb-3">
                        <input
                            autoFocus
                            type="text"
                            value={newAreaName}
                            onChange={(e) => setNewAreaName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddArea();
                                if (e.key === "Escape") setAddingArea(false);
                            }}
                            placeholder="New area name"
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button onClick={handleAddArea} className="border border-green-600 bg-green-50 rounded px-2 py-1 text-green-700 hover:bg-green-100">
                            <FaCheck />
                        </button>
                        <button onClick={() => setAddingArea(false)} className="border border-red-500 bg-red-50 rounded px-2 py-1 text-red-600 hover:bg-red-100">
                            <FaTimes />
                        </button>
                    </div>
                )}

                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                    {filteredAreas.map((item) => (
                        <div
                            key={item.id}
                            className={`flex flex-col gap-1.5 w-full px-3 py-2 rounded-md border transition-all duration-150 ${
                                selectedArea?.id === item.id
                                    ? "bg-blue-100 border-blue-300"
                                    : "bg-gray-100 hover:bg-blue-50 border-gray-200"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                {editingAreaId === item.id ? (
                                    <>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editingAreaName}
                                            onChange={(e) => setEditingAreaName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleUpdateArea(item.id);
                                                if (e.key === "Escape") setEditingAreaId(null);
                                            }}
                                            className="flex-1 px-2 py-0.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <button
                                            onClick={() => handleUpdateArea(item.id)}
                                            className="border border-green-600 bg-green-50 rounded px-1.5 py-1 text-green-700 hover:bg-green-100 flex-shrink-0"
                                        >
                                            <FaCheck className="text-xs" />
                                        </button>
                                        <button
                                            onClick={() => setEditingAreaId(null)}
                                            className="border border-red-500 bg-red-50 rounded px-1.5 py-1 text-red-600 hover:bg-red-100 flex-shrink-0"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setSelectedArea(item)}
                                            className="flex-1 text-left text-gray-800 font-medium text-sm truncate border border-transparent bg-transparent"
                                        >
                                            {item.area}
                                        </button>
                                        <button
                                            onClick={() => { setEditingAreaId(item.id); setEditingAreaName(item.area); }}
                                            className="border border-gray-300 bg-white rounded px-1.5 py-1 text-gray-500 hover:text-primary flex-shrink-0"
                                        >
                                            <FaPencilAlt className="text-xs" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget({ type: "area", id: item.id, label: item.area })}
                                            className="border border-gray-300 bg-white rounded px-1.5 py-1 text-gray-500 hover:text-red-500 flex-shrink-0"
                                        >
                                            <FaTrash className="text-xs" />
                                        </button>
                                    </>
                                )}
                            </div>
                            <select
                                value={item.region_id || ""}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleMoveAreaRegion(item, e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white text-gray-600"
                                title="Move to region"
                            >
                                <option value="">-- No Region --</option>
                                {regions.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                    {filteredAreas.length === 0 && (
                        <p className="text-gray-400 italic text-sm">No areas yet.</p>
                    )}
                </div>
            </div>

            {/* Location panel */}
            <div className="md:w-1/2 w-full bg-white border shadow-md rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#e8edfc] text-primary p-1.5 rounded-md border border-[#c9d6f7]">
                            <FaMapMarkedAlt className="text-xl" />
                        </div>
                        <div>
                            <h2 className="font-bold text-base text-gray-700">Locations</h2>
                            {selectedArea && (
                                <p className="text-xs text-gray-400 mt-0.5">{selectedArea.area}</p>
                            )}
                        </div>
                    </div>
                    {selectedArea && (
                        <button
                            onClick={() => { setAddingLocation(true); setNewLocationName(""); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-secondary bg-secondary text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                        >
                            <FaPlus className="text-xs" /> Add
                        </button>
                    )}
                </div>

                {addingLocation && (
                    <div className="flex items-center gap-2 mb-3">
                        <input
                            autoFocus
                            type="text"
                            value={newLocationName}
                            onChange={(e) => setNewLocationName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddLocation();
                                if (e.key === "Escape") setAddingLocation(false);
                            }}
                            placeholder="New location name"
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                        <button onClick={handleAddLocation} className="border border-green-600 bg-green-50 rounded px-2 py-1 text-green-700 hover:bg-green-100">
                            <FaCheck />
                        </button>
                        <button onClick={() => setAddingLocation(false)} className="border border-red-500 bg-red-50 rounded px-2 py-1 text-red-600 hover:bg-red-100">
                            <FaTimes />
                        </button>
                    </div>
                )}

                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                    {filteredLocations.length > 0 ? (
                        filteredLocations.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-blue-50 border border-blue-200 shadow-sm"
                            >
                                {editingLocationId === item.id ? (
                                    <>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editingLocationName}
                                            onChange={(e) => setEditingLocationName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleUpdateLocation(item.id);
                                                if (e.key === "Escape") setEditingLocationId(null);
                                            }}
                                            className="flex-1 px-2 py-0.5 border border-blue-300 rounded text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <button
                                            onClick={() => handleUpdateLocation(item.id)}
                                            className="border border-green-600 bg-green-50 rounded px-1.5 py-1 text-green-700 hover:bg-green-100 flex-shrink-0"
                                        >
                                            <FaCheck className="text-xs" />
                                        </button>
                                        <button
                                            onClick={() => setEditingLocationId(null)}
                                            className="border border-red-500 bg-red-50 rounded px-1.5 py-1 text-red-600 hover:bg-red-100 flex-shrink-0"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 text-sm text-blue-800 font-medium">
                                            {item.location}
                                        </span>
                                        <select
                                            value={selectedArea?.id || ""}
                                            onChange={(e) => handleMoveLocationArea(item, e.target.value)}
                                            className="px-2 py-1 border border-blue-300 rounded text-xs bg-white text-gray-600 flex-shrink-0"
                                            title="Move to area"
                                        >
                                            {areas.map((a) => (
                                                <option key={a.id} value={a.id}>
                                                    {a.area}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => { setEditingLocationId(item.id); setEditingLocationName(item.location); }}
                                            className="border border-blue-300 bg-white rounded px-1.5 py-1 text-blue-400 hover:text-primary flex-shrink-0"
                                        >
                                            <FaPencilAlt className="text-xs" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget({ type: "location", id: item.id, label: item.location })}
                                            className="border border-blue-300 bg-white rounded px-1.5 py-1 text-blue-400 hover:text-red-500 flex-shrink-0"
                                        >
                                            <FaTrash className="text-xs" />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 italic text-sm">
                            {selectedArea
                                ? "No locations for this area."
                                : "Select an area to view locations."}
                        </p>
                    )}
                </div>
            </div>

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
