import LoadingSpinner from "@/Components/Loading";
import TableComponent from "@/Components/TableComponent";
import { fetch } from "@/Components/utils/database-util";
// import columns from "@/Components/utils/Setting/columns";
import tColumns from "@/Components/utils/User/columns";
import PageLayout from "@/Layouts/PageLayout";
import { router } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import { FaAngleDown, FaNewspaper, FaPlus, FaUser } from "react-icons/fa";

const UserList = () => {
    const [formData, setFormData] = useState({});
    const [selectedRole, setRole] = useState(null);
    const { data: users, loading, error } = fetch("user.get");
    const [filteredUser, setFilteredUser] = useState();

    const onRowClick = (item) => {
        router.visit(route("allocation", item?.id));
    };
    
    useEffect(() => {
        if (loading) return;
        let selectedFilterUser = users;
        if (selectedRole) {
            selectedFilterUser = users?.filter(
                (item) => item?.role_id === selectedRole?.id
            );
        }
        setFilteredUser(selectedFilterUser);
    }, [selectedRole, users]);

    const handleSelectAll = (currData) => {
        const currentIds = currData.map((item) => item.id?.toString());
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
            updated = selected.filter((id) => id !== stringId);
        } else {
            updated = [...selected, stringId];
        }
        setFormData({
            ...formData,
            selectedRows: updated,
        });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const columns = tColumns({ formData, handleSelectAll, handleCheckItem });
    return (
        <PageLayout>
            <TableComponent
                columns={columns}
                data={users}
                filterUserLocation={true}
                onRowClick={onRowClick}
            />
        </PageLayout>
    );
};

export default UserList;
