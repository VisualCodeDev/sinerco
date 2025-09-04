import { useEffect, useState } from "react";
import Modal from "../Modal";
import { DateTimeInput, getCurrDateTime } from "../utils/dashboard-util";
import { useForm } from "@inertiajs/react";
import { requestStatus, requestType } from "@/Components/utils/dashboard-util";
import { useToast } from "../Toast/ToastProvider";
import LoadingSpinner from "../Loading";

export const RequestModal = ({ handleCloseModal, showModal }) => {
    const { data, setData, post } = useForm({
        request_type: "",
        start_date: "",
        start_time: "",
        unit_position_id: "",
    });
    const [isUnitDown, setIsUnitDown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [unitData, setUnitData] = useState([]);
    const { addToast } = useToast();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};   
        if(isUnitDown) {
            addToast({type: "error", text: "The Unit is Already Reported, Please End the Previous Report"})
            return;
        }

        if (
            !requestType.some((item) => item.value === data?.request_type) ||
            !data?.request_type
        ) {
            newErrors.request_type = "Please choose a valid request type";
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
            addToast({ type: "error", text: "Failed to make request" });
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

    const fetchTime = async () => {
        setLoading(true);
        const dataDateTime = await getCurrDateTime();
        setData((prevData) => ({
            ...prevData,
            start_date: dataDateTime.date,
            start_time: dataDateTime.time,
        }));
        setLoading(false);
    };

    useEffect(() => {
        if (showModal) {
            fetchTime();
            fetchDataUnit();
        }
    }, [showModal]);

    useEffect(() => {
        const areaLocation = unitData.find(
            (item) => item?.unit_id === data?.unit_id
        );
        console.log(areaLocation?.status != "running")
        setIsUnitDown(areaLocation?.status != "running")
        handleChange(["unit_position_id"], areaLocation?.unit_position_id);
    }, [data?.unit_id]);

    return (
        <>
            {loading && <LoadingSpinner />}
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
                            <label
                                className="font-semibold mb-2"
                                htmlFor="unit"
                            >
                                Unit:{" "}
                            </label>
                            <div className="md:w-3/5 w-full">
                                <select
                                    className="text-sm md:text-base w-full"
                                    required
                                    id="unit"
                                    value={data?.unit_id || ""}
                                    onChange={(e) => {
                                        handleChange(
                                            ["unit_id"],
                                            e.target.value
                                        );
                                    }}
                                >
                                    <option value={null}>
                                        -- Select Unit --
                                    </option>
                                    {unitData?.map((item, index) => (
                                        <option
                                            value={item?.unit_id}
                                            key={index}
                                        >
                                            {item?.unit}
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
                            <label
                                className="font-semibold mb-2"
                                htmlFor="request"
                            >
                                Request:{" "}
                            </label>
                            <div className="md:w-3/5 w-full">
                                <select
                                    className="md:text-base text-sm w-full"
                                    required
                                    id="request"
                                    value={data.request_type || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            ["request_type"],
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
                                {errors.request_type && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.request_type}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between md:items-center text-sm md:text-base mb-4">
                            <label
                                className="font-semibold mb-2"
                                htmlFor="date"
                            >
                                Date Time:{" "}
                            </label>
                            <div className="md:w-3/5 w-full">
                                <DateTimeInput
                                    value={{
                                        date: data?.start_date,
                                        time: data?.start_time,
                                    }}
                                    name={{
                                        date: "start_date",
                                        time: "start_time",
                                    }}
                                    handleChange={handleChange}
                                />
                            </div>
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
                            <label
                                className="font-semibold mb-2"
                                htmlFor="time"
                            >
                                Remarks:{" "}
                            </label>
                            <div className="md:w-3/5 w-full">
                                <input
                                    className="md:text-base text-sm w-full"
                                    required
                                    id="remarks"
                                    name="remarks"
                                    type="text"
                                    value={data.remarks || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            [e.target.name],
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="submit">Submit</button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    );
};
