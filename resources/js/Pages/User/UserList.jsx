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

// Sentinel id buat baris draft "Add User" -- sama pola dengan NEW_UNIT_ID di
// UnitTable/List of Unit: baris kosong disisipkan langsung di tabel, diisi
// user, lalu di-Save -- bukan navigasi ke halaman terpisah.
const NEW_USER_ID = "__new_user__";

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

    // Inline row-edit mode (Name/Email/Role jadi input/select langsung di
    // tabel + tombol Save per baris) -- pola yang sama dengan UnitTable/List
    // of Unit, terpisah dari mode bulk-select (checkbox) yang sudah ada.
    const [edit, setEdit] = useState(false);
    const [edits, setEdits] = useState({});
    const [newUserId, setNewUserId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

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

    const handleFieldChange = (id, field, value) => {
        setEdits((prev) => ({
            ...prev,
            [id]: { ...(prev[id] || {}), [field]: value },
        }));
    };

    const handleAddRow = () => {
        if (users.some((u) => u.id === NEW_USER_ID)) return;
        setEdit(true);
        setNewUserId(NEW_USER_ID);
        setUsers((prev) => [
            {
                id: NEW_USER_ID,
                name: "",
                email: "",
                role: "",
                role_id: "",
                areas: "",
            },
            ...(prev || []),
        ]);
    };

    const handleCancelNewRow = () => {
        setUsers((prev) => prev.filter((u) => u.id !== NEW_USER_ID));
        setEdits((prev) => {
            const next = { ...prev };
            delete next[NEW_USER_ID];
            return next;
        });
        setNewUserId(null);
    };

    const handleToggleEdit = () => {
        setEdit((prev) => {
            if (prev) handleCancelNewRow();
            return !prev;
        });
        setEdits({});
    };

    const handleSaveRow = async (id) => {
        const rowEdits = edits[id];
        if (!rowEdits) return;

        if (id === NEW_USER_ID) {
            if (!rowEdits.name?.trim() || !rowEdits.email?.trim() || !rowEdits.role_id || !rowEdits.password) {
                return addToast({
                    type: "error",
                    text: "Name, email, role, and password are required.",
                });
            }
            try {
                const resp = await axios.post(route("user.add"), {
                    name: rowEdits.name.trim(),
                    email: rowEdits.email.trim(),
                    password: rowEdits.password,
                    role_id: rowEdits.role_id,
                });
                addToast(resp?.data);
                const roleName = roles.find(
                    (r) => String(r.id) === String(rowEdits.role_id),
                )?.name;
                const createdId = resp?.data?.data?.id;
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === NEW_USER_ID
                            ? {
                                  ...u,
                                  id: createdId ?? u.id,
                                  name: rowEdits.name.trim(),
                                  email: rowEdits.email.trim(),
                                  role: roleName,
                                  role_id: rowEdits.role_id,
                              }
                            : u,
                    ),
                );
                setNewUserId(null);
                setEdits((prev) => {
                    const next = { ...prev };
                    delete next[NEW_USER_ID];
                    return next;
                });
            } catch (err) {
                console.error(err);
                addToast({
                    type: "error",
                    text:
                        err?.response?.data?.errors?.email?.[0] ||
                        err?.response?.data?.message ||
                        "Failed to add user.",
                });
            }
            return;
        }

        try {
            const resp = await axios.post(route("user.edit", id), {
                name: rowEdits.name,
                email: rowEdits.email,
                role: rowEdits.role_id,
            });
            addToast(resp?.data);
            const roleName = roles.find(
                (r) => String(r.id) === String(rowEdits.role_id ?? users.find((u) => u.id === id)?.role_id),
            )?.name;
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === id
                        ? {
                              ...u,
                              ...rowEdits,
                              role: roleName ?? u.role,
                          }
                        : u,
                ),
            );
            setEdits((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        } catch (err) {
            console.error(err);
            addToast({
                type: "error",
                text:
                    err?.response?.data?.errors?.email?.[0] ||
                    err?.response?.data?.message ||
                    "Failed to update user.",
            });
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const resp = await axios.post(route("user.bulkDelete"), {
                users: [deleteTarget.id],
            });
            addToast(resp?.data);
            setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
            addToast({
                type: "error",
                text: err?.response?.data?.message || "Failed to delete user.",
            });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const columns = tColumns({
        formData,
        handleSelectAll,
        handleCheckItem,
        onRowClick,
        isEdit: edit,
        edits,
        roles,
        newRowId: newUserId,
        handleFieldChange,
        handleSaveRow,
        onDeleteUser: (item) => setDeleteTarget(item),
        handleCancelNewRow,
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
            console.error(e);
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
            console.error(e);
            addToast({ type: "error", text: e.response.data.message });
        }
    };

    return (
        <PageLayout>
            <TableComponent
                handleNew={handleAddRow}
                addNewItem={true}
                newItemPlaceholder={"Add User"}
                height={"55vh"}
                roles={roles}
                isUserList={true}
                isResponsive={true}
                handleSubmit={handleSubmit}
                columns={columns}
                data={users}
                filterUserRole={true}
                onRowClick={edit ? undefined : handleCheckItem}
                // NOTE: TableComponent's `edit` prop is a DIFFERENT, older toggle --
                // for isUserList it gates the bulk-select footer (Edit
                // Location/Delete/Reset), unrelated to our new per-row inline edit
                // (`edit` state above). Invert it so that footer (which needs the
                // checkbox column, hidden below) hides while inline edit is on,
                // and keeps behaving exactly as before otherwise.
                edit={!edit}
                secondaryAction={{
                    label: "Edit Users",
                    activeLabel: "Done",
                    active: edit,
                    onClick: handleToggleEdit,
                }}
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
                                className="border border-transparent bg-green-500 rounded px-3 py-2"
                                onClick={handleDelete}
                            >
                                Yes
                            </button>
                            <button
                                className="border border-transparent bg-red-500 rounded px-3 py-2"
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

            {/* Delete confirmation for a single row's Delete button (inline edit mode) */}
            <Modal
                showModal={!!deleteTarget}
                handleCloseModal={() => setDeleteTarget(null)}
                title="Delete User"
                size="sm"
            >
                <Modal.Body>
                    <p>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{deleteTarget?.name}</span>?
                        This action cannot be undone.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="border border-transparent bg-danger text-white px-4 py-2 rounded-md disabled:opacity-40"
                            disabled={deleting}
                            onClick={handleDeleteUser}
                        >
                            Delete
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="w-full max-w-5xl">
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
        </div>
    );
};
export default UserList;
