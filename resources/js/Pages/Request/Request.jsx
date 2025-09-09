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
    const [saving, setSaving] = useState(false);
    const [allData, setAllData] = useState(data);
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
                            : item
                    )
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
                : [...prev, id]
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
                        item.status === "End"
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
                    prev.filter((item) => !validIds.includes(item.request_id))
                );

                // Clear selected rows
                setSelectedRows([]);

                window.location.reload();
            }
            console.log(validIds);
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
    });

    return (
        <PageLayout>
            <TableComponent
                height="55vh"
                title="Request List"
                subtitle="Click on the row to edit the request"
                columns={columns}
                data={allData}
                onRowClick={handleSelect}
                handleMoveToHistory={handleMoveToHistory}
                isRequestList={true}
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

    useEffect(() => {
        const updateData = async () => {
            if (selectedItem) {
                setType(
                    selectedItem?.status === "End"
                        ? "Set to Ongoing Request"
                        : "End Request"
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

                setData({
                    ...selectedItem,
                    end_date,
                    end_time,
                });
            }
        };

        updateData();
    }, [selectedItem]);

    console.log(formData);
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
        if (
            formData?.status != "End" &&
            (!formData?.end_date || !formData?.end_time)
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
                if (item.request_id === formData.request_id) {
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
            title={type}
            handleCloseModal={() => setModal(false)}
            showModal={isModal}
            size="responsive"
        >
            <Modal.Body>
                <div className="grid grid-cols-2 gap-5 items-center">
                    {user?.role === "operator"
                        ? editRequestItems
                              .filter(
                                  (item) =>
                                      item?.name === "Request" ||
                                      item?.name === "Remarks" ||
                                      item?.name === "End Date Time"
                              )
                              .map((item, index) => {
                                  const itemInputType = item?.isInput
                                      ? item?.type
                                      : false;

                                  return (
                                      <>
                                          <div className="font-semibold">
                                              {item?.name}
                                          </div>
                                          {!itemInputType ? (
                                              <>
                                                  {item?.name ===
                                                  "Start Date Time" ? (
                                                      <div>
                                                          {getFormattedDate(
                                                              formData[
                                                                  item?.value
                                                              ]
                                                          )}
                                                      </div>
                                                  ) : (
                                                      <StatusPill
                                                          request_type={
                                                              formData[
                                                                  item?.value
                                                              ]
                                                          }
                                                      />
                                                  )}
                                              </>
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
                                          ) : (
                                              <div key={index}>
                                                  <select
                                                      value={
                                                          formData[item?.value]
                                                      }
                                                      onChange={(e) =>
                                                          handleChange(
                                                              item?.value,
                                                              e.target.value
                                                          )
                                                      }
                                                  >
                                                      {item?.options &&
                                                          item?.options?.map(
                                                              (item) => (
                                                                  <option
                                                                      value={
                                                                          item?.value
                                                                      }
                                                                      key={
                                                                          index
                                                                      }
                                                                  >
                                                                      {
                                                                          item?.name
                                                                      }
                                                                  </option>
                                                              )
                                                          )}
                                                  </select>
                                              </div>
                                          )}
                                      </>
                                  );
                              })
                        : editRequestItems
                              .filter(
                                  (item) =>
                                      item?.name === "Request" ||
                                      item?.name === "Remarks" ||
                                      item?.name === "End Date Time"
                              )
                              .map((item, index) => {
                                  const itemInputType = item?.isInput
                                      ? item?.type
                                      : false;

                                  return (
                                      <>
                                          <div className="font-semibold">
                                              {item?.name}
                                          </div>
                                          {!itemInputType ? (
                                              <>
                                                  {item?.name ===
                                                  "Start Date Time" ? (
                                                      <div>
                                                          {getFormattedDate(
                                                              formData[
                                                                  item?.value
                                                              ]
                                                          )}
                                                      </div>
                                                  ) : (
                                                      <StatusPill
                                                          request_type={
                                                              formData[
                                                                  item?.value
                                                              ]
                                                          }
                                                      />
                                                  )}
                                              </>
                                          ) : itemInputType &&
                                            item?.type != "option" &&
                                            item?.type != "dateTime" ? (
                                              <input
                                                  disabled={
                                                      selectedItem?.status ===
                                                      "End"
                                                  }
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
                                          ) : (
                                              <div key={index}>
                                                  <select
                                                      value={
                                                          formData[item?.value]
                                                      }
                                                      onChange={(e) =>
                                                          handleChange(
                                                              item?.value,
                                                              e.target.value
                                                          )
                                                      }
                                                  >
                                                      {item?.options &&
                                                          item?.options?.map(
                                                              (item) => (
                                                                  <option
                                                                      value={
                                                                          item?.value
                                                                      }
                                                                      key={
                                                                          index
                                                                      }
                                                                  >
                                                                      {
                                                                          item?.name
                                                                      }
                                                                  </option>
                                                              )
                                                          )}
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
                    <button onClick={() => handleSave()}>{type}</button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default Request;
