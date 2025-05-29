import React, { useEffect, useState } from "react";
import tColumns from "../utils/DataUnit/columns";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import TableComponent from "../TableComponent";

const UnitTable = () => {
    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const response = await axios.get(route("getUnitAreaLocation"));
        console.log(response.data);
        setLoading(false);
        setData(response.data);
    };
    useEffect(() => {
        fetchData();
    }, []);

    let columns = tColumns();
    if (isLoading) {
        return (
            <div>
                <p>Loading...</p>
            </div>
        );
    }
    return (
        <div className="rounded-xl">
            {/* <div className="bg-primary px-4 py-4">
                <input type="text" className="border-none h-0" />
            </div> */}
                <TableComponent columns={columns} data={data} />
        </div>
    );
};

export default UnitTable;
