import { SettingModal } from "@/Components/Dashboard/DailyReportForm";
import TableComponent from "@/Components/TableComponent";
import tColumns from "@/Components/utils/DataUnit/columns";
import PageLayout from "@/Layouts/PageLayout";
import React, { useState } from "react";

const UserDetail = ({ data, userData }) => {
    const columns = tColumns();
    const [isSettingModal, setSettingModal] = useState(false);

    const handleConfirmSettings = () => {};
    return (
        <PageLayout>
            <div className="mb-2">
                <button
                    className="bg-primary text-white px-6 py-2 rounded-md"
                    onClick={() => setSettingModal(true)}
                >
                    Setting
                </button>
            </div>
            <TableComponent columns={columns} data={data} />
            <SettingModal
                isModal={isSettingModal}
                handleCloseModal={() => setSettingModal(false)}
                handleConfirmSettings={handleConfirmSettings}
            />
        </PageLayout>
    );
};

export default UserDetail;
