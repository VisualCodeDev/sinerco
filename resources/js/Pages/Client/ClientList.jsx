import { getFields } from "@/Components/db";
import LoadingSpinner from "@/Components/Loading";
import Modal from "@/Components/Modal";
import TableComponent from "@/Components/TableComponent";
import { useToast } from "@/Components/Toast/ToastProvider";
import {
    formItems,
    getRequestTypeName,
} from "@/Components/utils/dashboard-util";
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
import InputValidationSetting from "../Unit/InputValidationSetting";
import { MdClose } from "react-icons/md";

const ClientList = () => {
    // const columns = tColumns();
    const { data, loading, error } = fetch("client.get");
    const [clients, setClients] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [selectedClient, setSelectedClients] = useState(null);
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
            setLoading(false);
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
                        <h2 className="font-semibold text-base md:text-2xl text-gray-700">
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
                            <div className="flex flex-row items-center gap-3 justify-between w-full">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#e8edfc] text-primary p-1.5 md:p-1.5 rounded-md">
                                        <FaList className="text-2xl md:text-3xl" />
                                    </div>
                                    <h2 className="font-semibold text-base md:text-2xl text-gray-700">
                                        Area
                                    </h2>
                                </div>
                                {selectedClient && (
                                    <div className="flex md:justify-start justify-center">
                                        <button
                                            className="bg-primary text-white p-2 rounded-md text-base"
                                            onClick={() =>
                                                setSettingModal(true)
                                            }
                                        >
                                            <FaCog />
                                        </button>
                                    </div>
                                )}
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
                                    <h2 className="font-semibold text-base md:text-2xl text-gray-700">
                                        Unit
                                    </h2>
                                    <p className="md:text-sm text-xs text-slate-400 font-normal">
                                        ({selectedLocation?.location})
                                    </p>
                                </div>
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
                                                {getRequestTypeName(
                                                    item?.status
                                                ).toUpperCase()}
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
            {isSettingModal && (
                <SettingModal
                    // data={dailyReportSettingData}
                    clientData={selectedClient}
                    isModal={isSettingModal}
                    handleCloseModal={() => setSettingModal(false)}
                    // handleConfirmSettings={handleConfirmSettings}
                />
            )}
        </PageLayout>
    );
};

const SettingModal = (props) => {
    const { clientData, handleCloseModal } = props;
    const [loading, setLoading] = useState({});
    const [settingData, setSettingData] = useState({});
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();
    const [fields, setFields] = useState([]);

    useEffect(() => {
        if (!clientData?.client_id) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const resp = await axios.get(
                    route("unit.setting.get", clientData?.client_id)
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
        const fetchFields = async () => {
            const data = await getFields();
            setFields(data);
        };
        fetchFields();
    }, []);

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-white rounded-xl">
            {loading && <LoadingSpinner />}
            <div className="bg-primary text-white sticky top-0 left-0 text-center py-4 w-full z-[100] font-bold rounded-t-xl">
                {clientData?.name}
                <div
                    className="font-light absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={handleCloseModal}
                >
                    <MdClose />
                </div>
            </div>
            <div className=" bg-white h-[70vh] scale-[.85] flex justify-center">
                <InputValidationSetting
                    data={settingData}
                    clientData={clientData}
                    selectedClients={[clientData?.client_id]}
                />
            </div>
        </div>
    );
};

export default ClientList;
