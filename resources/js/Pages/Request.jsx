import Card from "@/Components/Card";
import {
    DateTimeInput,
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
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Start Date</th>
                                    <th>Start Time</th>
                                    <th>Request</th>
                                    <th>End Date</th>
                                    <th>End Time</th>
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
                                                          item?.startDate
                                                      )}
                                                  </td>
                                                  <td>{item?.startTime}</td>
                                                  <td>
                                                      {getRequestTypeName(
                                                          item?.requestType
                                                      )}
                                                  </td>
                                                  <td>
                                                      {getFormattedDate(
                                                          item?.endDate
                                                      ) || "-"}
                                                  </td>
                                                  <td>
                                                      {item?.endTime || "-"}
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
        console.log(field, value);
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
        // await axios.post("/dashboard/request/update", formData);
        if (
            formData?.status === "End" &&
            (!formData?.endDate ||
                !formData?.endTime ||
                formData?.action === "")
        ) {
            return alert("Please fill all the fields");
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

export const RequestModal = ({ handleCloseModal, showModal }) => {
    const { data, setData, post } = useForm({
        requestType: "",
        startDate: "",
        startTime: "",
    });
    const [errors, setErrors] = useState({});
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (
            !requestType.some((item) => item.value === data?.requestType) ||
            !data?.requestType
        ) {
            newErrors.requestType = "Please choose a valid request type";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            post(route("request.post"), data);
            setErrors({});
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
                startDate: dataDateTime.date,
                startTime: dataDateTime.time,
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
            <form
                onSubmit={handleSubmit}
                method="POST"
                className="flex flex-col gap-2"
            >
                <Modal.Body>
                    <div className="flex justify-between items-center">
                        <label htmlFor="request">Request: </label>
                        <div>
                            <select
                                required
                                id="request"
                                value={data.requestType || ""}
                                onChange={(e) =>
                                    handleChange(
                                        ["requestType"],
                                        e.target.value
                                    )
                                }
                            >
                                <option value={null}>
                                    -- Select Request Type --
                                </option>
                                {requestType?.map((item, index) => (
                                    <option value={item?.value} key={index}>
                                        {item?.name}
                                    </option>
                                ))}
                            </select>
                            {errors.requestType && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.requestType}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="date">Date Time: </label>
                        <DateTimeInput
                            value={{
                                date: data?.startDate,
                                time: data?.startTime,
                            }}
                            name={{
                                date: "startDate",
                                time: "startTime",
                            }}
                            handleChange={handleChange}
                        />
                        {/* <input
                            required
                            id="date"
                            name="date"
                            type="date"
                            value={data.date || ""}
                            onChange={(e) =>
                                handleChange([e.target.name], e.target.value)
                            }
                        /> */}
                    </div>
                    {/* <div className="flex justify-between items-center">
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
                    </div> */}
                    <div className="flex justify-between items-center">
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
                </Modal.Body>
                <Modal.Footer>
                    <button type="submit">Submit</button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};
