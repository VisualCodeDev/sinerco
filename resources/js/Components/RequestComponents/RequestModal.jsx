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
        if (isUnitDown) {
            addToast({
                type: "error",
                text: "The Unit is Already Reported, Please End the Previous Report",
            });
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
            addToast({
                type: "error",
                text:
                    error?.response?.data?.message || "Failed to make request",
            });
            console.error(error);
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
        const dataDateTime = await getCurrDateTime(
            unitData[0]?.gmt_offset || 7,
        );
        setData((prevData) => ({
            ...prevData,
            start_date: dataDateTime.date,
            start_time: dataDateTime.time,
        }));
        setLoading(false);
    };

    useEffect(() => {
        if (showModal && unitData) {
            fetchTime();
            fetchDataUnit();
        }
    }, [showModal]);

    useEffect(() => {
        const areaLocation = unitData.find(
            (item) => item?.unit_id === data?.unit_id,
        );
        setIsUnitDown(areaLocation?.status != "running");
        handleChange(["unit_position_id"], areaLocation?.unit_position_id);
    }, [data?.unit_id]);

    return (
        <>
            {loading && <LoadingSpinner />}
            <Modal
                title="Report SD / STBY"
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
                        <div className="space-y-6">
                            {/* Unit */}
                            <div>
                                <label
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                    htmlFor="unit"
                                >
                                    Unit
                                </label>

                                <select
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                    required
                                    id="unit"
                                    value={data?.unit_id || ""}
                                    onChange={(e) => {
                                        handleChange(
                                            ["unit_id"],
                                            e.target.value,
                                        );
                                    }}
                                >
                                    <option value="">-- Select Unit --</option>

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
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.unit}
                                    </p>
                                )}
                            </div>

                            {/* Request Type */}
                            <div>
                                <label
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                    htmlFor="request"
                                >
                                    Request Type
                                </label>

                                <select
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                                    required
                                    id="request"
                                    value={data.request_type || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            ["request_type"],
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        -- Select Request Type --
                                    </option>

                                    {requestType?.map((item, index) => (
                                        <option value={item?.value} key={index}>
                                            {item?.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.request_type && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.request_type}
                                    </p>
                                )}
                            </div>

                            {/* Date Time */}
                            <div>
                                <label
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                    htmlFor="date"
                                >
                                    Date Time
                                </label>

                                <div className="rounded-xl border border-gray-300 px-4 py-3 bg-white">
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
                            </div>

                            {/* Remarks */}
                            <div>
                                <label
                                    className="block text-sm font-semibold text-gray-700 mb-2"
                                    htmlFor="remarks"
                                >
                                    Remarks
                                </label>

                                <textarea
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[120px]"
                                    required
                                    id="remarks"
                                    name="remarks"
                                    placeholder="Write remarks here..."
                                    value={data.remarks || ""}
                                    onChange={(e) =>
                                        handleChange(
                                            [e.target.name],
                                            e.target.value,
                                        )
                                    }
                                />

                                {errors.remarks && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.remarks}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <div className="flex justify-end gap-3 w-full">
                            <div className="p-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-secondary text-white hover:opacity-90 transition-all duration-200 shadow-sm"
                                >
                                    Submit Report
                                </button>
                            </div>
                        </div>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    );
};
