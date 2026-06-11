import Card from "@/Components/Card";
import {
    DateTimeInput,
    editRequestItems,
    getCurrDateTime,
    getFormattedDate,
    getRequestTypeName,
} from "@/Components/utils/dashboard-util";
import Modal from "@/Components/Modal";
import PageLayout from "@/Layouts/PageLayout";
import { useForm } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import tColumns from "@/Components/utils/Request/columns";
import TableComponent from "@/Components/TableComponent";
import SavingView from "@/Components/SavingView";
import { useToast } from "@/Components/Toast/ToastProvider";
import { useAuth } from "@/Components/Auth/auth";
import axios from "axios";
import LoadingSpinner from "@/Components/Loading";
import StatusPill from "@/Components/StatusPill";
import { EditItem } from "@/Pages/Request/Request";

const OnGoingEvent = ({ data }) => {
    const [isModal, setModal] = useState(false);
    const [selectedItem, setItem] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [saving, setSaving] = useState(false);
    const [allData, setAllData] = useState(data);
    const [runningEvent, setRunningEvent] = useState([]);
    const [eventHistory, setEventHistory] = useState([]);
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleSelect = (itemData) => {
        setModal(true);
        setItem(itemData);
    };

    const { user, loading } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        const currentRunningEvent = allData.filter(
            (item) => item.status === "Ongoing",
        );
        setRunningEvent(currentRunningEvent);
        const pastEvents = allData.filter((item) => item.status === "End");
        setEventHistory(pastEvents);
    }, [allData]);

    if (loading) {
        return <LoadingSpinner />;
    }

    const handleSeen = async (id) => {
        if (!id) return;
        try {
            const resp = await axios.post(route("request.seen", id));
            if (resp) {
                addToast(resp.data);
                setAllData((prev) =>
                    prev.map((item) =>
                        item.request_id === id
                            ? {
                                  ...item,
                                  seenStatus: !item.seenStatus,
                              }
                            : item,
                    ),
                );
            }
        } catch (e) {
            console.error(e);
            addToast(e.response.data || e.response.data.message);
        }
    };

    const handleCheckItem = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const handleSelectAll = () => {
        if (selectedRows.length === allData.length) {
            // Unselect all
            setSelectedRows([]);
        } else {
            // Select all
            setSelectedRows(allData.map((item) => item.request_id));
        }
    };

    const handleMoveToHistory = async () => {
        if (selectedRows.length === 0) {
            return addToast({ type: "error", message: "No rows selected" });
        }

        try {
            // Only allow rows where status === "End"
            const validIds = allData
                .filter(
                    (item) =>
                        selectedRows.includes(item.request_id) &&
                        item.status === "End",
                )
                .map((item) => item.request_id);

            if (validIds.length === 0) {
                return addToast({
                    type: "error",
                    text: "Only ended requests can be deleted.",
                });
            } else {
                const resp = await axios.post(route("request.moveToHistory"), {
                    ids: validIds,
                });

                addToast(resp.data);

                // Remove only valid (moved) items from the table
                setAllData((prev) =>
                    prev.filter((item) => !validIds.includes(item.request_id)),
                );

                // Clear selected rows
                setSelectedRows([]);

                window.location.reload();
            }
        } catch (e) {
            console.error(e);
            addToast(e.response?.data?.message || "Something went wrong");
        }
    };

    const getDuration = (start_date, start_time, end_date, end_time) => {
        const start = new Date(`${start_date}T${start_time}`);
        const end = new Date(`${end_date}T${end_time}`);

        let diffMs = 0;
        if (end_date && end_time) {
            diffMs = end - start;
        } else {
            diffMs = dateTime - start;
        }

        const diffSec = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSec / 3600);
        const minutes = Math.floor((diffSec % 3600) / 60);

        const formatted = `${hours.toString().padStart(2, "0")} ${
            hours > 0 ? "hours" : "hour"
        }  ${minutes.toString().padStart(2, "0")} ${
            minutes > 0 ? "minutes" : "minute"
        }`;

        return formatted;
    };

    const columns = tColumns({
        handleSelect,
        user,
        handleSeen,
        handleSelectAll,
        selectedRows,
        handleCheckItem,
        allData,
        getDuration,
        isEdit: isEdit,
    });

    return (
        <div>
            <TableComponent
                height="35vh"
                title="ONGOING EVENT"
                columns={columns}
                onRowClick={(item) =>
                    isEdit
                        ? handleCheckItem(item?.request_id)
                        : handleSelect(item)
                }
                data={runningEvent ? runningEvent : []}
            />
            <EditItem
                user={user}
                selectedItem={selectedItem}
                setModal={setModal}
                isModal={isModal}
                setSaving={setSaving}
                allData={allData}
                setAllData={setAllData}
            />
            {saving && <SavingView />}
        </div>
    );
};

export default OnGoingEvent;
