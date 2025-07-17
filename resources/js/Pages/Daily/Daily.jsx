import Heading from "@/Components/AdminPage/Heading";
import { useAuth } from "@/Components/Auth/auth";
import DailyReport from "@/Components/Dashboard/DailyReport";
import DailyReportForm from "@/Components/Dashboard/DailyReportForm";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageLayout from "@/Layouts/PageLayout";
import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";
import { FaRegFileAlt, FaRegCalendarAlt } from "react-icons/fa";

export default function Dashboard({ data, unitData }) {
    const { user } = useAuth();
    if (!user) {
        return (
            <PageLayout>
                <div>Loading...</div>
            </PageLayout>
        );
    }
    const [activeTab, setActiveTab] = useState(
        user?.role === "technician" || user?.role === "operator"
            ? "form"
            : "report"
    );
    return (
        <PageLayout>
            <div className="flex">
                <div className="w-full h-full flex flex-col">
                    {/* TABS DASHBOARD */}
                    <div className="flex">
                        <div
                            className={`flex justify-center items-center px-4 py-2" ${
                                activeTab === "report"
                                    ? "bg-primary rounded-tr-lg rounded-tl-lg text-white"
                                    : "text-gray-500"
                            }`}
                        >
                            <FaRegCalendarAlt className="mr-2" />
                            <button
                                className={`py-2 font-semibold ${
                                    activeTab === "report"
                                        ? ""
                                        : "text-gray-500"
                                }`}
                                onClick={() => setActiveTab("report")}
                            >
                                Daily Report
                            </button>
                        </div>
                        <div
                            className={`flex justify-center items-center px-4 py-2" ${
                                activeTab === "form"
                                    ? "bg-primary rounded-tr-lg rounded-tl-lg text-white"
                                    : "text-gray-500"
                            }`}
                        >
                            <FaRegFileAlt className="mr-2" />
                            <button
                                className={`py-2 font-semibold ${
                                    activeTab === "form" ? "" : "text-gray-500"
                                }`}
                                onClick={() => setActiveTab("form")}
                            >
                                Fill Report
                            </button>
                        </div>
                    </div>

                    {/* TABS CONTENT */}
                    <div className="flex flex-col border-t-2 border-t-primary shadow-xl">
                        {unitData && (
                            <>
                                <div className="text-center w-full flex flex-col lg:md:gap-2 gap-1 lg:md:py-8 py-6 bg-primary text-white">
                                    <p className="lg:md:text-2xl text-xl font-bold">
                                        {unitData.unit?.unit}
                                    </p>
                                    <p className="lg:md:text-sm text-xs">{unitData.area}</p>
                                    <p className="lg:md:text-sm text-xs">
                                        {unitData.location}
                                    </p>
                                </div>
                            </>
                        )}
                        {activeTab === "form" && (
                            <DailyReportForm
                                unitData={unitData}
                                formData={data}
                            />
                        )}

                        {activeTab === "report" && (
                            <DailyReport formData={data} unitData={unitData} />
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
