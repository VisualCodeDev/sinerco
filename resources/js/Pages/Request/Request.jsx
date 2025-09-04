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
    const [saving, setSaving] = useState(false);
    const [allData, setAllData] = useState(data);
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
        if (selectedItem) {
            setType(
                selectedItem?.status === "End"
                    ? "Set to Ongoing Request"
                    : "End Request"
            );
            setData({
                ...selectedItem,
            });
        }
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
                                                  required={formData?.status != "End"}
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
                        : editRequestItems.map((item, index) => {
                              const itemInputType = item?.isInput
                                  ? item?.type
                                  : false;

                              return (
                                  <>
                                      <div className="font-semibold">
                                          {item?.name}
                                      </div>
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
                                                      item?.options?.map(
                                                          (item) => (
                                                              <option
                                                                  value={
                                                                      item?.value
                                                                  }
                                                                  key={index}
                                                              >
                                                                  {item?.name}
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
