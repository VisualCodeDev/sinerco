import TableComponent from "@/Components/TableComponent";
import tColumns from "@/Components/utils/DataUnit/columns";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useState } from "react";

const Profile = ({ data, permissionData, unitAreaData }) => {
    const [formData, setFormData] = useState({
        selectedRows: [],
    });
    const [unitArea, setUnitArea] = useState(unitAreaData || []);
    const [client, setClient] = useState(null);

    const allIds = unitArea?.map((item) => item.unitAreaLocationId.toString());

    useEffect(() => {
        // if (data?.role === "technician") {
        const uniqueClientsMap = new Map();

        unitAreaData?.forEach((item) => {
            const client = item.client;
            if (!uniqueClientsMap.has(client?.clientId)) {
                uniqueClientsMap.set(client?.clientId, client);
            }
        });

        const uniqueClients = Array.from(uniqueClientsMap.values());

        setClient(uniqueClients);
        // } else {
        //     setClient(unitAreaData);
        // }
    }, []);

    const handleSelect = (value) => {
        const itemData = unitAreaData.filter((item) => {
            return item?.clientId === value;
        });
        if (itemData.length === 0) {
            setUnitArea(unitAreaData);
        } else {
            setUnitArea(itemData);
        } // setFormData({ ...formData, [field]: value });
    };

    const handleSelectAll = () => {
        const currentIds = unitArea.map((item) =>
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

        setFormData({ ...formData, selectedRows: updated });
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
            ...formData,
            selectedRows: updated,
        });
    };

    const handleSubmit = () => {
        if (formData?.selectedRows) {
        }
    };
    const columns = tColumns(
        "checkbox",
        { ...formData },
        { ...unitArea },
        handleSelectAll
    );

    return (
        <PageLayout>
            <div>{data?.name}</div>
            <div>{data?.role}</div>
            <select onChange={(e) => handleSelect(e.target.value)}>
                <option value={null}>---Select Branch Unit---</option>
                {client?.map((item, index) => {
                    return (
                        <option key={index} value={item?.clientId}>
                            {item?.name}
                        </option>
                    );
                })}
            </select>
            <TableComponent
                columns={columns}
                data={unitArea}
                onRowClick={handleCheckItem}
            />

            <button onClick={handleSubmit}>Submit</button>
        </PageLayout>
    );
};

export default Profile;
