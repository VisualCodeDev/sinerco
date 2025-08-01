import TableComponent from "@/Components/TableComponent";
import { useToast } from "@/Components/Toast/ToastProvider";
import tColumns from "@/Components/utils/DataUnit/columns";
import PageLayout from "@/Layouts/PageLayout";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import UserInfo from "./UserInfo";
import { fetch } from "@/Components/utils/database-util";
import LoadingSpinner from "@/Components/Loading";

const UserAllocationSetting = ({ data, unitAreaData, roleData }) => {
    const {
        data: permittedData,
        loading,
        error,
    } = fetch("permittedUnitData.get", data?.id);
    const [initialUser, setInitialUser] = useState(data);
    const [isAdmin, setIsAdmin] = useState(false);
    const [formData, setFormData] = useState({
        selectedRows: [],
    });

    const [unselectedUnitArea, setUnselectedUnitArea] = useState(
        unitAreaData || []
    );
    const [permittedUnitArea, setPermittedUnitArea] = useState(
        permittedData || []
    );
    const { addToast } = useToast();

    useEffect(() => {
        if (permittedData?.length > 0) {
            const permitted = permittedData.map((item) => item?.unit_area);
            setPermittedUnitArea(permitted);
        }
    }, [permittedData]);

    useEffect(() => {
        if (unselectedUnitArea?.length > 0) {
            const unselectedItem = unitAreaData.filter((item) =>
                permittedUnitArea?.every(
                    (permittedItem) =>
                        item?.unitAreaLocationId !==
                        permittedItem?.unitAreaLocationId
                )
            );
            // Filter out items that are already in permittedUnitArea
            setUnselectedUnitArea(unselectedItem);
        }
    }, [permittedUnitArea]);

    const handleSelectAll = (currData) => {
        const currentIds = currData.map((item) =>
            item.unitAreaLocationId.toString()
        );
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
        const stringId = value?.unitAreaLocationId.toString();
        let updated;
        if (selected.includes(stringId)) {
            updated = selected.filter(
                (unitAreaLocationId) => unitAreaLocationId !== stringId
            );
        } else {
            updated = [...selected, stringId];
        }
        setFormData({
            selectedRows: updated,
        });
    };

    const columns = tColumns(
        "checkbox",
        { ...formData },
        { ...unselectedUnitArea },
        handleSelectAll
    );

    const handleAddPermission = async (e) => {
        e.preventDefault();
        const selectedRows = formData.selectedRows || [];
        const selectedData = unselectedUnitArea
            .filter((item) =>
                selectedRows.includes(item.unitAreaLocationId.toString())
            )
            .map((item) => item?.unitAreaLocationId);
        try {
            const resp = await axios.post(
                route("allocation.add", { userId: data?.id }),
                {
                    unitAreaLocationId: selectedData,
                    userId: data?.id,
                }
            );
            if (resp?.data?.isSuccess) {
                addToast({
                    type: "success",
                    text: "Permissions updated successfully!",
                });
                handleAfterAdd(selectedData);
                // setPermittedUnitArea(updatedPermittedData);
            }
        } catch (error) {
            console.error("Error updating permitted data:", error);
            addToast({
                type: "error",
                text: "Failed to update permissions.",
            });
        }
    };

    const handleRemovePermission = async (e) => {
        e.preventDefault();
        const selectedRows = formData.selectedRows || [];
        const selectedData = permittedUnitArea
            .filter((item) =>
                selectedRows.includes(item.unitAreaLocationId.toString())
            )
            .map((item) => item?.unitAreaLocationId);
        try {
            const resp = await axios.post(
                route("allocation.remove", { userId: data?.id }),
                {
                    unitAreaLocationId: selectedData,
                    userId: data?.id,
                }
            );
            if (resp?.data?.isSuccess) {
                addToast({
                    type: "success",
                    text: "Permissions updated successfully!",
                });
            }
            handleAfterRemove(selectedData);
        } catch (error) {
            console.error("Error updating permitted data:", error);
            addToast({
                type: "error",
                text: "Failed to update permissions.",
            });
        }
    };

    const handleAfterRemove = (selectedData) => {
        const updatedPermittedData = permittedUnitArea.filter(
            (item) =>
                !selectedData.includes(item.unitAreaLocationId) &&
                item?.unitAreaLocationId
        );
        setPermittedUnitArea(updatedPermittedData);

        const updatedUnselectedData = unitAreaData.filter(
            (item) =>
                selectedData.includes(item.unitAreaLocationId) &&
                item?.unitAreaLocationId
        );
        setUnselectedUnitArea([
            ...unselectedUnitArea,
            ...updatedUnselectedData,
        ]);
        setFormData({ selectedRows: [] });
    };

    const handleAfterAdd = (selectedData) => {
        const updatedUnselectedData = unselectedUnitArea.filter(
            (item) =>
                !selectedData.includes(item.unitAreaLocationId) &&
                item?.unitAreaLocationId
        );
        setUnselectedUnitArea([
            ...unselectedUnitArea,
            ...updatedUnselectedData,
        ]);

        const updatedPermittedData = unitAreaData.filter(
            (item) =>
                selectedData.includes(item.unitAreaLocationId) &&
                item?.unitAreaLocationId
        );
        setPermittedUnitArea([...permittedUnitArea, ...updatedPermittedData]);

        setFormData({ selectedRows: [] });
    };

    const saveUser = async (user) => {
        if (!user) return;

        const isUnchanged =
            user.name === initialUser.name && user.role === initialUser.role_id;

        if (isUnchanged) {
            return;
        }

        try {
            const resp = await axios.post(route("user.edit", initialUser?.id), user);
            setInitialUser(user);
            addToast(resp?.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const checkAdmin =
            roleData?.find((item) => item?.id === data?.role_id)?.name ===
            "super_admin";
        setIsAdmin(checkAdmin);
    }, [roleData]);
    return (
        <PageLayout>
            {loading && <LoadingSpinner />}
            {/* <select onChange={(e) => handleSelect(e.target.value)}>
                <option value={null}>---Select Branch Unit---</option>
                {client?.map((item, index) => {
                    return (
                        <option key={index} value={item?.clientId}>
                            {item?.name}
                        </option>
                    );
                })}
            </select> */}
            <TabGroup>
                <TabList className={"flex space-x-1"}>
                    <Tab
                        className="hover:underline aria-selected:bg-primary py-2 px-4 aria-selected:text-white rounded-t-2xl"
                        onClick={() => setFormData({ selectedRows: [] })}
                    >
                        User Info
                    </Tab>
                    {!isAdmin && (
                        <>
                            <Tab
                                className="hover:underline aria-selected:bg-primary py-2 px-4 aria-selected:text-white rounded-t-2xl"
                                onClick={() =>
                                    setFormData({ selectedRows: [] })
                                }
                            >
                                Permitted
                            </Tab>
                            <Tab
                                className="hover:underline aria-selected:bg-primary py-2 px-4 aria-selected:text-white rounded-t-2xl"
                                onClick={() =>
                                    setFormData({ selectedRows: [] })
                                }
                            >
                                Edit Permission
                            </Tab>
                        </>
                    )}
                </TabList>

                <TabPanels className={"p-5 bg-white border shadow-md"}>
                    <TabPanel>
                        <UserInfo
                            roleData={roleData}
                            data={{
                                name: initialUser?.name,
                                email: initialUser?.email,
                                role: initialUser?.role_id,
                            }}
                            onSave={(updatedData) => {
                                saveUser(updatedData);
                            }}
                        />
                    </TabPanel>
                    <TabPanel>
                        <TableComponent
                            title={"Permitted"}
                            subtitle={data?.name}
                            isForm
                            submitPlaceholder="Remove"
                            height="55vh"
                            columns={columns}
                            data={permittedUnitArea}
                            handleSubmit={handleRemovePermission}
                            onRowClick={handleCheckItem}
                        />
                    </TabPanel>
                    <TabPanel>
                        <TableComponent
                            title={"Edit Permission"}
                            subtitle={data?.name}
                            isForm
                            height="55vh"
                            submitPlaceholder="Add"
                            handleSubmit={handleAddPermission}
                            columns={columns}
                            data={unselectedUnitArea}
                            onRowClick={handleCheckItem}
                        />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </PageLayout>
    );
};

export default UserAllocationSetting;
