import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "@/Components/Loading";
import TableComponent from "@/Components/TableComponent";
import { useToast } from "@/Components/Toast/ToastProvider";
import StatusPill from "@/Components/StatusPill";

// Tab "Unit Placement" -- 1 baris per unit, nunjukin unit itu lagi di client
// mana / workshop mana / belum ditempatkan sama sekali, plus bisa pindahin
// lewat dropdown "Move to" langsung dari tabel ini. Bukan pengganti List of
// Unit (yang punya edit penuh region/area), cuma view ringkas buat lihat &
// pindahin penempatan client/workshop-nya.
const UnitPlacementTab = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [placement, setPlacement] = useState({
        clients: [],
        workshops: [],
        unassigned: [],
    });
    const [movePick, setMovePick] = useState({});
    const [busyUnitId, setBusyUnitId] = useState(null);
    const [groupFilter, setGroupFilter] = useState("");

    const fetchPlacement = async () => {
        setLoading(true);
        try {
            const resp = await axios.get(route("unit.placement.get"));
            setPlacement(resp.data || { clients: [], workshops: [], unassigned: [] });
        } catch (e) {
            console.error(e);
            addToast({ type: "error", text: "Failed to load unit placement." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlacement();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUnassign = async (unit_id) => {
        setBusyUnitId(unit_id);
        try {
            await axios.post(route("unit.position.remove"), {
                unit_ids: [unit_id],
            });
            addToast({ type: "success", text: "Unit unassigned." });
            fetchPlacement();
        } catch (e) {
            console.error(e);
            addToast({ type: "error", text: "Failed to unassign unit." });
        } finally {
            setBusyUnitId(null);
        }
    };

    const handleMove = async (unit_id) => {
        const pick = movePick[unit_id];
        if (!pick) return;
        const [type, id] = pick.split(":");
        setBusyUnitId(unit_id);
        try {
            await axios.post(route("unit.position.add"), {
                unit_ids: [unit_id],
                client_id: type === "client" ? id : null,
                workshop_id: type === "workshop" ? id : null,
            });
            addToast({ type: "success", text: "Unit moved." });
            setMovePick((prev) => ({ ...prev, [unit_id]: "" }));
            fetchPlacement();
        } catch (e) {
            console.error(e);
            addToast({ type: "error", text: "Failed to move unit." });
        } finally {
            setBusyUnitId(null);
        }
    };

    // Ratakan clients/workshops/unassigned jadi 1 array baris, masing-masing
    // bawa info groupnya sendiri (dipakai kolom Placement & buat exclude diri
    // sendiri dari pilihan "Move to").
    const rows = [
        ...placement.clients.flatMap((c) =>
            c.units.map((u) => ({
                ...u,
                group_type: "client",
                group_id: c.client_id,
                group_name: c.name,
            })),
        ),
        ...placement.workshops.flatMap((w) =>
            w.units.map((u) => ({
                ...u,
                group_type: "workshop",
                group_id: w.workshop_id,
                group_name: w.name,
            })),
        ),
        ...placement.unassigned.map((u) => ({
            ...u,
            group_type: "unassigned",
            group_id: null,
            group_name: "Unassigned",
        })),
    ];

    const moveOptions = [
        ...placement.clients.map((c) => ({
            value: `client:${c.client_id}`,
            label: `Client: ${c.name}`,
        })),
        ...placement.workshops.map((w) => ({
            value: `workshop:${w.workshop_id}`,
            label: `Workshop: ${w.name}`,
        })),
    ];

    const filterOptions = [
        ...placement.clients.map((c) => ({
            value: `client:${c.client_id}`,
            label: `Client: ${c.name}`,
        })),
        ...placement.workshops.map((w) => ({
            value: `workshop:${w.workshop_id}`,
            label: `Workshop: ${w.name}`,
        })),
        { value: "unassigned", label: "Unassigned" },
    ];

    const filteredRows = groupFilter
        ? rows.filter((row) =>
              groupFilter === "unassigned"
                  ? row.group_type === "unassigned"
                  : `${row.group_type}:${row.group_id}` === groupFilter,
          )
        : rows;

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
            name: "unit",
            header: "Unit",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "18%",
            Cell: (row) => <span className="font-medium">{row.unit}</span>,
        },
        {
            name: "status",
            header: "Status",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            sortable: true,
            width: "12%",
            Cell: (row) => <StatusPill request_type={row.status || "-"} />,
        },
        {
            name: "group_name",
            header: "Client",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "25%",
            Cell: (row) => {
                if (row.group_type === "unassigned") {
                    return (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                            Unassigned
                        </span>
                    );
                }
                const badgeClass =
                    row.group_type === "client"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700";
                return (
                    <span className="flex items-center gap-2">
                        {row.group_name}
                        <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}`}
                        >
                            {row.group_type === "client" ? "Client" : "Workshop"}
                        </span>
                    </span>
                );
            },
        },
        {
            name: "move_to",
            header: "Move To",
            headerClassName: "bg-primary text-white",
            sortable: false,
            width: "22%",
            Cell: (row) => (
                <div className="flex items-center gap-2">
                    <select
                        className="border border-gray-300 rounded-md px-2 py-1 text-xs bg-white flex-1"
                        value={movePick[row.unit_id] || ""}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                            setMovePick((prev) => ({
                                ...prev,
                                [row.unit_id]: e.target.value,
                            }))
                        }
                    >
                        <option value="">-- Select --</option>
                        {moveOptions
                            .filter((opt) => opt.value !== `${row.group_type}:${row.group_id}`)
                            .map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                    </select>
                    <button
                        type="button"
                        disabled={!movePick[row.unit_id] || busyUnitId === row.unit_id}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleMove(row.unit_id);
                        }}
                        className="border border-primary bg-primary text-white text-xs px-2 py-1 rounded-md disabled:opacity-40"
                    >
                        Move
                    </button>
                </div>
            ),
        },
        {
            name: "unassign",
            header: "",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            sortable: false,
            width: "10%",
            Cell: (row) => {
                if (row.group_type === "unassigned") return null;
                return (
                    <button
                        type="button"
                        disabled={busyUnitId === row.unit_id}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleUnassign(row.unit_id);
                        }}
                        className="border border-danger bg-white text-danger px-2 py-1 rounded-md text-xs disabled:opacity-40"
                    >
                        Unassign
                    </button>
                );
            },
        },
    ];

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <TableComponent
            title="Unit Placement"
            data={filteredRows}
            columns={columns}
            customFilter={
                <select
                    className="border-none focus:border-none outline-none focus:outline-none text-sm md:text-base"
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                >
                    <option value="">-- All --</option>
                    {filterOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            }
        />
    );
};

export default UnitPlacementTab;
