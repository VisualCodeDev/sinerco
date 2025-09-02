const columns = ({ formData, handleSelectAll, handleCheckItem }) => {
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
            width: "19.8%",
            Cell: (items) => {
                return (
                    <>
                        <div>{items?.name}</div>
                    </>
                );
            },
        },
        {
            name: "email",
            header: "E-mail",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start text-lg",
            sortable: true,
            width: "19.8%",
            Cell: (items) => {
                return (
                    <>
                        <div>{items?.email}</div>
                    </>
                );
            },
        },
        {
            name: "field",
            header: "field",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start text-lg",
            sortable: true,
            width: "19.8%",
            Cell: (items) => {
                return (
                    <>
                        <div>{items?.email}</div>
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
            width: "19.8%",
            Cell: (items) => {
                return (
                    <>
                        <div>
                            {items?.role === "super_admin"
                                ? "ADMIN"
                                : items?.role.toUpperCase()}
                        </div>
                    </>
                );
            },
        },
        {
            name: "action",
            header: "Action",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start text-lg",
            width: "19.8%",
            Cell: (items) => {
                return (
                    <>
                        <button>Reset</button>
                    </>
                );
            },
        },
        {
            name: "checkbox",
            width: "19.8%",
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
            width: "20%",
            Cell: ({ id }) => {
                return (
                    <input
                        type="checkbox"
                        checked={formData?.selectedRows?.includes(
                            id?.toString()
                        )}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleCheckItem(id?.toString());
                        }}
                    />
                );
            },
        },
    ];

    return colItem;
};
export default columns;
