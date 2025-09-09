import LoadingSpinner from "@/Components/Loading";
import TableComponent from "@/Components/TableComponent";
import { useToast } from "@/Components/Toast/ToastProvider";
import { fetch } from "@/Components/utils/database-util";
// import columns from "@/Components/utils/Setting/columns";
import tColumns from "@/Components/utils/User/columns";
import PageLayout from "@/Layouts/PageLayout";
import { router } from "@inertiajs/react";
import React, { use, useEffect, useState } from "react";
import { FaAngleDown, FaNewspaper, FaPlus, FaUser } from "react-icons/fa";

const UserList = () => {
    const [formData, setFormData] = useState({});
    const [selectedRole, setSelectedRole] = useState(null);
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editUserLocation, setEditUserLocation] = useState(false);
    const [filteredUser, setFilteredUser] = useState();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const [roleResp, userResp] = await Promise.all([
                axios.get(route("roles.get")),
                axios.get(route("user.get")),
            ]);
            setRoles(roleResp.data);
            setUsers(userResp.data);
            setLoading(false);
        };
        fetch();
    }, []);

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
        const stringId = value?.id?.toString();
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

    const columns = tColumns({
        formData,
        handleSelectAll,
        handleCheckItem,
        onRowClick,
    });
    const { addToast } = useToast();
    const handleSubmit = async ({ type }) => {
        try {
            let resp;
            if (type === "edit") {
                setEditUserLocation(true);
            }
            if (type === "delete") {
                resp = await axios.post(route("user.bulkDelete"), {
                    users: formData.selectedRows,
                });
                console.log(resp);
            }

            if (type === "reset") {
                resp = await axios.post(route("user.bulkDelete"), {
                    ...formData,
                });
            }
            addToast(resp?.data);
        } catch (e) {
            console.log(e);
            addToast({ type: "error", text: e.response.data.message });
        }
    };

    return (
        <PageLayout>
            <TableComponent
                height={"55vh"}
                roles={roles}
                isUserList={true}
                isResponsive={true}
                handleSubmit={handleSubmit}
                columns={columns}
                data={users}
                filterUserRole={true}
                onRowClick={handleCheckItem}
            />
        </PageLayout>
    );
};

export default UserList;
