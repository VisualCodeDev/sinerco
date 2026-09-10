import React, { useEffect, useState } from "react";
import axios from "axios";
import PageLayout from "@/Layouts/PageLayout";
import TableComponent from "@/Components/TableComponent";
import LoadingSpinner from "@/Components/Loading";
import { useToast } from "@/Components/Toast/ToastProvider";

// Label ramah baca buat tiap jenis perubahan -- sama seperti yang dipakai di
// UnitHistoryModal (List of Unit), lihat action yang dikirim UnitMovementLogger
// di backend.
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

const MovementLog = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const fetchLogs = async (page = 1, filters = {}) => {
        setLoading(true);
        try {
            const resp = await axios.get(route("unit.movement.log"), {
                params: {
                    page,
                    date_from: filters.dateFrom ?? dateFrom ?? "",
                    date_to: filters.dateTo ?? dateTo ?? "",
                },
            });
            setLogs(resp.data?.data || []);
            setPagination(resp.data);
        } catch (e) {
            console.error(e);
            addToast({ type: "error", text: "Failed to load movement log." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDateChange = (field, value) => {
        const next = {
            dateFrom: field === "dateFrom" ? value : dateFrom,
            dateTo: field === "dateTo" ? value : dateTo,
        };
        if (field === "dateFrom") setDateFrom(value);
        else setDateTo(value);
        fetchLogs(1, next);
    };

    const columns = [
        {
            name: "no",
            header: "No.",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            width: "4%",
            Cell: ({ index }) =>
                index + 1 + ((pagination?.current_page || 1) - 1) * (pagination?.per_page || 30),
        },
        {
            name: "unit",
            header: "Unit",
            headerClassName: "bg-primary text-white",
            width: "10%",
            Cell: (log) => <span className="font-medium">{log.unit?.unit || "-"}</span>,
        },
        {
            name: "action",
            header: "Action",
            headerClassName: "bg-primary text-white",
            width: "16%",
            Cell: (log) => (
                <span className="font-semibold text-primary text-sm">
                    {MOVEMENT_ACTION_LABEL[log.action] || log.action}
                </span>
            ),
        },
        {
            name: "from",
            header: "From",
            headerClassName: "bg-primary text-white",
            width: "24%",
            Cell: (log) => <span className="text-xs text-gray-500">{describe(log, "from")}</span>,
        },
        {
            name: "to",
            header: "To",
            headerClassName: "bg-primary text-white",
            width: "24%",
            Cell: (log) => <span className="text-xs text-gray-500">{describe(log, "to")}</span>,
        },
        {
            name: "changed_by",
            header: "By",
            headerClassName: "bg-primary text-white",
            width: "10%",
            Cell: (log) => log.changedByUser?.name || "-",
        },
        {
            name: "created_at",
            header: "When",
            headerClassName: "bg-primary text-white",
            width: "12%",
            Cell: (log) => new Date(log.created_at).toLocaleString(),
        },
    ];

    const paginationFooter = pagination && pagination.last_page > 1 && (
        <div className="sticky bottom-0 left-0 bg-white border-t flex items-center justify-between flex-wrap gap-2 px-6 py-4 rounded-b-lg">
            <p className="text-sm text-gray-500">
                Page {pagination.current_page} of {pagination.last_page} (
                {pagination.total} entries)
            </p>
            <div className="flex gap-1 flex-wrap">
                {pagination.links.map((link, i) => (
                    <button
                        key={i}
                        disabled={!link.url}
                        onClick={() => {
                            const url = new URL(link.url);
                            fetchLogs(url.searchParams.get("page") || 1);
                        }}
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
        <PageLayout>
            {loading && logs.length === 0 ? (
                <LoadingSpinner />
            ) : (
                <TableComponent
                    title="Unit Movement Log"
                    height="65vh"
                    data={logs}
                    columns={columns}
                    Footer={paginationFooter}
                    defaultSort={{ key: "created_at", direction: "desc" }}
                    customFilter={
                        <div className="flex items-center gap-1.5 text-sm">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) =>
                                    handleDateChange("dateFrom", e.target.value)
                                }
                                className="border-none focus:border-none outline-none focus:outline-none text-sm md:text-base bg-transparent"
                            />
                            <span className="text-gray-400">to</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) =>
                                    handleDateChange("dateTo", e.target.value)
                                }
                                className="border-none focus:border-none outline-none focus:outline-none text-sm md:text-base bg-transparent"
                            />
                        </div>
                    }
                />
            )}
        </PageLayout>
    );
};

export default MovementLog;
