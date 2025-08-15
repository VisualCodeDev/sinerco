import Heading from "@/Components/AdminPage/Heading";
import { useAuth } from "@/Components/Auth/auth";
import DailyReport from "@/Components/Dashboard/DailyReport";
import DailyReportForm from "@/Components/Dashboard/DailyReportForm";
import UnitTable from "@/Components/Dashboard/UnitTable";
import LoadingSpinner from "@/Components/Loading";
import { fetch } from "@/Components/utils/database-util";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageLayout from "@/Layouts/PageLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    FaRegFileAlt,
    FaRegCalendarAlt,
    FaAngleDown,
    FaAngleUp,
    FaFileContract,
    FaLock,
} from "react-icons/fa";

export default function Dashboard({ data, unitData }) {
    const { user, loading } = useAuth();
    const { data: unitFieldData, loading: isLoadingUnitField } = fetch(
        "field.unit.get",
        unitData?.unitId
    );
    const {
        data: allUnits,
        loading: isLoading,
        error,
    } = fetch("unit.area.get");
    const [expanded, setExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState(
        user?.role === "technician" || user?.role === "operator"
            ? "form"
            : "report"
    );
    const tabs = [
        {
            key: "report",
            label: "Daily Report",
            icon: <FaRegCalendarAlt className="mr-2" />,
        },
        {
            key: "form",
            label: "Fill Report",
            icon: <FaRegFileAlt className="mr-2" />,
        },
        {
            key: "dataUnit",
            label: "Data Unit",
            icon: <FaRegCalendarAlt className="mr-2" />,
        },
        {
            key: "gasComposition",
            label: "Gas Composition",
            icon: <FaRegCalendarAlt className="mr-2" />,
        },
        {
            key: "contract",
            label: "Contract",
            icon: <FaFileContract className="mr-2" />,
        },
        {
            key: "classifiedContract",
            label: "Classified Contract",
            icon: <FaLock className="mr-2" />,
        },
    ];

    if (loading || isLoading) {
        return <LoadingSpinner />;
    }
    return (
        <PageLayout>
            <div className="flex">
                <div className="w-full h-full flex flex-col">
                    {/* TABS DASHBOARD */}
                    <div className="flex w-screen overflow-x-auto">
                        {tabs.map(({ key, label, icon }) => (
                            <div
                                key={key}
                                className={`flex justify-center items-center px-4 py-2 whitespace-nowrap ${
                                    activeTab === key
                                        ? "bg-primary rounded-tr-lg rounded-tl-lg text-white"
                                        : "text-gray-500"
                                }`}
                            >
                                {icon}
                                <button
                                    className={`py-2 font-semibold ${
                                        activeTab === key ? "" : "text-gray-500"
                                    }`}
                                    onClick={() => setActiveTab(key)}
                                >
                                    {label}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* TABS CONTENT */}
                    <div className="flex flex-col border-t-2 border-t-primary shadow-xl">
                        {unitData && (
                            <>
                                <div className="text-center w-full flex flex-col lg:md:gap-2 gap-1 lg:md:py-8 py-6 bg-primary text-white">
                                    <div className="text-xl lg:md:text-2xl font-bold bg-primary flex justify-center items-center">
                                        <div
                                            className="cursor-pointer flex items-center gap-2  relative"
                                            onClick={() =>
                                                setExpanded(!expanded)
                                            }
                                        >
                                            {unitData?.unit?.unit}
                                            {expanded ? (
                                                <FaAngleUp />
                                            ) : (
                                                <FaAngleDown />
                                            )}
                                            <div
                                                className={`absolute z-[100] bg-white text-gray-400 font-semibold text-start text-base w-full top-10 left-0 max-h-[20vh] overflow-y-auto ${
                                                    expanded
                                                        ? "block"
                                                        : "hidden"
                                                }`}
                                            >
                                                {allUnits.map((item) => (
                                                    <p
                                                        className="py-1 px-2"
                                                        onClick={() =>
                                                            router.visit(
                                                                route(
                                                                    "daily",
                                                                    item?.unitAreaLocationId
                                                                )
                                                            )
                                                        }
                                                    >
                                                        {item?.unit?.unit}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="lg:md:text-sm text-xs">
                                        {unitData.area}
                                    </p>
                                    <p className="lg:md:text-sm text-xs">
                                        {unitData.location}
                                    </p>
                                </div>
                            </>
                        )}
                        {activeTab === "form" && (
                            <DailyReportForm
                                unitFieldData={unitFieldData}
                                user={user}
                                unitData={unitData}
                                formData={data}
                            />
                        )}

                        {activeTab === "report" && (
                            <DailyReport
                                unitFieldData={unitFieldData}
                                formData={data}
                                unitData={unitData}
                                user={user}
                            />
                        )}

                        {activeTab === "dataUnit" && (
                            <UnitTable data={allUnits} />
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
