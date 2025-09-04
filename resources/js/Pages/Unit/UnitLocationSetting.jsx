import TableComponent from "@/Components/TableComponent";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useMemo, useState } from "react";
import tColumns from "../../Components/utils/UnitLocationSettings/columns";
import { fetch } from "@/Components/utils/database-util";
import LoadingSpinner from "@/Components/Loading";
import { useToast } from "@/Components/Toast/ToastProvider";

const UnitLocationSetting = () => {
    // const { data, loading } = fetch("unit.get");
    const [unitData, setUnitData] = useState([]);
    const [workshopData, setWorkshopData] = useState([]);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [selectedWorkshopUnits, setSelectedWorkshopUnits] = useState([]);
    const [filteredUnitData, setFilteredUnitData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        add: [],
        delete: [],
    });

    const { addToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [unitResponse, workshopResponse] = await Promise.all([
                    axios.get(route("unit.get")),
                    axios.get(route("workshop.get")),
                ]);

                setUnitData(unitResponse.data);
                setWorkshopData(workshopResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSelectWorkshop = (item) => {
        setSelectedWorkshop(item);

        const filtered = unitData.filter(
            (unit) => !item?.units?.some((wUnit) => wUnit?.id === unit?.unit_id
        )
        );

        setFilteredUnitData(filtered);
        setSelectedWorkshopUnits(item?.units);
    };

    const handleSelectAll = (currData) => {
        const currentIds = currData.map((item) => item.unit_id
        .toString());
        const selected = formData.add || [];
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
        setFormData({ add: updated });
    };

    const handleCheckItem = (item) => {
        const selected = formData?.add || [];
        const stringId = item?.unit_id;
        let updated;
        if (selected.includes(stringId)) {
            updated = selected.filter((unit_id

            ) => unit_id
             !== stringId);
        } else {
            updated = [...selected, stringId];
        }
        setFormData({
            ...formData,
            add: updated,
        });
    };
    const handleAdd = async () => {
        if (Array.isArray(formData.add) && formData?.add?.length === 0) return;

        const finalFilteredUnit = unitData.filter(
            (unit) => !formData?.add?.some((wUnit) => wUnit === unit?.unit_id
        )
        );

        const selectedWorkshopUnit = unitData.filter((unit) =>
            formData?.add?.some((wUnit) => wUnit === unit?.unit_id
    )
        );

        const finalWorkshopUnit = [...selectedWorkshopUnits, ...formData?.add];

        try {
            const resp = await axios.post(
                route("unit.location.add", {
                    workshop_id: selectedWorkshop?.workshop_id,
                    unit_ids: [...formData?.add],
                })
            );
            addToast(resp?.data);
        } catch (e) {
            console.error(e);
        }

        setFilteredUnitData([...finalFilteredUnit]);
        setSelectedWorkshopUnits(finalWorkshopUnit);
    };

    const unitColumns = useMemo(() => {
        return tColumns({
            type: "unit",
            formData,
            unitAreaData: filteredUnitData,
            handleSelectAll,
        });
    }, [formData, filteredUnitData]);

    const workshopColumns = useMemo(() => {
        return tColumns({
            type: "workshopUnit",
            formData,
            unitAreaData: filteredUnitData,
            handleSelectAll,
        });
    }, [formData, filteredUnitData]);

    return (
        <PageLayout>
            {loading && <LoadingSpinner />}
            <div className="flex relative w-full max-h-[80vh] bg-gray-100">
                {/* WORKSHOP */}
                {selectedWorkshopUnits.length > 0 &&
                    selectedWorkshopUnits.map((item) => (
                        <div>
                            <div
                                className=""
                                onClick={() => handleSelectWorkshop(item)}
                            >
                                {item?.name}
                            </div>
                        </div>
                    ))}
                <div className="w-1/2">
                    {!selectedWorkshop && workshopData.length > 0 ? (
                        workshopData.map((item) => (
                            <div>
                                <div
                                    className=""
                                    onClick={() => handleSelectWorkshop(item)}
                                >
                                    {item?.name}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>
                            <TableComponent
                                data={selectedWorkshopUnits || []}
                                columns={workshopColumns}
                                title={selectedWorkshop?.name}
                                onRowClick={handleCheckItem}
                                submitPlaceholder="Remove"
                            />
                        </div>
                    )}
                </div>

                {/* UNIT */}
                {selectedWorkshop && (
                    <TableComponent
                        data={filteredUnitData || []}
                        columns={unitColumns}
                        title={"Unit"}
                        onRowClick={handleCheckItem}
                        isForm={true}
                        submitPlaceholder="Add"
                        handleSubmit={handleAdd}
                    />
                )}
            </div>
        </PageLayout>
    );
};

export default UnitLocationSetting;
