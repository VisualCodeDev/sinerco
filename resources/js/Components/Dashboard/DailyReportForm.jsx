import React, { useEffect, useState } from "react";
import Card from "../Card";
import {
    formItems,
    DateInput,
    getCurrDateTime,
    TimeInput,
    toCapitalizeFirstLetter,
    getFormattedDate,
    splitCamelCase,
} from "../utils/dashboard-util";
import { router, usePage } from "@inertiajs/react";
import list from "../utils/DailyReport/columns";
import Modal from "../Modal";
import { FaAngleDown, FaCog } from "react-icons/fa";
import { useAuth } from "../Auth/auth";
import LoadingSpinner from "../Loading";
import { useToast } from "../Toast/ToastProvider";

const DailyReportForm = (props) => {
    const {
        unitData,
        formData,
        user,
        interval,
        duration,
        isDown = true,
    } = props;
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [isConfirmationModal, setConfirmationModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setConfirmationModal(true);
    };

    const handleSetReport = async (e) => {
        try {
            setSaving(true);
            const resp = await axios.post(
                route("daily.add", unitData?.unit_position_id),
                data
            );
            if (resp.status === 200 || resp.status === 302) {
                setData({});
                route("daily", unitData?.unit_position_id);
                setConfirmationModal(false);
                setSaving(false);
            } else {
                setConfirmationModal(false);
                setSaving(false);
            }
            addToast({ type: "success", text: "Report Added" });
        } catch (err) {
            console.error("Error creating report:", err);
            addToast({ type: "error", text: err.response.data.message });
            setConfirmationModal(false);
            setSaving(false);
        }
    };

    const handleChange = ([field], value, minMaxSetting) => {
        let warn = "";

        if (field === "date" || field === "time") {
            setData({
                ...data,
                [field]: value,
            });
            return;
        }

        if (minMaxSetting) {
            if (minMaxSetting.min && value < minMaxSetting.min) {
                warn = `Value for ${field} is ${value} (less than ${minMaxSetting.min})`;
            }
            if (minMaxSetting.max && value > minMaxSetting.max) {
                warn = `Value for ${field} is ${value} (greater than ${minMaxSetting.max})`;
            }
        }

        setData((prevData) => ({
            ...prevData,
            [field]: value,
            warn: { ...prevData.warn, [field]: warn },
        }));
    };

    const formList = list({
        handleChange: handleChange,
        isDown: isDown,
        formData: formData,
        reportSettings: unitData?.daily_report_setting,
        role: user?.role,
        interval: interval,
        duration: duration,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const dateTime = await getCurrDateTime();
            const now = dateTime.now;
            const filledFormTime = Array.isArray(formData)
                ? formData
                      .filter((data) => dateTime?.date === data?.date)
                      .map((data) => parseInt(data?.time.split(":")[0], 10))
                : [];

            let currentHour = parseInt(now.format("HH"), 10);

            if (filledFormTime.includes(currentHour)) {
                currentHour = currentHour - 1;
                if (currentHour < 0) currentHour = 23;
            }
            const time = String(currentHour).padStart(2, "0") + ":00";
            const date = dateTime.date;

            setData((prevData) => ({
                ...prevData,
                time,
                date,
            }));

            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <div className="flex flex-col justify-center items-start w-full bg-white lg:md:py-8 py-3">
            {saving || (loading && <LoadingSpinner text="Saving..." />)}
            <div className="w-full lg:md:pt-10 pt-4 lg:md:px-32 px-5 text-[#3A3541]">
                <form onSubmit={handleSubmit}>
                    <div className="lg:md:grid grid-cols-2 lg:md:gap-x-10 gap-x-4 lg:md:gap-y-8 gap-y-4 mb-4 lg:md:items-center h-full">
                        {formList.map((item) => (
                            <div
                                key={item.header}
                                style={{
                                    gridColumn: "span " + item.gridCols,
                                }}
                            >
                                {typeof item.Cell === "function"
                                    ? item.Cell(
                                          {
                                              item: data,
                                              header: item.header,
                                              name: item.name,
                                              subheader: item?.subheader || [],
                                          } || ""
                                      )
                                    : item.Cell}
                            </div>
                        ))}
                    </div>
                    <div className="mb-32 md:mb-0 flex place-self-center w-fit mt-10 items-center justify-center gap-2 bg-secondary/90 hover:bg-secondary text-white py-2 px-8 rounded-full transition ease-in-out delay-75 hover:scale-95">
                        <button className="font-semibold w-full h-full">
                            Simpan
                        </button>
                    </div>
                    <ConfirmationModal
                        formData={data}
                        unitData={{
                            area: unitData?.area,
                            location: unitData?.location,
                            unit: unitData?.unit,
                        }}
                        isModal={isConfirmationModal}
                        handleCloseModal={() => setConfirmationModal(false)}
                        handleSubmit={handleSetReport}
                    />
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal = (props) => {
    const { isModal, handleCloseModal, handleSubmit, formData, unitData } =
        props;
    return (
        <Modal
            title="Are You Sure?"
            handleCloseModal={handleCloseModal}
            showModal={isModal}
            size={"responsive"}
        >
            <Modal.Body>
                <div className="flex flex-col lg:md:gap-2 gap-1 items-center md:px-4">
                    <div className="border-2 lg:md:p-4 p-2 lg:md:text-lg w-full text-sm mb-4 md:mb-6">
                        {unitData &&
                            Object.entries(unitData)
                                .filter(([key]) => key !== "unit_position_id")
                                .map(([key, value]) => (
                                    <div className="flex justify-between font-semibold capitalize">
                                        <p>{splitCamelCase(key)} </p>
                                        <p className="text-primary">{value}</p>
                                    </div>
                                ))}
                    </div>
                    <div className="flex flex-col lg:md:gap-2 gap-1.5 w-[90%]">
                        {formData &&
                            Object.entries(formData)
                                .filter(([key, item]) => key != "warn")
                                .map(([key, item]) => (
                                    <div className="flex justify-between capitalize lg:md:text-lg text-sm pb-2.5 border-b border-b-[#e5e5e5]">
                                        <p className="font-semibold">
                                            {splitCamelCase(key)}
                                        </p>
                                        <p>
                                            {key === "date"
                                                ? getFormattedDate(item)
                                                : item}
                                        </p>
                                    </div>
                                ))}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={handleSubmit}>Submit</button>
            </Modal.Footer>
        </Modal>
    );
};
export default DailyReportForm;
