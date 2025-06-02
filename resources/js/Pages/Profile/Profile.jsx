import TableComponent from "@/Components/TableComponent";
import tColumns from "@/Components/utils/DataUnit/columns";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useState } from "react";

const Profile = ({ data, permissionData, unitAreaData }) => {
    const [formData, setFormData] = useState({
        selectedRows: [],
    });
    const [unitArea, setUnitArea] = useState([]);
    const [userDataUnit, setUserDataUnit] = useState(null);

    const columns = tColumns("checkbox", { ...formData });
    useEffect(() => {
        if (data?.role === "technician") {
            const uniqueUsersMap = new Map();

            unitAreaData?.forEach((item) => {
                const user = item.user;
                if (!uniqueUsersMap.has(user.userId)) {
                    uniqueUsersMap.set(user.userId, user);
                }
            });

            const uniqueUsers = Array.from(uniqueUsersMap.values());

            setUserDataUnit(uniqueUsers);
        } else {
            setUserDataUnit(unitAreaData);
        }
    }, []);

    const handleSelect = (field, value) => {
        const itemData = unitAreaData.filter((item) => {
            return item?.userId === value;
        });
        setUnitArea(itemData);
        // setFormData({ ...formData, [field]: value });
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
        if (formData.selectedRows) {
        }
    };
    if (!userDataUnit || !data) {
        return <div>LOADING..</div>;
    }

    return (
        <PageLayout>
            <div>{data?.name}</div>
            <div>{data?.role}</div>
            <select
                onChange={(e) => handleSelect("userDataUnitId", e.target.value)}
            >
                <option value={null}>---Select Branch Unit---</option>
                {userDataUnit.map((item, index) => {
                    return (
                        <option key={index} value={item?.userId}>
                            {item?.user}
                        </option>
                    );
                })}
            </select>
            {data?.role === "technician" && (
                <TableComponent
                    columns={columns}
                    data={unitArea}
                    onRowClick={handleCheckItem}
                />
            )}

            <button onClick={handleSubmit}>Submit</button>
        </PageLayout>
    );
};

export default Profile;
