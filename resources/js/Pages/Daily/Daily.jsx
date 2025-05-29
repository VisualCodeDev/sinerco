import Heading from "@/Components/AdminPage/Heading";
import DailyReport from "@/Components/Dashboard/DailyReport";
import DailyReportForm from "@/Components/Dashboard/DailyReportForm";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageLayout from "@/Layouts/PageLayout";
import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Dashboard({ data }) {
    const [formData, setFormData] = useState();
    const [activeTab, setActiveTab] = useState("form");

    return (
        <PageLayout>
            <div className="flex h-screen">
                <div className="w-full h-full flex flex-col">
                    {/* TABS DASHBOARD */}
                    <div className="flex">
                        <button
                            className={`px-4 py-2 font-semibold ${
                                activeTab === "form"
                                    ? "bg-primary rounded-tr-lg rounded-tl-lg text-white"
                                    : "text-gray-500"
                            }`}
                            onClick={() => setActiveTab("form")}
                        >
                            Fill Report
                        </button>
                        <button
                            className={`px-4 py-2 font-semibold ${
                                activeTab === "report"
                                    ? "bg-white border-t-2 border-l-2 border-r-2 rounded-tr-lg rounded-tl-lg border-blue-500 text-blue-600"
                                    : "text-gray-500"
                            }`}
                            onClick={() => setActiveTab("report")}
                        >
                            Daily Report
                        </button>
                    </div>

                    {/* TABS CONTENT */}
                    <div className="flex-1 border-t-2 border-t-primary">
                        {activeTab === "form" && (
                            <DailyReportForm />
                        )}

                        {activeTab === "report" && (
                            <DailyReport formData={data} />
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
