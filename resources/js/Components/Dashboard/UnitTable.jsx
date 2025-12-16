import React, { useEffect, useState } from "react";
import tColumns from "../utils/DataUnit/columns";
import {
    FaSort,
    FaSortDown,
    FaSortUp,
    FaPlus,
    FaSearch,
    FaRegBuilding,
} from "react-icons/fa";
import { Button } from "@headlessui/react";
import TableComponent from "../TableComponent";
import { router } from "@inertiajs/react";
import LoadingSpinner from "../Loading";
import { fetch } from "../utils/database-util";
import { useAuth } from "../Auth/auth";
import Modal from "../Modal";
import InputValidationSetting from "@/Pages/Unit/InputValidationSetting";
import { formItems } from "../utils/dashboard-util";
import { getFields } from "../db";
import { MdClose } from "react-icons/md";
import axios from "axios";
import { useToast } from "../Toast/ToastProvider";

const UnitTable = (props) => {
    const { data: propsData } = props;
    const data = propsData;
    const [formData, setFormData] = useState({ selectedRows: [], data: data });
    const [thresholdSetting, setThresholdSetting] = useState(null);
    const { user } = useAuth();
    const [isSettingModal, setIsSettingModal] = useState(false);
    const [edit, setEdit] = useState(false);

    const { addToast } = useToast();

    const handleClick = (item, e) => {
        if (!item.unit_position_id || edit) return;
        console.log(e);
        const url = route("daily", item.unit_position_id);

        if (e && (e.button === 1 || e.ctrlKey || e.metaKey)) {
            window.open(url, "_blank");
        } else {
            router.visit(url);
        }
    };

    const handleSelectAll = () => {
        if (formData.selectedRows.length === data.length) {
            // Unselect all
            setFormData((prev) => ({
                ...prev,
                selectedRows: [],
                selectedUnits: [],
            }));
        } else {
            // Select all
            setFormData((prev) => ({
                ...prev,
                selectedRows: data.map((item) => item.unit_id),
                selectedUnits: data.map((item) => item.unit),
            }));
        }
    };

    const handleSubmit = () => {
        if (formData.selectedRows.length === 0) return;
        setIsSettingModal(true);
    };

    const columns = tColumns("unitList", formData, null, handleSelectAll, edit);

    const onSelect = (selected) => {
        const currSelected = formData?.selectedRows || [];
        const currSelectedUnits = formData?.selectedUnits || [];
        const isSelected = currSelected.includes(String(selected.unit_id));
        if (isSelected) {
            // Deselect
            setFormData((prev) => ({
                ...prev,
                selectedRows: currSelected.filter(
                    (item) => item !== String(selected.unit_id)
                ),
                selectedUnits: currSelectedUnits.filter(
                    (item) => item !== String(selected.unit)
                ),
            }));
            setThresholdSetting({});
            return;
        }
        // Select
        setFormData((prev) => ({
            ...prev,
            selectedRows: [...currSelected, String(selected.unit_id)],
            selectedUnits: [...(formData.selectedUnits || []), selected.unit],
        }));
        console.log(selected);
        setThresholdSetting(selected.thresholdSetting || null);
    };

    if (!propsData) {
        const { data, loading, error } = fetch("unit.get");
        if (loading) {
            return <LoadingSpinner />;
        }
        if (error) return <div>Error: {error.message}</div>;
        return (
            <TableComponent
                handleSubmit={handleSubmit}
                isUnitList={true}
                filterStatus={true}
                data={data}
                columns={columns}
                title={"List of Unit"}
                // onRowClick={handleClick}
                onRowClick={edit ? onSelect : handleClick}
                addNewItem={true}
                toggleEdit={() => setEdit((prev) => !prev)}
                edit={edit}
            />
        );
    }
    return (
        <>
            <TableComponent
                handleSubmit={handleSubmit}
                height={"55vh"}
                isUnitList={true}
                filterStatus={true}
                data={data}
                columns={columns}
                title={"List of Unit"}
                // onRowClick={handleClick}
                onRowClick={edit ? onSelect : handleClick}
                addNewItem={user && user.role === "super_admin" ? true : false}
                toggleEdit={() => setEdit((prev) => !prev)}
                edit={edit}
                handleNew={route("unit.add")}
            />
            <SettingModal
                addToast={addToast}
                isModal={isSettingModal}
                setIsModal={setIsSettingModal}
                unitName={formData?.selectedUnits}
                thresholdSetting={thresholdSetting}
                selectedUnits={formData?.selectedRows}
            />
        </>
        // <></>
    );
};

const SettingModal = ({
    isModal,
    setIsModal,
    thresholdSetting,
    unitName,
    selectedUnits,
    addToast,
}) => {
    const [formData, setFormData] = useState({
        thresholdSetting: {},
    });
    const [fields, setFields] = useState([]);

    useEffect(() => {
        const fetchFields = async () => {
            const data = await getFields();
            setFields(data);
        };
        fetchFields();

        let defaultThresholdSetting = {};

        formItems
            .filter((item) => item.name !== "time")
            .forEach((item) => {
                if (item?.subheader && item.subheader.length > 0) {
                    item.subheader.forEach((sub) => {
                        defaultThresholdSetting[sub.name] = {
                            value: 0,
                            type: "number",
                        };
                    });
                    return;
                }
                defaultThresholdSetting[item.name] = {
                    value: 0,
                    type: "number",
                };
            });
        setFormData((prev) => ({
            ...prev,
            thresholdSetting: thresholdSetting ?? defaultThresholdSetting,
        }));
    }, [thresholdSetting]);

    const handleChange = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: {
                    ...prev[section][field],
                    ...value,
                },
            },
        }));
    };

    const handleSave = async () => {
        try {
            const resp = await axios.post(route("unit.setSettings"), {
                unit_id: selectedUnits,
                ...formData,
            });
            if (resp.status === 200 || resp.status === 302) {
                addToast(resp.data);
            } else {
            }
        } catch (err) {
            console.error("Error creating report:", err);
            addToast({
                type: "error",
                text: err?.response?.data?.message || "Failed to save data!",
            });
        } finally {
            // setSaving(false);
        }
    };

    return (
        <div
            className={`${
                isModal ? "block" : "hidden"
            } absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-white rounded-xl z-10`}
        >
            <div className="bg-primary text-white sticky top-0 left-0 text-center py-4 w-full z-[100] font-bold rounded-t-xl">
                <span>Unit Setting</span>
                <div
                    className="font-light absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setIsModal(false)}
                >
                    <MdClose />
                </div>
            </div>
            <div className=" bg-white h-[70vh] scale-[.85] flex justify-center flex-col items-center gap-4 p-6">
                <span className="font-bold">
                    {unitName.length > 5
                        ? unitName.slice(0, 5).join(", ") + ", ..."
                        : unitName.join(", ")}
                </span>
                <div className="overflow-y-auto overflow-x-auto w-full bg-white rounded-xl z-50">
                    <table className="w-full h-full table-auto border-collapse">
                        <thead className="bg-[#243F96] text-white z-10 shadow-sm w-full sticky top-0">
                            <tr className="sticky top-0">
                                <th className="font-semibold text-nowrap text-left px-6 py-4 w-[25%]">
                                    Item
                                </th>
                                <th className="font-semibold text-nowrap text-left px-6 py-4 w-[20%]">
                                    Input Threshold
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields
                                .filter(
                                    (item) =>
                                        item.name !== "time" &&
                                        item.name !== "remarks"
                                )
                                .flatMap((item) => {
                                    const fields =
                                        item.subfields.length > 0
                                            ? item?.subfields
                                            : [item];
                                    return fields.map((field, idx) => {
                                        return (
                                            <tr
                                                key={field.name + idx}
                                                className="border-b border-[#E4E7EC] bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors"
                                            >
                                                {/* ITEM NAME */}
                                                <td className="py-6 px-6 font-medium text-[#101828] whitespace-nowrap">
                                                    {field.name}
                                                </td>

                                                {/* INPUT THRESHOLD */}
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            placeholder="Threshold"
                                                            className="w-[120px] h-[40px] border border-[#D0D5DD] rounded-lg px-3 text-[#344054] bg-white shadow-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "thresholdSetting",
                                                                    field.slug,
                                                                    {
                                                                        value: e
                                                                            .target
                                                                            .value,
                                                                    }
                                                                )
                                                            }
                                                            value={
                                                                formData
                                                                    ?.thresholdSetting?.[
                                                                    field.slug
                                                                ]?.value || ""
                                                            }
                                                        />
                                                        <select
                                                            className="w-[80px] h-[40px] border border-[#D0D5DD] rounded-lg px-2 text-[#344054] bg-white shadow-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition"
                                                            value={
                                                                formData
                                                                    ?.thresholdSetting?.[
                                                                    field.slug
                                                                ]?.type || ""
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    "thresholdSetting",
                                                                    field.slug,
                                                                    {
                                                                        type: e
                                                                            .target
                                                                            .value,
                                                                    }
                                                                )
                                                            }
                                                        >
                                                            {[
                                                                {
                                                                    label: "%",
                                                                    value: "percentage",
                                                                },
                                                                {
                                                                    label: "Number",
                                                                    value: "number",
                                                                },
                                                            ].map((item) => (
                                                                <option
                                                                    key={
                                                                        item.value
                                                                    }
                                                                    value={
                                                                        item.value
                                                                    }
                                                                >
                                                                    {item.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })}
                        </tbody>
                    </table>
                </div>
                <div>
                    <button
                        className="bg-primary text-white px-6 py-3 rounded-lg mt-4 hover:bg-blue-700 transition"
                        onClick={() => handleSave()}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnitTable;
