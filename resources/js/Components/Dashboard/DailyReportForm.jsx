import React, { useEffect, useState } from "react";
import Card from "../Card";
import {
    formItems,
    DateInput,
    getCurrDateTime,
    TimeInput,
    toCapitalizeFirstLetter,
    getFormattedDate,
} from "../utils/dashboard-util";
import { router, usePage } from "@inertiajs/react";
import list from "../utils/DailyReport/columns";
import Modal from "../Modal";
import { FaAngleDown, FaCog } from "react-icons/fa";

const DailyReportForm = (props) => {
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
    const handleChange = ([field], value) => {
        setData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };
    const formList = list({
        handleChange: handleChange,
        formData: formData,
        reportSettings: unitData?.daily_report_setting,
    });

    const handleConfirmSettings = (value) => {
        setSettings({ ...value });
    };
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
        <div className="flex flex-col justify-center items-start w-full bg-white p-10">
            {saving && (
                <div className="flex justify-center items-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen z-[200] text-5xl">
                    <div className="bg-black/50 w-full h-full absolute top-0 left-0 backdrop-blur-sm z-[20] " />
                    <h1 className="relative z-[30] text-white">SAVING...</h1>
                </div>
            )}
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
            {unitData && (
                <>
                    <div className="text-center w-full flex flex-col gap-2">
                        <div>
                            <p className="text-2xl font-bold">
                                {unitData.unit?.unit}
                            </p>
                            <p className="text-sm">{unitData.area}</p>
                            <p className="text-sm">{unitData.location}</p>
                        </div>
                        <div className="flex justify-center items-center ">
                            <div className="w-1/7 flex justify-center items-center bg-primary text-white px-6 py-2 rounded-md gap-2 hover:bg-white hover:border-primary hover:border-2 hover:text-primary">
                                <FaCog />
                                <button
                                    className=""
                                    onClick={() => setSettingModal(true)}
                                >
                                    Setting
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
            <div className="w-full mt-10 px-32 text-[#3A3541]">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-x-10 gap-y-8 mb-4 items-center">
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
                    <div>
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
            size={"md"}
        >
            <Modal.Body>
                <div>
                    {unitData &&
                        Object.entries(unitData)
                            .filter(([key]) => key !== "UnitAreaLocationId")
                            .map(([key, value]) => (
                                <div className="flex justify-between">
                                    <p>{toCapitalizeFirstLetter(key)} </p>
                                    <p>{value?.unit || value}</p>
                                </div>
                            ))}

                    {formData &&
                        Object.entries(formData).map(([key, value]) => (
                            <div className="flex justify-between">
                                <p>{toCapitalizeFirstLetter(key)} </p>
                                <p>
                                    {key === "date"
                                        ? getFormattedDate(value)
                                        : value}
                                </p>
                            </div>
                        ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={handleSubmit}>Submit</button>
            </Modal.Footer>
        </Modal>
    );
};
export default DailyReportForm;
