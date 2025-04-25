import DailyReport from "@/Components/Dashboard/DailyReport";
import DailyReportForm from "@/Components/Dashboard/DailyReportForm";
import { cellItem } from "@/Components/Dashboard/dashboard-util";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageLayout from "@/Layouts/PageLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";

export default function Dashboard({ data }) {
    const [formData, setFormData] = useState();

    return (
        <PageLayout>
            <div className="flex h-[50vh] mt-[10%] px-[5%]">
                <div className="w-[30%] h-full">
                    <div className="flex justify-center">
                        <DailyReportForm />
                    </div>
                </div>
                <div className="w-[70%] h-full overflow-clip">
                    <DailyReport formData={data} />
                </div>
            </div>
        </PageLayout>
    );
}
