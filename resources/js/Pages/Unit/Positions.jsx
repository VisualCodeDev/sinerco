import TableComponent from "@/Components/TableComponent";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useMemo, useState } from "react";
import tColumns from "../../Components/utils/UnitLocationSettings/columns";
import { fetch } from "@/Components/utils/database-util";
import LoadingSpinner from "@/Components/Loading";
import { useToast } from "@/Components/Toast/ToastProvider";
import { router } from "@inertiajs/react";

const UnitLocationSetting = () => {
    // const { data, loading } = fetch("unit.get");
    const [workshopData, setWorkshop] = useState([]);
    const [clientData, setClientData] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [workshopResponse, clientResponse] = await Promise.all([
                    axios.get(route("workshop.get")),
                    axios.get(route("client.get")),
                ]);

                setWorkshop(workshopResponse.data);
                setClientData(clientResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const columns = useMemo(() => tColumns({}), []);

    const handleSelectItem = (item) => {
        router.get(route("unit.position.setting"), {
            workshop_id: item.workshop_id || null,
            client_id: item.client_id || null,
        });
    };
    return (
        <PageLayout>
            {loading && <LoadingSpinner />}
            <div className="flex relative w-full max-h-[80vh] bg-gray-100">
                {/* WORKSHOP */}
                {/* {selectedItemUnits.length > 0 &&
                    selectedItemUnits.map((item) => (
                        <div>
                            <div
                                className=""
                                onClick={() => handleSelectItem(item)}
                            >
                                {item?.name}
                            </div>
                        </div>
                    ))} */}
                <div className="flex w-full gap-4">
                    <div className="w-1/2">
                        <TableComponent
                            data={clientData || []}
                            height="55vh"
                            columns={columns}
                            onRowClick={handleSelectItem}
                            title={"Clients"}
                        />
                    </div>
                    <div className="w-1/2">
                        <TableComponent
                            data={workshopData || []}
                            height="55vh"
                            columns={columns}
                            onRowClick={handleSelectItem}
                            title={"Workshops"}
                        />
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default UnitLocationSetting;
