import { DateInput, TimeInput } from "../dashboard-util";

const columns = () => {
    const colItem = [
        {
            name: "id",
            header: "NO.",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-center",
            sortable: false,
            width: "3%",
            Cell: ({ index }) => {
                return (
                    <>
                        <div>{index + 1}</div>
                    </>
                );
            },
        },
        {
            name: "user",
            header: "User",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "17%",
            Cell: ({ user }) => {
                return <div className="flex flex-col">{user?.user}</div>;
            },
        },
        {
            name: "area",
            header: "Area",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "20%",
            Cell: ({ area }) => {
                return <div className="flex flex-col">{area}</div>;
            },
        },
        {
            name: "unit",
            header: "Unit",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "20%",
            Cell: ({ unit }) => {
                return <div className="flex flex-col">{unit?.unit}</div>;
            },
        },
        {
            name: "location",
            header: "Location",
            headerClassName: "bg-primary text-white",
            sortable: true,
            width: "20%",
            Cell: ({ location }) => {
                return <div className="flex flex-col">{location}</div>;
            },
        },
        {
            name: "dailyForm",
            headerClassName: "bg-primary text-white text-center justify-center",
            sortable: false,
            cellClassName: "text-center",
            width: "20%",
            Cell: ({ unitAreaLocationId }) => {
                return (
                    <a
                        href={route("daily", {
                            unitAreaLocationId,
                        })}
                        className="bg-white border-2 border-primary/50 hover:border-none text-primary px-3 py-2 rounded-full text-sm hover:bg-primary/10"
                    >
                        Daily Form
                    </a>
                );
            },
        },
    ];

    return colItem;
};
export default columns;
