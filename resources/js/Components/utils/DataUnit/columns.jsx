import { DateInput, TimeInput } from "../dashboard-util";

const columns = () => {
    const colItem = [
        {
            name: "id",
            header: "No.",
            headerClassName: "text-center",
            cellClassName: "text-center",
            sortable: true,
            width: "3%",
            Cell: ({ index, id }) => {
                return (
                    <>
                        <div>{id}</div>
                    </>
                );
            },
        },
        {
            name: "user",
            header: "User",
            sortable: true,
            width: "17%",
            Cell: ({ user }) => {
                return <div className="flex flex-col">{user?.user}</div>;
            },
        },
        {
            name: "area",
            header: "Area",
            sortable: true,
            width: "20%",
            Cell: ({ area }) => {
                return <div className="flex flex-col">{area}</div>;
            },
        },
        {
            name: "unit",
            header: "Unit",
            sortable: true,
            width: "20%",
            Cell: ({ unit }) => {
                return <div className="flex flex-col">{unit?.unit}</div>;
            },
        },
        {
            name: "location",
            header: "Location",
            sortable: true,
            width: "20%",
            Cell: ({ location }) => {
                return <div className="flex flex-col">{location}</div>;
            },
        },
        {
            name: "dailyForm",
            header: "",
            sortable: false,
            headerClassName: "text-center justify-center",
            cellClassName: "text-center",
            width: "20%",
            Cell: ({ area, location, unit }) => {
                const url =
                    "/" +
                    area +
                    "/" +
                    location +
                    "/" +
                    unit?.unit;
                return (
                    <a
                        href={route("daily") + url}
                        className="bg-primary text-white px-3 py-2 rounded-md text-sm"
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
