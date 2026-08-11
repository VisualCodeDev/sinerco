import { useToast } from "@/Components/Toast/ToastProvider";
import React, { useEffect, useState } from "react";
import tColumns from "../../Components/utils/UnitLocationSettings/columns";
import TableComponent from "@/Components/TableComponent";
import PageLayout from "@/Layouts/PageLayout";
import LoadingSpinner from "@/Components/Loading";

const UnitAreaLocationSetting = ({ data }) => {
    const [unitData, setUnitData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(data || {});
    const [selectedItemUnits, setSelectedItemUnits] = useState([]);
    const [filteredUnitData, setFilteredUnitData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        add: [],
        remove: [],
    });
    const { addToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const unitResponse = await axios.get(route("unit.get"));
                setUnitData(unitResponse.data);

                setSelectedItemUnits(data?.units);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (unitData.length === 0) return;
        const filtered = unitData.filter(
            (unit) =>
                !selectedItemUnits?.some(
                    (wUnit) => wUnit?.unit_id === unit?.unit_id
                )
        );
        setFilteredUnitData([...filtered]);
    }, [selectedItemUnits, unitData]);

    const handleSelectAll = (currData) => {
        const currentIds = currData.map((item) => item.unit_id.toString());
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
            updated = selected.filter((unit_id) => unit_id !== stringId);
        } else {
            updated = [...selected, stringId];
        }
        setFormData({
            ...formData,
            add: updated,
        });
    };

    const handleSelectAllRemove = (currData) => {
        const currentIds = currData.map((item) => item.unit_id.toString());
        const selected = formData.remove || [];
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
        setFormData({ ...formData, remove: updated });
    };

    const handleCheckRemoveItem = (item) => {
        const selected = formData?.remove || [];
        const stringId = item?.unit_id;
        let updated;
        if (selected.includes(stringId)) {
            updated = selected.filter((unit_id) => unit_id !== stringId);
        } else {
            updated = [...selected, stringId];
        }
        setFormData({
            ...formData,
            remove: updated,
        });
    };

    const handleAdd = async () => {
        if (Array.isArray(formData.add) && formData?.add?.length === 0) return;

        const finalFilteredUnit = unitData.filter((unit) =>
            formData?.add?.some((wUnit) => wUnit === unit?.unit_id)
        );

        const finalLocationUnit = [...selectedItemUnits, ...finalFilteredUnit];
        setSelectedItemUnits(finalLocationUnit);

        try {
            const resp = await axios.post(
                route("unit.area_location.add", {
                    location_id: selectedItem?.id,
                    unit_ids: [...formData?.add],
                })
            );

            addToast(resp?.data);
        } catch (e) {
            console.error(e);
        }
        setFormData({ ...formData, add: [] });
    };

    const handleRemove = async () => {
        if (
            Array.isArray(formData.remove) &&
            formData?.remove?.length === 0
        )
            return;

        const remainingUnits = selectedItemUnits.filter(
            (unit) => !formData?.remove?.includes(unit?.unit_id)
        );
        setSelectedItemUnits(remainingUnits);

        try {
            const resp = await axios.post(
                route("unit.area_location.remove", {
                    unit_ids: [...formData?.remove],
                })
            );

            addToast(resp?.data);
        } catch (e) {
            console.error(e);
        }
        setFormData({ ...formData, remove: [] });
    };

    const unitColumns = tColumns({
        type: "unit",
        formData,
        unitAreaData: filteredUnitData,
        handleSelectAll,
    });

    const locationColumns = tColumns({
        type: "workshopUnit",
        formData,
        unitAreaData: selectedItemUnits,
        handleSelectAll: handleSelectAllRemove,
    });

    return (
        <PageLayout>
            {loading && <LoadingSpinner />}
            <div className="flex gap-4 relative w-full">
                <div className="w-1/2 relative">
                    <TableComponent
                        data={selectedItemUnits || []}
                        columns={locationColumns}
                        height="55vh"
                        title={selectedItem?.location}
                        subtitle={selectedItem?.area?.area}
                        onRowClick={handleCheckRemoveItem}
                        isForm
                        submitPlaceholder="Remove"
                        handleSubmit={handleRemove}
                    />
                </div>
                <div className="w-1/2 relative">
                    {filteredUnitData && filteredUnitData?.length > 0 && (
                        <TableComponent
                            data={filteredUnitData || []}
                            columns={unitColumns}
                            height="55vh"
                            title={"Unit"}
                            onRowClick={handleCheckItem}
                            isForm
                            submitPlaceholder="Add"
                            handleSubmit={handleAdd}
                        />
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default UnitAreaLocationSetting;
