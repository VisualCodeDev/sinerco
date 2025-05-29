import React, { useEffect, useState } from "react";
import Card from "../Card";
import {
    formItems,
    DateInput,
    getCurrDateTime,
    TimeInput,
} from "../utils/dashboard-util";
import { router, usePage } from "@inertiajs/react";
import list from "../utils/DailyReport/columns";
import Modal from "../Modal";

const DailyReportForm = (props) => {
    const { unitData } = props;
    const [data, setData] = useState({});
    const [isModal, setModal] = useState(false);
    const [settings, setSettings] = useState();
    const [status, setStatus] = useState();
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const resp = await axios.post(route("daily.add"), data);
            console.log(loading);
            if (resp.status === 200 || resp.status === 302) {
                console.log(status);
                setData({});
                window.location.href = route("daily");
                setSaving(false);
            } else {
                setStatus("failed");
                setSaving(false);
            }
        } catch (err) {
            console.error("Error creating report:", err);
            setStatus("error");
            setSaving(false);
        }
    };

    const handleChange = ([field], value) => {
        setData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };
    const formList = list(handleChange);

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
                                {unitData.unit}
                            </p>
                            <p className="text-sm">{unitData.area}</p>
                            <p className="text-sm">{unitData.location}</p>
                        </div>
                        <div>
                            <button
                                className="bg-primary text-white px-6 py-2 rounded-md"
                                onClick={() => setModal(true)}
                            >
                                Setting
                            </button>
                        </div>
                    </div>
                    <SettingModal
                        handleConfirmSettings={handleConfirmSettings}
                        isModal={isModal}
                        handleCloseModal={() => setModal(false)}
                    />
                </>
            )}
            <form onSubmit={handleSubmit} method="POST">
                <div className="grid grid-cols-2 gap-4 mb-4 items-center">
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
                    <button type="submit" className="font-bold w-full h-full">
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    );
};

const SettingModal = (props) => {
    const { isModal, handleCloseModal, handleConfirmSettings } = props;
    const [formData, setFormData] = useState({});

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };
    const handleSave = () => {
        let formattedDecimal = {};
        for (const key in formData) {
            const value = formData[key];
            const maxDecimal = 1 / Math.pow(10, value);
            formattedDecimal = {
                ...formattedDecimal,
                [key]: maxDecimal,
            };
        }
        console.log(formattedDecimal);
        // handleConfirmSettings(formData);
    };
    return (
        <Modal
            title={"Setting"}
            handleCloseModal={handleCloseModal}
            showModal={isModal}
            size={"md"}
        >
            <Modal.Body>
                <div className="flex flex-col gap-2">
                    {formItems.map((item) => (
                        <div className="flex justify-between items-center">
                            <p>{item.header}</p>
                            <input
                                type="number"
                                step={1}
                                min={0}
                                placeholder="? dibelakang koma"
                                onChange={(e) =>
                                    handleChange(item?.name, e.target.value)
                                }
                                value={formData?.item?.name}
                            />
                        </div>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={handleSave}>Simpan</button>
            </Modal.Footer>
        </Modal>
    );
};
export default DailyReportForm;
