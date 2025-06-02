const columns = () => {
    const colItem = [
        {
            name: "id",
            header: "ID",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start",
            sortable: true,
            width: "45%",
            Cell: (items) => {
                return (
                    <>
                        <div>{items?.userDataUnitId}</div>
                    </>
                );
            },
        },
        {
            name: "user",
            header: "User",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start text-lg",
            sortable: true,
            width: "50%",
            Cell: (items) => {
                return (
                    <>
                        <div>{items?.user}</div>
                    </>
                );
            },
        },
        // {
        //     name: "actions",
        //     header: "",
        //     headerClassName: "text-center bg-primary text-white",
        //     cellClassName: "text-start text-lg",
        //     sortable: false,
        //     width: "5%",
        //     Cell: (items) => {
        //         return (
        //             <>
        //                 <button>
        //                     <FaEllipsisH />
        //                 </button>
        //             </>
        //         );
        //     },
        // },
    ];

    return colItem;
};
export default columns;
