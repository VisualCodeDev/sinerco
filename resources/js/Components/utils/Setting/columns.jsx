import { FaEllipsisV } from "react-icons/fa";
import { toCapitalizeFirstLetter } from "../dashboard-util";

const columns = (type) => {
    const colItem = [
        {
            name: "id",
            header: "ID",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-start",
            sortable: true,
            width: "30%",
            Cell: (items) => {
                return (
                    <>
                        <div>{items?.id}</div>
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
            width: "40%",
            Cell: (items) => {
                return (
                    <>
                        <div>{items?.name}</div>
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
            width: "30%",
            Cell: (items) => {
                return (
                    <>
                        <div>{toCapitalizeFirstLetter(items?.role)}</div>
                    </>
                );
            },
        },
        // {
        //     name: "profile",
        //     header: "Profile",
        //     headerClassName: "text-center bg-primary text-white",
        //     cellClassName: "text-center text-lg",
        //     sortable: false,
        //     width: "5%",
        //     Cell: (items) => {
        //         return (
        //             <>
        //                 <button>
        //                     <FaEllipsisV />
        //                 </button>
        //             </>
        //         );
        //     },
        // },
    ];
    switch (type) {
        case "technician":
            return colItem;
        case "operator":
            return colItem;
    }
};
export default columns;
