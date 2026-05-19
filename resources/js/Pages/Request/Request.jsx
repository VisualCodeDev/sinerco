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

const Request = ({ data }) => {
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
        <PageLayout>
            <div>
                <TableComponent
                    height="55vh"
                    title="ONGOING EVENT"
                    columns={columns}
                    data={runningEvent ? runningEvent : []}
                    onRowClick={(item) =>
                        isEdit
                            ? handleCheckItem(item?.request_id)
                            : handleSelect(item)
                    }
                />
            </div>
            <div className="mt-2">
                <TableComponent
                    height="55vh"
                    title="EVENT HISTORY"
                    columns={columns}
                    data={eventHistory || []}
                    edit={isEdit}
                    toggleEdit={() => setIsEdit(!isEdit)}
                    onRowClick={(item) =>
                        isEdit
                            ? handleCheckItem(item?.request_id)
                            : handleSelect(item)
                    }
                    handleMoveToHistory={handleMoveToHistory}
                    isRequestList={true}
                />
            </div>
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
        </PageLayout>
    );
};

const EditItem = ({
    selectedItem,
    setModal,
    isModal,
    setSaving,
    allData,
    setAllData,
    user,
}) => {
    const {
        data: formData,
        setData,
        post,
    } = useForm({
        ...selectedItem,
    });
    const { addToast } = useToast();
    const [type, setType] = useState("Edit");
    const accessEdit =
        user?.role === "super_admin" || user?.role === "technician";

    const updateData = async (isEdit) => {
        if (selectedItem) {
            setType(
                selectedItem?.status === "End" ? "View Request" : "End Request",
            );

            let { end_date, end_time, status } = selectedItem;
            const currDateTime = await getCurrDateTime();

            if (status !== "End") {
                if (!end_date && !end_time && currDateTime) {
                    end_date = currDateTime.date;
                    end_time = currDateTime.time;
                }
            }
            if (status === "End") {
                if (end_date && end_time) {
                    end_date = "";
                    end_time = "";
                }
            }
            if (accessEdit && !isEdit)
                setData({
                    ...selectedItem,
                });
            else
                setData({
                    ...selectedItem,
                    end_date,
                    end_time,
                });
        }
    };

    useEffect(() => {
        updateData();
    }, [selectedItem]);

    const handleChange = async (field, value) => {
        let currDateTime = null;

        if (field === "status" && value === "End") {
            currDateTime = await getCurrDateTime();
        }

        setData((prevData) => {
            const updatedData = { ...prevData, [field]: value };

            if (field === "status") {
                if (value !== "End" && prevData.end_time && prevData.end_date) {
                    updatedData.end_time = "";
                    updatedData.end_date = "";
                } else if (
                    value === "End" &&
                    !prevData.end_time &&
                    !prevData.end_date &&
                    currDateTime
                ) {
                    updatedData.end_time = currDateTime.time;
                    updatedData.end_date = currDateTime.date;
                }
            }

            return updatedData;
        });
    };

    const handleSave = async () => {
        // if (
        //     formData?.status != "End" &&
        //     (!formData?.end_date || !formData?.end_time)
        // ) {
        //     return alert("Please fill all the fields");
        // }
        try {
            setSaving(true);

            const resp = await axios.post(route("request.update"), formData, {
                headers: { Accept: "application/json" },
            });

            if (resp.status === 200 || resp.status === 302) {
                setModal(false);
                const newData = allData.map((item) => {
                    if (item.request_id === formData.request_id) {
                        return { ...item, ...formData };
                    }
                    return item;
                });
                setAllData(newData);
            }

            addToast(resp.data);
        } catch (error) {
            console.error("Failed to update request:", error);
            addToast({
                type: "error",
                text:
                    error?.response?.data?.message ||
                    "Something went wrong while saving.",
            });
        }
        setSaving(false);
    };

    return (
        <Modal
            title={type}
            handleCloseModal={() => setModal(false)}
            showModal={isModal}
            size="responsive"
        >
            <Modal.Body>
                <div className="space-y-5">
                    {(user?.role === "operator"
                        ? editRequestItems.filter(
                              (item) =>
                                  item?.name === "Request" ||
                                  item?.name === "Remarks" ||
                                  item?.name === "End Date Time",
                          )
                        : (user?.role === "super_admin" ||
                              user?.role === "technician") &&
                          editRequestItems.filter(
                              (item) =>
                                  item?.name === "Start Date Time" ||
                                  item?.name === "Request" ||
                                  item?.name === "Remarks" ||
                                  item?.name === "End Date Time",
                          )
                    )?.map((item, index) => {
                        const itemInputType = item?.isInput
                            ? item?.type
                            : false;

                        return (
                            <div
                                key={index}
                                className="bg-[#f8fafc] border border-[#edf1f5] rounded-2xl p-4"
                            >
                                <div className="flex flex-col gap-3">
                                    <label className="text-sm font-semibold text-gray-700">
                                        {item?.name}
                                    </label>

                                    {/* Static View */}
                                    {!itemInputType ? (
                                        <>
                                            {item?.name ===
                                            "Start Date Time" ? (
                                                <div className="text-gray-700 font-medium">
                                                    {getFormattedDate(
                                                        formData[item?.value],
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    <StatusPill
                                                        request_type={
                                                            formData[
                                                                item?.value
                                                            ]
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : item?.type != "option" &&
                                      item?.type != "dateTime" ? (
                                        /* Input */
                                        <input
                                            disabled={
                                                selectedItem?.status === "End"
                                            }
                                            type={itemInputType}
                                            value={formData[item?.value]}
                                            onChange={(e) =>
                                                handleChange(
                                                    item?.value,
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    ) : item?.type === "dateTime" ? (
                                        /* Date Time */
                                        <div className="rounded-xl border border-gray-300 bg-white px-4 py-3">
                                            <DateTimeInput
                                                disabled={
                                                    selectedItem?.status ===
                                                    "End"
                                                }
                                                value={{
                                                    date: formData[
                                                        item?.value?.date
                                                    ],
                                                    time: formData[
                                                        item?.value?.time
                                                    ],
                                                }}
                                                name={{
                                                    date: item?.value?.date,
                                                    time: item?.value?.time,
                                                }}
                                                required={
                                                    formData?.status != "End"
                                                }
                                                handleChange={handleChange}
                                            />
                                        </div>
                                    ) : (
                                        /* Select */
                                        <select
                                            disabled={
                                                selectedItem?.status === "End"
                                            }
                                            value={formData[item?.value]}
                                            onChange={(e) =>
                                                handleChange(
                                                    item?.value,
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
                                        >
                                            {item?.options &&
                                                item?.options?.map(
                                                    (option, optionIndex) => (
                                                        <option
                                                            value={
                                                                option?.value
                                                            }
                                                            key={optionIndex}
                                                        >
                                                            {option?.name}
                                                        </option>
                                                    ),
                                                )}
                                        </select>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Modal.Body>

            <Modal.Footer>
                <div className="w-full flex justify-end">
                    <div className=" rounded-2xl p-2 flex items-center gap-2">
                        {selectedItem?.status != "End" && accessEdit && (
                            <button
                                className="bg-white hover:bg-white/90 transition duration-200 text-primary px-4 py-2.5 rounded-xl shadow-sm"
                                onClick={() => updateData(true)}
                            >
                                Set Current Date
                            </button>
                        )}

                        <button
                            className="bg-secondary text-white hover:opacity-90 transition duration-200 px-5 py-2.5 rounded-xl shadow-sm"
                            onClick={() => {
                                // setModal(false);

                                handleSave();
                            }}
                        >
                            {accessEdit ? "Save Changes" : type}
                        </button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default Request;
