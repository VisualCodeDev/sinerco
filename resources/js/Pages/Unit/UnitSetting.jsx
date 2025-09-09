import PageLayout from "@/Layouts/PageLayout";
import React, { useState } from "react";
import InputValidationSetting from "./InputValidationSetting";
import UnitInputIntervalSetting from "./UnitInputIntervalSetting";
import { FaClipboardCheck, FaStopwatch } from "react-icons/fa";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import TableComponent from "@/Components/TableComponent";
import tColumns from "@/Components/utils/UnitSetting/columns";
import { fetch } from "@/Components/utils/database-util";
import LoadingSpinner from "@/Components/Loading";
import { useToast } from "@/Components/Toast/ToastProvider";
import axios from "axios";

const UnitSetting = () => {
    const { data: clienData, loading } = fetch("client.get");
    const [formData, setFormData] = useState({
        selectedRows: [],
        clients: {},
    });
    const { addToast } = useToast();

    const handleSelectAll = (currData) => {
        const currentIds = currData.map((item) => item.client_id.toString());
        const selected = formData.selectedRows || [];
        const isAllSelected = currentIds.every((id) => selected.includes(id));
        let updated;
        if (isAllSelected) {
            updated = selected.filter((id) => !currentIds.includes(id));
        } else {
            updated = [...selected];

            currentIds.forEach((id) => {
                if (!updated.includes(id)) {
                    updated.push(id);
                }
            });
        }
        setFormData({ selectedRows: updated });
    };

    const handleCheckItem = (value) => {
        const selected = formData?.selectedRows || [];
        const stringId = value;
        let updated;
        if (selected.includes(stringId)) {
            updated = selected.filter((client_id) => client_id !== stringId);
        } else {
            updated = [...selected, stringId];
        }
        setFormData({
            ...formData,
            selectedRows: updated,
        });
    };

    const handleChange = (name, client, value) => {
        setFormData({
            ...formData,
            clientSettings: {
                ...formData?.clientSettings,
                [client]: {
                    ...formData?.clientSettings?.[client],
                    [name]: value,
                },
            },
        });
    };

    const handleUpdateDisable = async (client_id) => {
        try {
            const resp = await axios.post(
                route("duration.update.disable", { client_id: client_id })
            );
            window.location.reload()
            addToast(resp?.data);
        } catch (e) {
            addToast({ type: "error", text: e.response.data.message });
        }
    };

    const columns = tColumns(
        "checkbox",
        { ...formData },
        { ...clienData },
        handleSelectAll,
        handleChange,
        handleCheckItem,
        handleUpdateDisable
    );

    const handleClientSetting = async (e) => {
        e.preventDefault();

        try {
            const resp = await axios.post(
                route("client.settings", {
                    clientSettings: formData?.clientSettings,
                })
            );
            console.log(resp);
            addToast(resp?.data);
        } catch (e) {
            console.log(e);
            addToast({ type: "error", text: e.response.data.message });
        }
    };
    return (
        <PageLayout>
            {loading && <LoadingSpinner />}
            {/* <TabGroup>
                <TabList>
                    <Tab className=" aria-selected:bg-primary py-4 px-6 aria-selected:text-white rounded-t-md text-gray-500 font-semibold ">
                        <div className="flex justify-center items-center gap-2">
                            <FaClipboardCheck />
                            <p>Input Validation</p>
                        </div>
                    </Tab>
                    <Tab className=" aria-selected:bg-primary py-4 px-6 aria-selected:text-white rounded-t-md text-gray-500 font-semibold ">
                        <div className="flex justify-center items-center gap-2">
                            <FaStopwatch />
                            <p>Input Interval</p>
                        </div>
                    </Tab>
                </TabList>
                <TabPanels className={"p-6 bg-white border shadow-md"}>
                    <TabPanel>
                        <InputValidationSetting />
                    </TabPanel>
                    <TabPanel>
                        <UnitInputIntervalSetting />
                    </TabPanel>
                </TabPanels>
            </TabGroup> */}

            <TableComponent
                title={"Unit Setting"}
                subtitle={"Set interval and duration for each client"}
                isForm
                height="55vh"
                submitPlaceholder="Apply Settings"
                handleSubmit={handleClientSetting}
                columns={columns}
                data={clienData}
            />
            <InputValidationSetting selectedClients={formData?.selectedRows} />
        </PageLayout>
    );
};

export default UnitSetting;
