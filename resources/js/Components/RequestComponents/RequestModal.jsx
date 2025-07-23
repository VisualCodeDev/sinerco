import { useEffect, useState } from "react";
import Modal from "../Modal";
import { DateTimeInput, getCurrDateTime } from "../utils/dashboard-util";
import { useForm } from "@inertiajs/react";
import { requestStatus, requestType } from "@/Components/utils/dashboard-util";
import { useToast } from "../Toast/ToastProvider";

export const RequestModal = ({ handleCloseModal, showModal }) => {
    const { data, setData, post } = useForm({
        requestType: "",
        startDate: "",
        startTime: "",
    });
    const [errors, setErrors] = useState({});
    const [unitData, setUnitData] = useState([]);
    const { addToast } = useToast();
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
            const resp = await axios.post(route("request.post"), data);
            if (resp.data.type) {
                addToast(resp?.data);
            }
            setErrors({});
        } catch (error) {
            addToast(error?.response?.data);
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

    const fetchDataUnit = async () => {
        const response = await axios.get(route("getUnitAreaLocation"));
        setUnitData(response.data);
    };

    useEffect(() => {
        if (showModal) {
            const dataDateTime = getCurrDateTime();
            setData((prevData) => ({
                ...prevData,
                startDate: dataDateTime.date,
                startTime: dataDateTime.time,
            }));
            fetchDataUnit();
        }
    }, [showModal]);

    useEffect(() => {
        const location = unitData.find((item) => item?.unitId === data?.unitId);
        handleChange(["locationId"], location?.id);
    }, [data?.unitId]);

    return (
        <Modal
            title="Report SD/STDBY"
            size="responsive"
            handleCloseModal={handleCloseModal}
            showModal={showModal}
        >
            <form
                onSubmit={handleSubmit}
                method="POST"
                className="flex flex-col"
            >
                <Modal.Body>
                    <div className="flex flex-col md:flex-row justify-between md:items-center text-sm md:text-base mb-4">
                        <label className="font-semibold mb-2" htmlFor="unit">
                            Unit:{" "}
                        </label>
                        <div>
                            <select
                                className="text-sm md:text-base"
                                required
                                id="unit"
                                value={data?.unitId || ""}
                                onChange={(e) => {
                                    handleChange(["unitId"], e.target.value);
                                }}
                            >
                                <option value={null}>-- Select Unit --</option>
                                {unitData?.map((item, index) => (
                                    <option
                                        value={item?.unit?.unitId}
                                        key={index}
                                    >
                                        {item?.unit?.unit}
                                    </option>
                                ))}
                            </select>
                            {errors.unit && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.unit}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between md:items-center text-sm md:text-base mb-4">
                        <label className="font-semibold mb-2" htmlFor="request">
                            Request:{" "}
                        </label>
                        <div>
                            <select
                                className="md:text-base text-sm"
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
                    <div className="flex flex-col md:flex-row justify-between md:items-center text-sm md:text-base mb-4">
                        <label className="font-semibold mb-2" htmlFor="date">
                            Date Time:{" "}
                        </label>
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
                    {/* <div className="flex justify-between items-center"text-sm md:text-base >
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
                    <div className="flex flex-col md:flex-row justify-between md:items-center text-sm md:text-base">
                        <label className="font-semibold mb-2" htmlFor="time">
                            Remarks:{" "}
                        </label>
                        <input
                            className="md:text-base text-sm"
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
