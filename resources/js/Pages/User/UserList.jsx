import LoadingSpinner from "@/Components/Loading";
import Modal from "@/Components/Modal";
import TableComponent from "@/Components/TableComponent";
import { useToast } from "@/Components/Toast/ToastProvider";
import { fetch } from "@/Components/utils/database-util";
// import columns from "@/Components/utils/Setting/columns";
import tColumns from "@/Components/utils/User/columns";
import uColumns from "@/Components/utils/DataUnit/columns";
import PageLayout from "@/Layouts/PageLayout";
import { router } from "@inertiajs/react";
import React, { use, useEffect, useState } from "react";
import { FaAngleDown, FaNewspaper, FaPlus, FaUser } from "react-icons/fa";

const UserList = () => {
    const [formData, setFormData] = useState({
        selectedRows: [],
    });
    const [selectedRole, setSelectedRole] = useState(null);
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editUserLocationModal, setEditUserLocationModal] = useState(false);
    const [deleteConfirmationModal, setDeleteConfirmationModal] =
        useState(false);
    const [filteredUser, setFilteredUser] = useState();
    const { addToast } = useToast();

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

    const handleSubmit = async ({ type }) => {
        if (formData?.selectedRows?.length === 0) {
            return addToast({
                type: "error",
                text: "Account is needed",
            });
        }
        try {
            let resp;
            if (type === "edit") {
                setEditUserLocationModal(true);
            }
            if (type === "delete") {
                setDeleteConfirmationModal(true);
            }

            if (type === "reset") {
                resp = await axios.post(route("user.bulk.reset"), {
                    users: formData.selectedRows,
                });
                if (resp.status === 200) {
                    const selectedUsers = users
                        .filter((item) =>
                            formData?.selectedRows.includes(String(item?.id))
                        )
                        .map(({ areas, ...rest }) => rest);

                    const updatedUsers = users.map((user) => {
                        const found = selectedUsers.find(
                            (u) => u.id === user.id
                        );
                        return found ? found : user;
                    });

                    setFormData({ selectedRows: [] });
                    setUsers(updatedUsers);
                }
            }
            if (resp) addToast(resp?.data);
        } catch (e) {
            console.log(e);
            addToast({ type: "error", text: e.response.data.message });
        }
    };

    const handleDelete = async () => {
        try {
            const resp = await axios.post(route("user.bulkDelete"), {
                users: formData.selectedRows,
            });
            addToast(resp?.data);
            setDeleteConfirmationModal(false);
            window.location.reload();
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
            {editUserLocationModal && (
                <EditUserLocationModal
                    setUsers={setUsers}
                    users={users}
                    setModal={setEditUserLocationModal}
                    isModal={editUserLocationModal}
                    setFormData={setFormData}
                    user_id={formData.selectedRows}
                    addToast={addToast}
                />
            )}
            {deleteConfirmationModal && (
                <Modal
                    size={"responsive"}
                    handleCloseModal={() => setDeleteConfirmationModal(false)}
                    showModal={deleteConfirmationModal}
                >
                    <Modal.Body>
                        <div className="py-4 text-center md:text-xl">
                            <p className="w-full">Are You Sure?</p>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-green-500 rounded px-3 py-2"
                                onClick={handleDelete}
                            >
                                Yes
                            </button>
                            <button
                                className="bg-red-500 rounded px-3 py-2"
                                onClick={() =>
                                    setDeleteConfirmationModal(false)
                                }
                            >
                                No
                            </button>
                        </div>
                    </Modal.Footer>
                </Modal>
            )}
        </PageLayout>
    );
};

const EditUserLocationModal = ({
    setModal,
    setFormData: setAllData,
    isModal,
    user_id,
    addToast,
    setUsers,
    users,
}) => {
    const { data: units, loading } = fetch("unit.get");
    const [formData, setFormData] = useState({ selectedRows: [] });
    const [selectedUsers, setSelectedUser] = useState([]);

    useEffect(() => {
        const selectedUsers = users.filter((item) =>
            user_id.includes(String(item.id))
        );

        setSelectedUser(selectedUsers);
    }, [user_id]);

    const handleSelectAll = (currData) => {
        const currentIds = currData.map((item) =>
            item.unit_position_id?.toString()
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
        const stringId = value?.unit_position_id?.toString();
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

    const columns = uColumns("checkbox", formData, units, handleSelectAll);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const resp = await axios.post(route("user.bulk.allocation"), {
                user_id: user_id,
                unit_position_id: [...formData.selectedRows],
            });
            if (resp.status === 200 || resp.status === 302) {
                const selectedUnits = units.filter((item) =>
                    formData.selectedRows.includes(
                        String(item.unit_position_id)
                    )
                );

                const selectedAreas = [
                    ...new Set(selectedUnits.map((u) => u.area)),
                ].join(", ");

                const updatedSelectedUsers = selectedUsers.map((user) => ({
                    ...user,
                    areas: selectedAreas,
                }));

                const updatedUsers = users.map((user) => {
                    const found = updatedSelectedUsers.find(
                        (u) => u.id === user.id
                    );
                    return found ? found : user;
                });
                setAllData({ selectedRows: [] });
                setUsers(updatedUsers);
                setModal(false);
                addToast(resp.data);
            }
        } catch (err) {
            console.error("Error updating user location:", err);
            addToast({ type: "error", text: err?.response.data.message });
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }
    return (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
            <TableComponent
                title={"Allocation"}
                subtitle={selectedUsers.map((u) => u.name).join(", ")}
                height={"55vh"}
                isModal={true}
                handleClose={() => setModal(false)}
                columns={columns}
                data={units}
                isForm={true}
                handleSubmit={handleSubmit}
                submitPlaceholder={"Submit"}
                onRowClick={handleCheckItem}
            />
        </div>
    );
};
export default UserList;
