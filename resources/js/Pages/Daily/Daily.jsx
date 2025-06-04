import Heading from "@/Components/AdminPage/Heading";
import { useAuth } from "@/Components/Auth/AuthProvider";
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
            <div className="flex h-screen">
                <div className="w-full h-full flex flex-col">
                    {/* TABS DASHBOARD */}
                    <div className="flex">
                        {user?.role === "technician" && (
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
                                        activeTab === "form"
                                            ? ""
                                            : "text-gray-500"
                                    }`}
                                    onClick={() => setActiveTab("form")}
                                >
                                    Fill Report
                                </button>
                            </div>
                        )}

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
                    </div>

                    {/* TABS CONTENT */}
                    <div className="flex-1 border-t-2 border-t-primary border-2">
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
