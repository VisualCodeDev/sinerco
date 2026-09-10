const columns = ({
    formData,
    handleSelectAll,
    handleCheckItem,
    onRowClick,
    isEdit,
    edits,
    roles = [],
    newRowId,
    handleFieldChange,
    handleSaveRow,
    onDeleteUser,
    handleCancelNewRow,
}) => {
    const isDraftRow = (item) => newRowId && item.id === newRowId;
    const editValue = (item, field) =>
        edits?.[item.id]?.[field] ?? item[field] ?? "";

    const colItem = [
        {
            name: "id",
            header: "No",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start",
            sortable: false,
            width: "1%",
            Cell: ({ id, index }) => {
                return (
                    <>
                        <div>{index + 1}</div>
                    </>
                );
            },
        },
        {
            name: "name",
            header: "User",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start text-lg",
            sortable: true,
            width: "17%",
            Cell: (item) => {
                if (isEdit) {
                    return (
                        <input
                            type="text"
                            autoFocus={isDraftRow(item)}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-base"
                            value={editValue(item, "name")}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                handleFieldChange(item.id, "name", e.target.value)
                            }
                        />
                    );
                }
                return <div>{item?.name}</div>;
            },
        },
        {
            name: "email",
            header: "Email",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start text-lg",
            sortable: true,
            width: "17%",
            Cell: (item) => {
                if (isEdit) {
                    return (
                        <input
                            type="email"
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-base"
                            value={editValue(item, "email")}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                handleFieldChange(item.id, "email", e.target.value)
                            }
                        />
                    );
                }
                return <div>{item?.email}</div>;
            },
        },
        {
            name: "areas",
            header: "Field",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start text-lg",
            sortable: true,
            width: "14%",
            Cell: (items) => {
                if (isDraftRow(items)) return null;
                return (
                    <>
                        <div>{items?.areas || "-"}</div>
                    </>
                );
            },
        },
        {
            name: "role",
            header: "Role",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start text-lg",
            sortable: true,
            width: "14%",
            Cell: (item) => {
                if (isEdit) {
                    return (
                        <select
                            className="w-full border border-gray-300 rounded-md px-2 py-1 bg-white text-base"
                            value={editValue(item, "role_id")}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                handleFieldChange(item.id, "role_id", e.target.value)
                            }
                        >
                            <option value="">-- Select --</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    );
                }
                return (
                    <div>
                        {item?.role === "super_admin"
                            ? "ADMIN"
                            : item?.role?.toUpperCase()}
                    </div>
                );
            },
        },
        {
            name: "password",
            header: "Password",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start text-lg",
            sortable: false,
            width: "14%",
            Cell: (item) => {
                // Password cuma diisi pas bikin user baru dari sini -- reset password
                // user yang sudah ada tetap lewat "Reset" (user.bulk.reset), bukan
                // ditumpuk lagi di sini.
                if (!isDraftRow(item)) return isEdit ? "—" : null;
                return (
                    <input
                        type="password"
                        placeholder="Min. 8 characters"
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-base"
                        value={editValue(item, "password")}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                            handleFieldChange(item.id, "password", e.target.value)
                        }
                    />
                );
            },
        },
        {
            name: "action",
            header: "Action",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start text-lg",
            width: "8%",
            Cell: (item) => {
                if (isEdit || isDraftRow(item)) return null;
                return (
                    <>
                        <button
                            className="border border-transparent bg-primary text-white rounded-lg px-3 py-2 text-sm"
                            onClick={() => onRowClick(item)}
                        >
                            Detail
                        </button>
                    </>
                );
            },
        },
        {
            name: "save",
            header: "",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            sortable: false,
            width: "8%",
            Cell: (item) => {
                if (!isEdit || !edits?.[item.id]) return null;
                return (
                    <button
                        type="button"
                        className="bg-white text-primary border border-primary px-3 py-1 rounded-md text-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSaveRow(item.id);
                        }}
                    >
                        Save
                    </button>
                );
            },
        },
        {
            name: "delete",
            header: "",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            sortable: false,
            width: "8%",
            Cell: (item) => {
                if (!isEdit) return null;
                if (isDraftRow(item)) {
                    return (
                        <button
                            type="button"
                            className="border border-gray-300 bg-white text-gray-600 px-3 py-1.5 rounded-md text-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCancelNewRow();
                            }}
                        >
                            Cancel
                        </button>
                    );
                }
                return (
                    <button
                        type="button"
                        className="bg-danger text-white border border-danger px-3 py-1 rounded-md text-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteUser(item);
                        }}
                    >
                        Delete
                    </button>
                );
            },
        },
        {
            name: "checkbox",
            width: "8%",
            Header: (data) => {
                return (
                    <div
                        className="text-center w-full"
                        onClick={() => handleSelectAll(data)}
                        checked={
                            formData?.selectedRows?.length === data?.length
                        }
                    >
                        Select All
                    </div>
                );
            },
            headerClassName: "bg-primary text-white text-center justify-center",
            sortable: false,
            cellClassName: "text-center",
            Cell: ({ id }) => {
                return (
                    <input
                        type="checkbox"
                        checked={formData?.selectedRows?.includes(
                            id?.toString()
                        )}
                    />
                );
            },
        },
    ];

    // "save"/"delete"/"password" cuma relevan pas edit mode aktif, dan
    // "checkbox" (bulk-select) cuma relevan pas tidak -- kalau kolom yang tidak
    // relevan tetap di-include (Cell-nya return null), border kosongnya tetap
    // kelihatan aneh di tabel (lihat fix yang sama di List of Unit).
    return isEdit
        ? colItem.filter((col) => col.name !== "checkbox")
        : colItem.filter(
              (col) =>
                  col.name !== "save" &&
                  col.name !== "delete" &&
                  col.name !== "password",
          );
};
export default columns;
