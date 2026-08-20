import {
    FaMapPin,
    FaMapMarkedAlt,
    FaGlobeAsia,
    FaAngleDown,
    FaAngleUp,
    FaPlus,
    FaTrash,
    FaPencilAlt,
    FaCheck,
    FaTimes,
    FaBoxes,
} from "react-icons/fa";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { useToast } from "@/Components/Toast/ToastProvider";

const Location = ({ areas: initialAreas, regions: initialRegions }) => {
    const [areas, setAreas] = useState(initialAreas || []);
    const [regions, setRegions] = useState(initialRegions || []);
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

    const [mobileRegionExpanded, setMobileRegionExpanded] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState(false);

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
        if (!window.confirm("Delete this region?")) return;
        try {
            const resp = await axios.delete(route("region.destroy", { region: regionId }));
            setRegions((prev) => prev.filter((r) => r.id !== regionId));
            if (selectedRegion?.id === regionId) setSelectedRegion(null);
            addToast(resp.data);
        } catch (e) {
            handleError(e);
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
        if (!window.confirm("Delete this area? All its locations will also be deleted.")) return;
        try {
            const resp = await axios.delete(route("area.destroy", { area: areaId }));
            const newAreas = areas.filter((a) => a.id !== areaId);
            setAreas(newAreas);
            if (selectedArea?.id === areaId) setSelectedArea(null);
            addToast(resp.data);
        } catch (e) {
            handleError(e);
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
        if (!window.confirm("Delete this location?")) return;
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
        }
    };

    return (
        <PageLayout>
            <div className="flex flex-col md:flex-row w-full h-full p-4 gap-6 md:gap-8 min-h-[90vh]">
                {/* Region panel — desktop */}
                <div className="md:w-1/4 w-full bg-white shadow-md rounded-lg p-6 md:p-8 lg:block hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#e8edfc] text-primary p-1.5 rounded-md">
                                <FaGlobeAsia className="text-2xl md:text-3xl" />
                            </div>
                            <h2 className="font-bold text-base md:text-2xl text-gray-700">
                                Region
                            </h2>
                        </div>
                        <button
                            onClick={() => { setAddingRegion(true); setNewRegionName(""); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-blue-800 transition-colors"
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
                            <button onClick={handleAddRegion} className="text-green-600 hover:text-green-800">
                                <FaCheck />
                            </button>
                            <button onClick={() => setAddingRegion(false)} className="text-red-500 hover:text-red-700">
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                        <button
                            onClick={() => setSelectedRegion(null)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                                !selectedRegion ? "bg-blue-100 text-gray-800" : "bg-gray-100 hover:bg-blue-50 text-gray-600"
                            }`}
                        >
                            All Regions
                        </button>
                        {regions.map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-center gap-2 w-full px-3 py-2 rounded-md transition-all duration-150 group ${
                                    selectedRegion?.id === item.id
                                        ? "bg-blue-100"
                                        : "bg-gray-100 hover:bg-blue-50"
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
                                            className="text-green-600 hover:text-green-800 flex-shrink-0"
                                        >
                                            <FaCheck className="text-xs" />
                                        </button>
                                        <button
                                            onClick={() => setEditingRegionId(null)}
                                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                                        >
                                            <FaTimes className="text-xs" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setSelectedRegion(item)}
                                            className="flex-1 text-left text-gray-800 font-medium text-sm truncate"
                                        >
                                            {item.name}
                                        </button>
                                        <button
                                            onClick={() => { setEditingRegionId(item.id); setEditingRegionName(item.name); }}
                                            className="text-gray-300 hover:text-primary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FaPencilAlt className="text-xs" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRegion(item.id)}
                                            className="text-gray-300 hover:text-red-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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

                {/* Region panel — mobile */}
                <div className="w-full bg-white shadow-md rounded-lg p-4 lg:hidden block">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-[#e8edfc] text-primary p-1.5 rounded-md">
                                <FaGlobeAsia />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-700">Region</h2>
                        </div>
                        <button
                            onClick={() => { setAddingRegion(true); setNewRegionName(""); setMobileRegionExpanded(false); }}
                            className="flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs rounded-md hover:bg-blue-800"
                        >
                            <FaPlus className="text-xs" /> Add
                        </button>
                    </div>

                    {addingRegion && (
                        <div className="flex items-center gap-2 mb-2">
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
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button onClick={handleAddRegion} className="text-green-600 hover:text-green-800">
                                <FaCheck />
                            </button>
                            <button onClick={() => setAddingRegion(false)} className="text-red-500 hover:text-red-700">
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    <div className="relative px-2">
                        <div
                            className="flex justify-between items-center cursor-pointer py-1"
                            onClick={() => setMobileRegionExpanded(!mobileRegionExpanded)}
                        >
                            <span className="font-medium text-gray-800">
                                {selectedRegion?.name || "All Regions"}
                            </span>
                            {mobileRegionExpanded ? <FaAngleUp /> : <FaAngleDown />}
                        </div>
                        {mobileRegionExpanded && (
                            <div className="absolute top-8 left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-[30vh] overflow-y-auto">
                                <button
                                    onClick={() => { setSelectedRegion(null); setMobileRegionExpanded(false); }}
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm font-medium text-gray-800"
                                >
                                    All Regions
                                </button>
                                {regions.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-1 px-3 py-2 hover:bg-blue-50"
                                    >
                                        <button
                                            onClick={() => { setSelectedRegion(item); setMobileRegionExpanded(false); }}
                                            className="flex-1 text-left text-sm font-medium text-gray-800"
                                        >
                                            {item.name}
                                        </button>
                                        <button
                                            onClick={() => { setEditingRegionId(item.id); setEditingRegionName(item.name); setMobileRegionExpanded(false); }}
                                            className="text-gray-400 hover:text-primary"
                                        >
                                            <FaPencilAlt className="text-xs" />
                                        </button>
                                        <button
                                            onClick={() => { handleDeleteRegion(item.id); setMobileRegionExpanded(false); }}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <FaTrash className="text-xs" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Area panel — desktop */}
                <div className="md:w-1/4 w-full bg-white shadow-md rounded-lg p-6 md:p-8 lg:block hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#e8edfc] text-primary p-1.5 rounded-md">
                                <FaMapPin className="text-2xl md:text-3xl" />
                            </div>
                            <h2 className="font-bold text-base md:text-2xl text-gray-700">
                                Area
                            </h2>
                        </div>
                        <button
                            onClick={() => { setAddingArea(true); setNewAreaName(""); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-blue-800 transition-colors"
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
                            <button onClick={handleAddArea} className="text-green-600 hover:text-green-800">
                                <FaCheck />
                            </button>
                            <button onClick={() => setAddingArea(false)} className="text-red-500 hover:text-red-700">
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                        {filteredAreas.map((item) => (
                            <div
                                key={item.id}
                                className={`flex flex-col gap-1.5 w-full px-3 py-2 rounded-md transition-all duration-150 group ${
                                    selectedArea?.id === item.id
                                        ? "bg-blue-100"
                                        : "bg-gray-100 hover:bg-blue-50"
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
                                                className="text-green-600 hover:text-green-800 flex-shrink-0"
                                            >
                                                <FaCheck className="text-xs" />
                                            </button>
                                            <button
                                                onClick={() => setEditingAreaId(null)}
                                                className="text-red-500 hover:text-red-700 flex-shrink-0"
                                            >
                                                <FaTimes className="text-xs" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setSelectedArea(item)}
                                                className="flex-1 text-left text-gray-800 font-medium text-sm truncate"
                                            >
                                                {item.area}
                                            </button>
                                            <button
                                                onClick={() => { setEditingAreaId(item.id); setEditingAreaName(item.area); }}
                                                className="text-gray-300 hover:text-primary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FaPencilAlt className="text-xs" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteArea(item.id)}
                                                className="text-gray-300 hover:text-red-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                    className="w-full px-2 py-1 border border-gray-200 rounded text-xs bg-white text-gray-500"
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

                {/* Area panel — mobile */}
                <div className="w-full bg-white shadow-md rounded-lg p-4 lg:hidden block">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-[#e8edfc] text-primary p-1.5 rounded-md">
                                <FaMapPin />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-700">Area</h2>
                        </div>
                        <button
                            onClick={() => { setAddingArea(true); setNewAreaName(""); setMobileExpanded(false); }}
                            className="flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs rounded-md hover:bg-blue-800"
                        >
                            <FaPlus className="text-xs" /> Add
                        </button>
                    </div>

                    {addingArea && (
                        <div className="flex items-center gap-2 mb-2">
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
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button onClick={handleAddArea} className="text-green-600 hover:text-green-800">
                                <FaCheck />
                            </button>
                            <button onClick={() => setAddingArea(false)} className="text-red-500 hover:text-red-700">
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    <div className="relative px-2">
                        <div
                            className="flex justify-between items-center cursor-pointer py-1"
                            onClick={() => setMobileExpanded(!mobileExpanded)}
                        >
                            <span className="font-medium text-gray-800">
                                {selectedArea?.area || "Select area"}
                            </span>
                            {mobileExpanded ? <FaAngleUp /> : <FaAngleDown />}
                        </div>
                        {mobileExpanded && (
                            <div className="absolute top-8 left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-[30vh] overflow-y-auto">
                                {filteredAreas.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-1 px-3 py-2 hover:bg-blue-50"
                                    >
                                        <button
                                            onClick={() => { setSelectedArea(item); setMobileExpanded(false); }}
                                            className="flex-1 text-left text-sm font-medium text-gray-800"
                                        >
                                            {item.area}
                                        </button>
                                        <button
                                            onClick={() => { setEditingAreaId(item.id); setEditingAreaName(item.area); setMobileExpanded(false); }}
                                            className="text-gray-400 hover:text-primary"
                                        >
                                            <FaPencilAlt className="text-xs" />
                                        </button>
                                        <button
                                            onClick={() => { handleDeleteArea(item.id); setMobileExpanded(false); }}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <FaTrash className="text-xs" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Location panel */}
                <div className="md:w-1/2 w-full bg-white shadow-md rounded-lg p-4 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#e8edfc] text-primary p-1.5 rounded-md">
                                <FaMapMarkedAlt className="text-2xl md:text-3xl" />
                            </div>
                            <div>
                                <h2 className="font-bold text-base md:text-2xl text-gray-700">
                                    Locations
                                </h2>
                                {selectedArea && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {selectedArea.area}
                                    </p>
                                )}
                            </div>
                        </div>
                        {selectedArea && (
                            <button
                                onClick={() => { setAddingLocation(true); setNewLocationName(""); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-white text-sm rounded-md hover:bg-green-700 transition-colors"
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
                            <button onClick={handleAddLocation} className="text-green-600 hover:text-green-800">
                                <FaCheck />
                            </button>
                            <button onClick={() => setAddingLocation(false)} className="text-red-500 hover:text-red-700">
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                        {filteredLocations.length > 0 ? (
                            filteredLocations.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-blue-50 shadow-sm group"
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
                                                className="text-green-600 hover:text-green-800 flex-shrink-0"
                                            >
                                                <FaCheck className="text-xs" />
                                            </button>
                                            <button
                                                onClick={() => setEditingLocationId(null)}
                                                className="text-red-500 hover:text-red-700 flex-shrink-0"
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
                                                className="px-2 py-1 border border-blue-200 rounded text-xs bg-white text-gray-500 flex-shrink-0"
                                                title="Move to area"
                                            >
                                                {areas.map((a) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.area}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() =>
                                                    router.visit(
                                                        route(
                                                            "unit.area_location.setting",
                                                            { location_id: item.id }
                                                        )
                                                    )
                                                }
                                                title="Manage Units"
                                                className="text-blue-300 hover:text-primary flex-shrink-0"
                                            >
                                                <FaBoxes className="text-xs" />
                                            </button>
                                            <button
                                                onClick={() => { setEditingLocationId(item.id); setEditingLocationName(item.location); }}
                                                className="text-blue-200 hover:text-primary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FaPencilAlt className="text-xs" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLocation(item.id)}
                                                className="text-blue-200 hover:text-red-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
            </div>
        </PageLayout>
    );
};

export default Location;
