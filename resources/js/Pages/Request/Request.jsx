import Card from "@/Components/Card";
import {
    DateTimeInput,
    editRequestItems,
    getCurrDateTime,
    getFormattedDate,
    getRequestStatus,
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

const Request = ({ data }) => {
    const [isModal, setModal] = useState(false);
    const [selectedItem, setItem] = useState(false);
    const [saving, setSaving] = useState(false);
    const [allData, setAllData] = useState(data);
    const handleSelect = (itemData) => {
        setModal(true);
        setItem(itemData);
    };
    const { user } = useAuth();
    const { addToast } = useToast();

    const handleSeen = async (id) => {
        if (!id) return;
        try {
            const resp = await axios.post(route("request.seen", id));
            addToast(resp.data);
        } catch (e) {
            addToast({ type: "error", text: e.response.data.message });
        }
    };

    const columns = tColumns({ handleSelect, user, handleSeen });
    return (
        <PageLayout>
            <TableComponent
                title="Request List"
                subtitle="Click on the row to edit the request"
                columns={columns}
                data={allData}
                onRowClick={handleSelect}
            />
            <EditItem
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
}) => {
    const {
        data: formData,
        setData,
        post,
    } = useForm({
        ...selectedItem,
    });
    const { addToast } = useToast();

    useEffect(() => {
        if (selectedItem) {
            setData({
                ...selectedItem,
            });
        }
    }, [selectedItem]);

    const handleChange = (field, value) => {
        setData((prevData) => {
            const updatedData = { ...prevData, [field]: value };
            if (field === "status") {
                if (value !== "End" && prevData.endTime && prevData.endDate) {
                    updatedData.endTime = "";
                    updatedData.endDate = "";
                } else if (
                    value === "End" &&
                    !prevData.endTime &&
                    !prevData.endDate
                ) {
                    const currDateTime = getCurrDateTime();
                    updatedData.endTime = currDateTime.time;
                    updatedData.endDate = currDateTime.date;
                }
            }

            return updatedData;
        });
    };

    const handleSave = async () => {
        if (
            formData?.status === "End" &&
            (!formData?.endDate || !formData?.endTime)
        ) {
            return alert("Please fill all the fields");
        }
        try {
            setSaving(true);

            const resp = await axios.post(route("request.update"), formData, {
                headers: { Accept: "application/json" },
            });

            if (resp.status === 200 || resp.status === 302) {
                setModal(false);
            }

            addToast(resp.data);
        } catch (error) {
            console.error("Failed to update request:", error);
            addToast({
                type: "error",
                text: "Something went wrong while saving.",
            });
        } finally {
            const newData = allData.map((item) => {
                if (item.requestId === formData.requestId) {
                    return { ...item, ...formData };
                }
                return item;
            });
            setAllData(newData);
            setSaving(false);
        }
    };
    return (
        <Modal
            title="Edit Request"
            handleCloseModal={() => setModal(false)}
            showModal={isModal}
            size="md"
        >
            <Modal.Body>
                <div className="grid grid-cols-2 gap-5 items-center">
                    {editRequestItems.map((item, index) => {
                        const itemInputType = item?.isInput
                            ? item?.type
                            : false;

                        return (
                            <>
                                <div>{item?.name}</div>
                                {!itemInputType ? (
                                    <div>
                                        {item?.name === "Start Date Time"
                                            ? getFormattedDate(
                                                  formData[item?.value]
                                              )
                                            : getRequestTypeName(
                                                  formData[item?.value]
                                              )}
                                    </div>
                                ) : itemInputType &&
                                  item?.type != "option" &&
                                  item?.type != "dateTime" ? (
                                    <input
                                        type={itemInputType}
                                        value={formData[item?.value]}
                                        onChange={(e) =>
                                            handleChange(
                                                item?.value,
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : item?.type === "dateTime" ? (
                                    <DateTimeInput
                                        value={{
                                            date: formData[item?.value?.date],
                                            time: formData[item?.value?.time],
                                        }}
                                        name={{
                                            date: item?.value?.date,
                                            time: item?.value?.time,
                                        }}
                                        handleChange={handleChange}
                                    />
                                ) : (
                                    <div key={index}>
                                        <select
                                            value={formData[item?.value]}
                                            onChange={(e) =>
                                                handleChange(
                                                    item?.value,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            {item?.options &&
                                                item?.options?.map((item) => (
                                                    <option
                                                        value={item?.value}
                                                        key={index}
                                                    >
                                                        {item?.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                )}
                            </>
                        );
                    })}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="flex items-center justify-end">
                    <button onClick={() => handleSave()}>Save</button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default Request;
