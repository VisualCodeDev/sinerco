import { useEffect, useMemo, useState } from "react";
import { FaMapMarkedAlt } from "react-icons/fa";
import PageLayout from "@/Layouts/PageLayout";
import LoadingSpinner from "@/Components/Loading";
import { useToast } from "@/Components/Toast/ToastProvider";

const RelocateUnit = () => {
    const [units, setUnits] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [unitId, setUnitId] = useState("");
    const [areaId, setAreaId] = useState("");
    const [locationId, setLocationId] = useState("");
    const { addToast } = useToast();

    useEffect(() => {
        const load = async () => {
            try {
                const [unitResp, areaResp] = await Promise.all([
                    axios.get(route("unit.get")),
                    axios.get(route("areas.get")),
                ]);
                setUnits(unitResp.data || []);
                setAreas(areaResp.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const selectedUnit = useMemo(
        () => units.find((u) => u.unit_id === unitId),
        [units, unitId]
    );

    const selectedArea = useMemo(
        () => areas.find((a) => a.id.toString() === areaId.toString()),
        [areas, areaId]
    );

    const handleAreaChange = (val) => {
        setAreaId(val);
        setLocationId("");
    };

    const handleSubmit = async () => {
        if (!unitId || !locationId) return;
        setSaving(true);
        try {
            const resp = await axios.post(route("unit.area_location.add", {
                location_id: locationId,
                unit_ids: [unitId],
            }));
            addToast(resp?.data);

            const loc = selectedArea?.locations?.find(
                (l) => l.id.toString() === locationId.toString()
            );
            setUnits((prev) =>
                prev.map((u) =>
                    u.unit_id === unitId
                        ? { ...u, location_id: locationId, location: loc?.location, area: selectedArea?.area }
                        : u
                )
            );
        } catch (e) {
            console.error(e);
            addToast({
                type: "error",
                text: e?.response?.data?.text || "Failed to relocate unit.",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <PageLayout>
            <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#e8edfc] text-primary p-1.5 rounded-md">
                        <FaMapMarkedAlt className="text-2xl" />
                    </div>
                    <h2 className="font-bold text-xl text-gray-700">
                        Relocate Unit
                    </h2>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Unit
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            value={unitId}
                            onChange={(e) => setUnitId(e.target.value)}
                        >
                            <option value="">-- Select Unit --</option>
                            {units.map((u) => (
                                <option key={u.unit_id} value={u.unit_id}>
                                    {u.unit}
                                </option>
                            ))}
                        </select>
                        {selectedUnit && (
                            <p className="text-xs text-gray-400 mt-1">
                                Current: {selectedUnit.location || "No location"}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Area
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            value={areaId}
                            onChange={(e) => handleAreaChange(e.target.value)}
                        >
                            <option value="">-- Select Area --</option>
                            {areas.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.area}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Location
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                            disabled={!selectedArea}
                        >
                            <option value="">-- Select Location --</option>
                            {selectedArea?.locations?.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.location}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!unitId || !locationId || saving}
                        className="mt-2 bg-primary text-white py-2 rounded-md hover:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {saving ? "Relocating..." : "Relocate"}
                    </button>
                </div>
            </div>
        </PageLayout>
    );
};

export default RelocateUnit;
