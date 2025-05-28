import Card from "@/Components/Card";
import {
    editRequestItems,
    getCurrDateTime,
    getFormattedDate,
    getRequestStatus,
    getRequestTypeName,
    requestStatus,
    requestType,
} from "@/Components/utils/dashboard-util";
import Modal from "@/Components/Modal";
import PageLayout from "@/Layouts/PageLayout";
import { useForm } from "@inertiajs/react";
import React, { useEffect, useState } from "react";

const Request = ({ data }) => {
    const [isModal, setModal] = useState(false);
    const [selectedItem, setItem] = useState(false);
    const handleSelect = (itemData) => {
        setModal(true);
        setItem(itemData);
    };

    return (
        <PageLayout>
            <Card>
                <Card.Header className="bg-primary text-white">
                    Request List
                </Card.Header>
                <Card.Body className="relative">
                    <div className="flex text-center">
                        {status && (
                            <div
                                className={`${
                                    status == "success"
                                        ? "bg-green-300"
                                        : status == "failed" && "bg-red-300"
                                } absolute top-0 left-1/2 -translate-x-1/2 px-5 py-2`}
                            >
                                {status === "success" ? (
                                    <div className="text-black">
                                        Request has been Updated
                                    </div>
                                ) : (
                                    status === "failed" && (
                                        <div className="text-white">
                                            Request Failed
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Date</th>
                                    <th>Request</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                    <th>Action</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data != ""
                                    ? data?.map((item, index) => {
                                          const status = getRequestStatus(
                                              item?.status
                                          );
                                          return (
                                              <tr key={index} id={item?.id}>
                                                  <td>{index + 1}</td>
                                                  <td>
                                                      {getFormattedDate(
                                                          item?.date
                                                      )}
                                                  </td>
                                                  <td>
                                                      {getRequestTypeName(
                                                          item?.requestType
                                                      )}
                                                  </td>
                                                  <td>
                                                      {item?.timeStart ||
                                                          item?.time}
                                                  </td>
                                                  <td>
                                                      {item?.timeEnd || "-"}
                                                  </td>
                                                  {status && (
                                                      <td
                                                          className="font-bold"
                                                          style={{
                                                              color: status?.color,
                                                          }}
                                                      >
                                                          {status?.name ===
                                                          "End"
                                                              ? "Online"
                                                              : status?.name}
                                                      </td>
                                                  )}
                                                  <td>{item?.remarks}</td>
                                                  <td>{item?.action}</td>
                                                  <td>
                                                      <button
                                                          className="bg-gray-100 px-3 py-1 border-2"
                                                          onClick={() =>
                                                              handleSelect(item)
                                                          }
                                                      >
                                                          Edit Item
                                                      </button>
                                                  </td>
                                              </tr>
                                          );
                                      })
                                    : "No Request"}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>
            <EditItem
                selectedItem={selectedItem}
                setModal={setModal}
                isModal={isModal}
            />
        </PageLayout>
    );
};

const EditItem = ({ selectedItem, setModal, isModal }) => {
    const {
        data: formData,
        setData,
        post,
    } = useForm({
        ...selectedItem,
    });

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

            if (
                field === "status" &&
                value != "End" &&
                prevData.timeEnd != ""
            ) {
                updatedData.timeEnd = "";
            } else if (
                field === "status" &&
                value === "End" &&
                prevData.timeEnd === ""
            ) {
                updatedData.timeEnd = getCurrDateTime().time;
            }

            return updatedData;
        });
    };

    const handleSave = async () => {
        // await axios.post("/dashboard/request/update", formData);
        if (formData?.timeEnd === "" && formData?.status === "End") {
            return alert("Please fill in the time end");
        }
        post(route("request.update"), formData);
        setModal(false);
    };
    return (
        <Modal
            title="Edit Request"
            handleCloseModal={() => setModal(false)}
            showModal={isModal}
            size="md"
        >
            <Modal.Body>
                <div className="grid grid-cols-2 gap-5">
                    {editRequestItems.map((item, index) => {
                        const itemInputType = item?.isInput
                            ? item?.type
                            : false;
                        return (
                            <>
                                <div key={index}>{item?.name}</div>
                                {!itemInputType ? (
                                    <div>
                                        {item?.name === "Date"
                                            ? getFormattedDate(formData[item?.value])
                                            : getRequestTypeName(
                                                  formData[item?.value]
                                              )}
                                    </div>
                                ) : itemInputType && item?.type != "option" ? (
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
                                ) : (
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
                                                <option value={item?.value}>
                                                    {item?.name}
                                                </option>
                                            ))}
                                    </select>
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

export const RequestModal = ({ handleCloseModal, showModal }) => {
    const { data, setData, post } = useForm({
        requestType: "",
        date: "",
        time: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            post(route("request.post"), data);
        } catch (error) {
            console.log(error);
        } finally {
            handleCloseModal();
            setData({});
        }
    };

    const handleChange = ([field], value) => {
        setData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };

    useEffect(() => {
        if (showModal) {
            const dataDateTime = getCurrDateTime();
            setData((prevData) => ({
                ...prevData,
                date: dataDateTime.date,
                time: dataDateTime.time,
            }));
        }
    }, [showModal]);
    return (
        <Modal
            title="Report SD/STDBY"
            size="md"
            handleCloseModal={handleCloseModal}
            showModal={showModal}
        >
            <Modal.Body>
                <form onSubmit={handleSubmit} method="POST">
                    <div>
                        <label htmlFor="request">Request: </label>
                        <select
                            required
                            id="request"
                            value={data.requestType || ""}
                            onChange={(e) =>
                                handleChange(["requestType"], e.target.value)
                            }
                        >
                            <option>Choose</option>
                            {requestType?.map((item) => (
                                <option value={item?.value}>
                                    {item?.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="date">Date: </label>
                        <input
                            required
                            id="date"
                            name="date"
                            type="date"
                            value={data.date || ""}
                            onChange={(e) =>
                                handleChange([e.target.name], e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label htmlFor="time">Time: </label>
                        <input
                            required
                            id="time"
                            name="time"
                            type="time"
                            value={data.time || ""}
                            onChange={(e) =>
                                handleChange([e.target.name], e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label htmlFor="time">Remarks: </label>
                        <input
                            required
                            id="remarks"
                            name="remarks"
                            type="text"
                            value={data.remarks || ""}
                            onChange={(e) =>
                                handleChange([e.target.name], e.target.value)
                            }
                        />
                    </div>
                    <button type="submit">Submit</button>
                </form>
            </Modal.Body>
        </Modal>
    );
};
