import Modal from "@/Components/Modal";
import TableComponent from "@/Components/TableComponent";
import { useToast } from "@/Components/Toast/ToastProvider";
import { formItems } from "@/Components/utils/dashboard-util";
import tColumns from "@/Components/utils/DataUnit/columns";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useState } from "react";
import { FaAngleDown } from "react-icons/fa";

const ClientDetail = ({ data, unitData }) => {
    const columns = tColumns();
    const clientData = unitData?.client || {};
    const dailyReportSettingData = unitData?.daily_report_setting || {};
    const [isSettingModal, setSettingModal] = useState(false);
    const handleConfirmSettings = () => {};
    return (
        <PageLayout>
            <div className="flex md:justify-start justify-center">
                <div className="my-4">
                    <button
                        className="bg-primary text-white px-6 py-2 rounded-md"
                        onClick={() => setSettingModal(true)}
                    >
                        Setting
                    </button>
                </div>
            </div>
            <TableComponent columns={columns} data={data} />
            <SettingModal
                data={dailyReportSettingData}
                clientData={clientData}
                isModal={isSettingModal}
                handleCloseModal={() => setSettingModal(false)}
                handleConfirmSettings={handleConfirmSettings}
            />
        </PageLayout>
    );
};

const SettingModal = (props) => {
    const {
        isModal,
        handleCloseModal,
        handleConfirmSettings,
        data,
        clientData,
    } = props;
    const [formData, setFormData] = useState({});
    const [decimalActive, setDecimalActive] = useState(false);
    const [minMaxActive, setMinMaxActive] = useState(false);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        let defaultDecimalSetting = {};
        let defaultMinMaxSetting = {};

        formItems
            .filter((item) => item.name !== "time")
            .forEach((item) => {
                if (item?.default?.decimalSetting) {
                    defaultDecimalSetting[item.name] =
                        item.default.decimalSetting;
                }
                if (item?.default?.minSetting || item?.default?.maxSetting) {
                    defaultMinMaxSetting[item.name] = {
                        min: item.default.minSetting,
                        max: item.default.maxSetting,
                    };
                }
            });

        setFormData((prev) => ({
            ...prev,
            decimalSetting: data?.decimalSetting ?? defaultDecimalSetting,
            minMaxSetting: data?.minMaxSetting ?? defaultMinMaxSetting,
        }));
    }, []);

    const handleChange = (settingType, field, value) => {
        if (settingType === "decimalSetting") {
            setFormData({
                ...formData,
                [settingType]: {
                    ...formData[settingType],
                    [field]: value,
                },
            });
        } else if (settingType === "minMaxSetting") {
            setFormData((prev) => ({
                ...prev,
                [settingType]: {
                    ...prev[settingType],
                    [field]: {
                        ...prev[settingType]?.[field],
                        ...value,
                    },
                },
            }));
        }
    };
    const handleSave = async () => {
        let formattedDecimal = {};
        try {
            setSaving(true);
            const resp = await axios.post(
                route("daily.setting", { client_id: clientData?.client_id }),
                formData
            );
            if (resp.status === 200 || resp.status === 302) {
                addToast(resp.data);
                setSaving(false);
            } else {
                setStatus("failed");
                setSaving(false);
            }
        } catch (err) {
            console.error("Error creating report:", err);
            setSaving(false);
        }
        // for (const key in formData) {
        //     const value = formData[key];
        //     const maxDecimal = 1 / Math.pow(10, value);
        //     formattedDecimal = {
        //         ...formattedDecimal,
        //         [key]: maxDecimal,
        //     };
        // }
        // handleConfirmSettings(formData);
    };
    const options = [];
    for (let i = 0; i <= 10; i++) {
        options.push(
            <option key={i} value={i}>
                {i}
            </option>
        );
    }
    return (
        <Modal
            title={"Setting"}
            handleCloseModal={handleCloseModal}
            showModal={isModal}
            size={"responsive"}
        >
            <Modal.Body>
                <div className="flex flex-col gap-2">
                    <div>
                        <div className="mb-4">
                            <div
                                className="border-b-2 py-2 mb-4 md:mb-0 text-md md:text-lg flex justify-between items-center sticky top-0 left-0 bg-white cursor-pointer"
                                onClick={() => setDecimalActive(!decimalActive)}
                            >
                                <p className="font-semibold">
                                    Decimal Settings
                                </p>
                                <FaAngleDown className="font-light" />
                            </div>
                            {decimalActive && (
                                <div className="md:p-3 pt-1 flex flex-col gap-2">
                                    {formItems
                                        .filter((item) => item.name !== "time")
                                        .map((item) => (
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="md:w-1/2 font-semibold">
                                                    {item.header}
                                                </p>
                                                <select
                                                    className="py-1 md:w-[100px]"
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "decimalSetting",
                                                            item?.name,
                                                            e.target.value
                                                        )
                                                    }
                                                    value={
                                                        formData
                                                            ?.decimalSetting?.[
                                                            item.name
                                                        ] || ""
                                                    }
                                                >
                                                    {options.map((item) => (
                                                        <>{item}</>
                                                    ))}
                                                </select>
                                                {/* <input
                                                    type="number"
                                                    step={1}
                                                    min={0}
                                                    placeholder="? dibelakang koma"
                                                    onChange={(e) =>
                                                        handleChange(
                                                            "decimalSetting",
                                                            item?.name,
                                                            e.target.value
                                                        )
                                                    }
                                                    value={
                                                        formData
                                                            ?.decimalSetting?.[
                                                            item.name
                                                        ] || ""
                                                    }
                                                /> */}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <div
                                className="border-b-2 py-2 text-md md:text-lg mb-4 md:mb-0 flex justify-between items-center sticky top-0 left-0 bg-white cursor-pointer"
                                onClick={() => setMinMaxActive(!minMaxActive)}
                            >
                                <p className="font-semibold">MinMax Settings</p>
                                <FaAngleDown className="font-light" />
                            </div>
                            {minMaxActive && (
                                <div className="md:p-3 pt-1 flex flex-col gap-2">
                                    {formItems
                                        .filter((item) => item.name !== "time")
                                        .map((item) => (
                                            <div className="flex flex-col justify-between items-center md:flex-row mb-4 md:mb-2">
                                                <p className="mb-2 md:mb-0 font-semibold">
                                                    {item.header}
                                                </p>
                                                <div className="flex flex-col md:flex-row gap-2">
                                                    <input
                                                        className="md:w-[100px]"
                                                        type="number"
                                                        step={1}
                                                        placeholder="min."
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "minMaxSetting",
                                                                item?.name,
                                                                {
                                                                    min: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        value={
                                                            formData
                                                                ?.minMaxSetting?.[
                                                                item.name
                                                            ]?.min || ""
                                                        }
                                                    />
                                                    <input
                                                        className="md:w-[100px]"
                                                        type="number"
                                                        step={1}
                                                        placeholder="max."
                                                        onChange={(e) =>
                                                            handleChange(
                                                                "minMaxSetting",
                                                                item?.name,
                                                                {
                                                                    max: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        value={
                                                            formData
                                                                ?.minMaxSetting?.[
                                                                item.name
                                                            ]?.max || ""
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={handleSave}>Simpan</button>
            </Modal.Footer>
        </Modal>
    );
};
export default ClientDetail;
