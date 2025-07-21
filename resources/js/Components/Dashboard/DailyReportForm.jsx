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

const DailyReportForm = (props) => {
    const { user } = useAuth();
    const { unitData, formData } = props;
    const [data, setData] = useState({});
    const [isSettingModal, setSettingModal] = useState(false);
    const [isConfirmationModal, setConfirmationModal] = useState(false);
    const [settings, setSettings] = useState();
    const [status, setStatus] = useState();
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setConfirmationModal(true);
    };
    const handleSetReport = async (e) => {
        try {
            setSaving(true);
            const resp = await axios.post(
                route("daily.add", unitData?.unitAreaLocationId),
                data
            );
            if (resp.status === 200 || resp.status === 302) {
                setData({});
                route("daily", unitData?.unitAreaLocationId);
                setConfirmationModal(false);
                setSaving(false);
            } else {
                setStatus("failed");
                setConfirmationModal(false);
                setSaving(false);
            }
        } catch (err) {
            console.error("Error creating report:", err);
            setStatus("error");
            setConfirmationModal(false);
            setSaving(false);
        }
    };
    const handleChange = ([field], value, minMaxSetting) => {
        let warn = "";
        if (minMaxSetting) {
            if (minMaxSetting.min && value < minMaxSetting.min) {
                warn = `Value for ${field} is ${value} (less than ${minMaxSetting.min})`;
            }
            if (minMaxSetting.max && value > minMaxSetting.max) {
                warn = `Value for ${field} is ${value} (greater than ${minMaxSetting.max})`;
            }
        }
        if (field === "date" || field === "time") {
            setData({
                ...data,
                [field]: value,
            });
            return;
        }
        setData((prevData) => ({
            ...prevData,
            [field]: value,
            warn: { ...prevData.warn, [field]: warn },
        }));
    };

    const formList = list({
        handleChange: handleChange,
        formData: formData,
        reportSettings: unitData?.daily_report_setting,
        role: user.role,
    });

    useEffect(() => {
        setData((prevData) => {
            const dateTime = getCurrDateTime();
            const now = dateTime.now;
            const time = now.format("HH") + ":00";
            const date = dateTime.date;
            const newData = {
                ...prevData,
                time,
                date,
            };
            return newData;
        });
    }, []);

    return (
        <div className="flex flex-col justify-center items-start w-full bg-white lg:md:py-8 py-3">
            {saving && <LoadingSpinner text="Saving..." />}
            <div
                className={`sticky top-0 left-0 ${
                    status === "success"
                        ? "bg-green-600 w-100"
                        : "bg-red-600 border-red-500 w-100"
                }`}
            >
                {status === "success" ? (
                    <div className="text-white">
                        <p>Success</p>
                    </div>
                ) : (
                    (status === "failed" || status === "error") && (
                        <div className="text-white">
                            <p>Failed to Submit</p>
                        </div>
                    )
                )}
            </div>

            <div className="w-full lg:md:pt-10 pt-4 lg:md:px-32 px-5 text-[#3A3541]">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 lg:md:gap-x-10 gap-x-4 lg:md:gap-y-8 gap-y-4 mb-4 lg:md:items-center h-full">
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
                        <button className="font-bold w-full h-full">
                            Simpan
                        </button>
                    </div>
                    <ConfirmationModal
                        formData={data}
                        unitData={{
                            area: unitData?.area,
                            location: unitData?.location,
                            unit: unitData?.unit?.unit,
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
                                .filter(([key]) => key !== "UnitAreaLocationId")
                                .map(([key, value]) => (
                                    <div className="flex justify-between font-bold capitalize">
                                        <p>{splitCamelCase(key)} </p>
                                        <p className="text-primary">{value?.unit || value}</p>
                                    </div>
                                ))}
                    </div>
                    <div className="flex flex-col lg:md:gap-2 gap-1.5 w-[90%]">
                        {formData &&
                            Object.entries(formData)
                                .filter(([key, item]) => key != "warn")
                                .map(([key, item]) => (
                                    <div className="flex justify-between capitalize lg:md:text-lg text-sm pb-2.5 border-b border-b-[#e5e5e5]">
                                        <p className="font-semibold">{splitCamelCase(key)}</p>
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
