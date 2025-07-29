import LoadingSpinner from "@/Components/Loading";
import Modal from "@/Components/Modal";
import TableComponent from "@/Components/TableComponent";
import { useToast } from "@/Components/Toast/ToastProvider";
import { formItems } from "@/Components/utils/dashboard-util";
import { fetch } from "@/Components/utils/database-util";
import tColumns from "@/Components/utils/User/columns";
import PageLayout from "@/Layouts/PageLayout";
import { router } from "@inertiajs/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    FaAngleDown,
    FaCog,
    FaFileContract,
    FaList,
    FaUserFriends,
} from "react-icons/fa";

const ClientList = () => {
    // const columns = tColumns();
    const { data, loading, error } = fetch("client.get");
    const [clients, setClients] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [selectedClient, setSelectedClients] = useState([]);
    const [filteredArea, setArea] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState();
    const [isLoading, setLoading] = useState(false);
    // const dailyReportSettingData = unitData?.daily_report_setting || {};
    const [isSettingModal, setSettingModal] = useState(false);

    useEffect(() => {
        const fetchUnits = async () => {
            setLoading(true);
            if (selectedClient) {
                try {
                    const response = await axios.get(
                        route("unit.filter.get", selectedClient)
                    );
                    const data = response.data;

                    const areaMap = new Map();

                    for (const item of data) {
                        const area = item.location.area;
                        const location = item.location;
                        const unit = {
                            ...item.unit,
                            unitAreaLocationId: item.unitAreaLocationId,
                        };

                        if (!areaMap.has(area.id)) {
                            areaMap.set(area.id, {
                                ...area,
                                locations: new Map(),
                            });
                        }

                        const currentArea = areaMap.get(area.id);

                        if (!currentArea.locations.has(location.id)) {
                            currentArea.locations.set(location.id, {
                                ...location,
                                units: [],
                            });
                        }

                        currentArea.locations.get(location.id).units.push(unit);
                    }

                    const groupedAreas = Array.from(areaMap.values()).map(
                        (areaObj) => ({
                            ...areaObj,
                            locations: Array.from(areaObj.locations.values()),
                            isExpanded: false,
                        })
                    );

                    setArea(groupedAreas);
                } catch (err) {
                    console.error("Error fetching unit:", err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUnits();
    }, [data, selectedClient]);

    if (loading) {
        return <LoadingSpinner />;
    }

    const handleClick = (item) => {
        if (!item.unitAreaLocationId) return;
        router.visit(route("daily", item.unitAreaLocationId));
    };

    const handleExpandArea = (item) => {
        setArea((prevAreas) =>
            prevAreas.map((area) =>
                area.id === item.id
                    ? { ...area, isExpanded: !area.isExpanded }
                    : area
            )
        );
    };
    return (
        <PageLayout>
            <div className="flex flex-col md:flex-row w-full h-full p-4 gap-6 md:gap-12 min-h-[90vh]">
                {/* Client List Desktop*/}
                <div className="md:w-1/3 w-full bg-white shadow-md rounded-lg p-10 space-y-2 lg:md:block hidden">
                    <div className="flex flex-row items-center gap-3 mb-6 text-lg md:text-xl font-semibold">
                        <div className="bg-[#e8edfc] text-primary p-1.5 md:p-1.5 rounded-md">
                            <FaUserFriends className="text-2xl md:text-3xl" />
                        </div>
                        <h2 className="font-bold text-base md:text-2xl text-gray-700">
                            Client
                        </h2>
                    </div>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                        {data?.map((item) => (
                            <button
                                key={item?.id}
                                onClick={() => setSelectedClients(item)}
                                className={`w-full text-left px-4 py-2 rounded-md hover:bg-blue-100 text-gray-800 font-medium transition-all duration-150 ${
                                    selectedClient?.id === item?.id
                                        ? "bg-blue-100"
                                        : "bg-gray-100"
                                }`}
                            >
                                {item?.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Client List Mobile*/}
                <div className="md:w-1/3 w-full bg-white shadow-md rounded-lg p-4 space-y-2 lg:md:hidden block">
                    <div className="flex flex-row items-center gap-2 mb-6 text-lg md:text-xl font-semibold">
                        <div className="bg-[#e8edfc] text-primary p-1.5 md:p-1.5 rounded-md">
                            <FaUserFriends className="" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-700">
                            Client
                        </h2>
                    </div>
                    <div className="space-y-2 max-h-[10vh] relative px-2">
                        <div
                            className="flex justify-between items-center"
                            onClick={() => setExpanded(!expanded)}
                        >
                            <div>
                                {selectedClient?.name || clients[0]?.name}
                            </div>
                            <FaAngleDown />
                        </div>
                        <div
                            className={`absolute top-5 left-0 max-h-[20vh] overflow-y-auto ${
                                expanded ? "block" : "hidden"
                            }`}
                        >
                            {data?.map((item) => (
                                <button
                                    key={item?.id}
                                    onClick={() => {
                                        setSelectedClients(item);
                                        setExpanded(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 hover:bg-blue-100 text-gray-800 font-medium transition-all duration-150 ${
                                        selectedClient?.id === item?.id
                                            ? "bg-blue-100"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    {item?.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Unit Contract List */}
                <div className="md:w-1/3 w-full bg-white shadow-md rounded-lg p-4 md:p-10 space-y-2">
                    <div className="flex gap-2 py-4">
                        <div className="flex justify-between items-center mb-4 text-lg md:text-xl font-semibold w-full">
                            <div className="flex flex-row items-center gap-3">
                                <div className="bg-[#e8edfc] text-primary p-1.5 md:p-1.5 rounded-md">
                                    <FaList className="text-2xl md:text-3xl" />
                                </div>
                                <h2 className="font-bold text-base md:text-2xl text-gray-700">
                                    Area
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                        {isLoading && <LoadingSpinner />}
                        {filteredArea?.length > 0 ? (
                            filteredArea.map((area) => (
                                <div className="flex flex-col gap-2">
                                    <div
                                        key={area}
                                        onClick={() => handleExpandArea(area)}
                                        className="px-4 py-2 rounded-md bg-blue-50 text-blue-800 font-medium shadow-sm cursor-pointer"
                                    >
                                        {area?.area}
                                    </div>
                                    {area?.isExpanded &&
                                        area?.locations?.map((loc) => (
                                            <div className="flex gap-2">
                                                <div className="w-4 border-e-4 border-primary" />
                                                <div
                                                    onClick={() =>
                                                        setSelectedLocation({
                                                            units: loc?.units,
                                                            ...loc,
                                                        })
                                                    }
                                                    className={`h-full text-left px-4 py-2 rounded-md hover:bg-blue-100 text-gray-800 font-medium transition-all duration-150 w-full cursor-pointer ${
                                                        selectedLocation?.id ===
                                                        loc?.id
                                                            ? "bg-blue-100"
                                                            : "bg-gray-100"
                                                    }`}
                                                >
                                                    <p>{loc?.location}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 italic">
                                No Data available.
                            </p>
                        )}
                    </div>
                </div>

                {/* UNIT LIST */}
                {selectedLocation && selectedLocation?.units?.length > 0 && (
                    <div className="md:w-1/3 w-full bg-white shadow-md rounded-lg p-4 md:p-10 space-y-2">
                        <div className="flex flex-row justify-between items-center gap-3 mb-6 text-lg md:text-xl font-semibold">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#e8edfc] text-primary p-1.5 md:p-1.5 rounded-md">
                                    <FaList className="text-2xl md:text-3xl" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="font-bold text-base md:text-2xl text-gray-700">
                                        Unit
                                    </h2>
                                    <p className="md:text-sm text-xs text-slate-400 font-normal">
                                        ({selectedLocation?.location})
                                    </p>
                                </div>
                            </div>
                            <div className="flex md:justify-start justify-center">
                                <button
                                    className="bg-primary text-white p-2 rounded-md text-base"
                                    onClick={() => setSettingModal(true)}
                                >
                                    <FaCog />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                            {selectedLocation?.units?.length > 0 ? (
                                selectedLocation?.units?.map((item) => (
                                    <div className="flex flex-col gap-2">
                                        <div
                                            key={item}
                                            onClick={() => handleClick(item)}
                                            className="flex justify-between items-center px-4 py-2 rounded-md bg-blue-50 text-blue-800 font-medium shadow-sm cursor-pointer hover:bg-blue-100 transition duration-100"
                                        >
                                            <p>{item?.unit}</p>
                                            <p
                                                className={`text-xs w-max px-3 py-1 rounded-lg text-white ${
                                                    item?.status === "stdby"
                                                        ? "bg-yellow-500"
                                                        : item?.status === "sd"
                                                        ? "bg-red-500"
                                                        : "bg-green-500"
                                                }`}
                                            >
                                                {item?.status.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 italic">
                                    No Data available.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <SettingModal
                // data={dailyReportSettingData}
                clientData={selectedClient}
                isModal={isSettingModal}
                handleCloseModal={() => setSettingModal(false)}
                // handleConfirmSettings={handleConfirmSettings}
            />
        </PageLayout>
    );
};

const SettingModal = (props) => {
    const { isModal, handleCloseModal, handleConfirmSettings, clientData } =
        props;
    const [loading, setLoading] = useState({});
    const [settingData, setSettingData] = useState({});
    const [formData, setFormData] = useState({});
    const [decimalActive, setDecimalActive] = useState(false);
    const [minMaxActive, setMinMaxActive] = useState(false);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (!clientData?.clientId) return;
        console.log(clientData)
        const fetchData = async () => {
            setLoading(true);
            try {
                const resp = await axios.get(
                    route("unit.setting.get", clientData?.clientId)
                );
                setSettingData(resp.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clientData]);

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
            decimalSetting:
                settingData?.decimalSetting ?? defaultDecimalSetting,
            minMaxSetting: settingData?.minMaxSetting ?? defaultMinMaxSetting,
        }));
    }, [settingData]);
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
                route("daily.setting", { clientId: [clientData?.clientId] }),
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
            {loading && <LoadingSpinner />}
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

export default ClientList;
