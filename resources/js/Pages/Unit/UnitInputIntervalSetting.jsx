import React, { useEffect, useState } from "react";
import { fetch } from "@/Components/utils/database-util";
import PageLayout from "@/Layouts/PageLayout";
import MultiSelectDropdown from "@/Components/MultiSelectDropdown";
import LoadingSpinner from "@/Components/Loading";
import axios from "axios";
import { useToast } from "@/Components/Toast/ToastProvider";

const UnitInputIntervalSetting = () => {
    const { data } = fetch("unit.get");
    const [mode, setMode] = useState("single");
    const [loading, setLoading] = useState(false);
    const [inputInterval, setInputInterval] = useState(1);
    const [unitData, setUnitData] = useState([]);
    const [selected, setSelected] = useState([]);
    const { addToast } = useToast();

    useEffect(() => {
        if (!data) return;

        const allUnit = [];

        data.forEach((item) => {
            if (item.unit) {
                const formattedItem = {
                    label: item?.unit?.unit,
                    value: item?.unit?.unitId,
                };
                allUnit.push(formattedItem);
            }
        });

        setUnitData(allUnit);
    }, [data]);

    useEffect(() => {
        if (!selected || selected?.length === 0) return;
        if (mode === "single") {
            setSelected([selected[0]]);
        }
    }, [mode]);

    useEffect(() => {
        if (mode != "single") return;
        const selectedUnit = data?.find(
            (item) => item?.unitId === selected[0]
        )?.unit;

        setInputInterval(selectedUnit?.input_interval);
    }, [selected]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const resp = await axios.post(route("unit.interval.set"), {
                selected,
                input_interval: inputInterval,
            });
            if (
                resp.status === 200 ||
                resp.status === 201 ||
                resp?.data?.type === "success"
            ) {
                addToast(resp?.data);
            }
        } catch (e) {
            console.error(e);
            addToast({ type: "error", text: e?.response?.data?.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Section Title */}
            <h2 className="text-xl font-semibold text-gray-800">
                Unit Settings
            </h2>

            {/* Selection Mode */}
            <div className="flex flex-col gap-1">
                <label className="text-base text-gray-600 font-medium">
                    Selection Mode
                </label>
                <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-base hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                    <option value="single">Single</option>
                    <option value="multiple">Multiple</option>
                </select>
            </div>

            {/* Unit Selection */}
            <div className="flex flex-col gap-1">
                <label className="text-base text-gray-600 font-medium">
                    Select Unit
                </label>
                {mode === "multiple" ? (
                    <MultiSelectDropdown
                        options={unitData}
                        selected={selected}
                        setSelected={setSelected}
                    />
                ) : (
                    <select
                        value={selected[0] || ""}
                        onChange={(e) => setSelected([e.target.value])}
                        className="border border-gray-300 rounded-md px-3 py-2 text-base hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        <option value={""}>Select a unit</option>
                        {unitData.map((unit, index) => (
                            <option key={index} value={unit.value}>
                                {unit.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Numeric Input */}
            <div className="flex flex-col gap-1">
                <label className="text-base text-gray-600 font-medium">
                    Input Interval (Hour(s))
                </label>
                <select
                    value={inputInterval}
                    onChange={(e) => setInputInterval(Number(e.target.value))}
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 text-base text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                    <option value="">Select value</option>
                    {Array.from({ length: 24 }, (_, i) => i + 1).map((val) => (
                        <option key={val} value={val}>
                            {val}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex items-center justify-center">
                <button
                    onClick={handleSave}
                    className="bg-primary text-white px-6 py-2 rounded-xl mt-10 text-xl"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default UnitInputIntervalSetting;
