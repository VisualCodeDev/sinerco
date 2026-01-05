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
    const [unitData, setUnitData] = useState(data);
    const [formData, setFormData] = useState({
        selectedRows: [],
        data: unitData,
        selectedUnitPositions: [],
    });

    const [thresholdSetting, setThresholdSetting] = useState(null);
    const [visibilitySetting, setVisibilitySetting] = useState(null);
    const { user } = useAuth();
    const [isSettingModal, setIsSettingModal] = useState(false);
    const [isExportModal, setExportModal] = useState(false);
    const [edit, setEdit] = useState(false);
    const { addToast } = useToast();
    useEffect(() => {
        setFormData({ ...formData, data: unitData });
    }, [unitData]);

    useEffect(() => {
        setThresholdSetting(
            data.find(
                (item) =>
                    formData?.selectedRows[
                        formData?.selectedRows.length - 1
                    ] === item?.unit_id
            )?.thresholdSetting || null
        );
        setVisibilitySetting(
            data.find(
                (item) =>
                    formData?.selectedRows[
                        formData?.selectedRows.length - 1
                    ] === item?.unit_id
            )?.visibilitySetting || null
        );
    }, [formData?.selectedRows]);
    const handleClick = (item, e) => {
        if (!item.unit_position_id || edit) return;
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
                selectedUnitPositions: [],
            }));
        } else {
            // Select all
            setFormData((prev) => ({
                ...prev,
                selectedRows: data.map((item) => item.unit_id),
                selectedUnits: data.map((item) => item.unit),
                selectedUnitPositions: data.map(
                    (item) => item.unit_position_id
                ),
            }));
        }
    };

    const handleSubmit = ({ type }) => {
        if (formData.selectedRows.length === 0) return;
        if (type === "export") {
            setExportModal(true);
            setIsSettingModal(false);
        } else {
            setIsSettingModal(true);
            setExportModal(false);
        }
    };

    const columns = tColumns("unitList", formData, null, handleSelectAll, edit);
    const onSelect = (selected) => {
        const currSelected = formData?.selectedRows || [];
        const currSelectedUnits = formData?.selectedUnits || [];
        const currSelectedUnitPositions = formData?.selectedUnitPositions || [];
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
                selectedUnitPositions: currSelectedUnitPositions.filter(
                    (item) => item !== selected.unit_position_id
                ),
            }));
            return
        }
        // Select
        setFormData({
            ...formData,
            selectedRows: [...currSelected, String(selected.unit_id)],
            selectedUnits: [...(formData.selectedUnits || []), selected.unit],
            selectedUnitPositions: [
                ...(formData.selectedUnitPositions || []),
                selected.unit_position_id,
            ],
        });
        // setThresholdSetting(selected.thresholdSetting || null);
        // setVisibilitySetting(selected.visibilitySetting || null);
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
                data={unitData}
                setData={setUnitData}
                addToast={addToast}
                isModal={isSettingModal}
                setIsModal={setIsSettingModal}
                unitName={formData?.selectedUnits}
                thresholdSetting={thresholdSetting}
                visibilitySetting={visibilitySetting}
                selectedUnits={formData?.selectedRows}
            />
            <ExportModal
                isModal={isExportModal}
                setIsModal={setExportModal}
                selectedUnitPositions={formData?.selectedUnitPositions}
            />
        </>
        // <></>
    );
};

const ExportModal = ({ isModal, setIsModal, selectedUnitPositions }) => {
    const [formData, setFormData] = useState({
        name: "",
        department: "",
        clientName: "",
        clientDepartment: "",
    });
    const handleExport = () => {
        window.open(
            route("export_doc", {
                unit_pos_id: selectedUnitPositions,
                client_name: formData?.clientName || "client name",
                client_department:
                    formData?.clientDepartment || "client department",
                name: formData?.name || "name",
                department: formData?.department || "department",
            }),
            "_blank"
        );
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <Modal
            showModal={isModal}
            handleCloseModal={() => setIsModal(false)}
            title="Export BA"
        >
            <Modal.Body>
                <div className="space-y-4 p-4 rounded-lg shadow-sm">
                    {/* From Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="col-span-1 flex items-center space-x-2">
                            <span className="font-semibold w-24">From:</span>
                            <input
                                type="text"
                                onChange={(e) =>
                                    handleChange("name", e.target.value)
                                }
                                value={formData?.name}
                                placeholder="Name"
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                        </div>
                        <div className="col-span-1 flex items-center space-x-2">
                            <input
                                type="text"
                                onChange={(e) =>
                                    handleChange("department", e.target.value)
                                }
                                value={formData?.department}
                                placeholder="Department"
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                        </div>
                    </div>

                    {/* To Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="col-span-1 flex items-center space-x-2">
                            <span className="font-semibold w-24">To:</span>
                            <input
                                type="text"
                                onChange={(e) =>
                                    handleChange("clientName", e.target.value)
                                }
                                value={formData?.clientName}
                                placeholder="Client Name"
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                        </div>
                        <div className="col-span-1 flex items-center space-x-2">
                            <input
                                type="text"
                                onChange={(e) =>
                                    handleChange(
                                        "clientDepartment",
                                        e.target.value
                                    )
                                }
                                value={formData?.clientDepartment}
                                placeholder="Client Department"
                                className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="flex items-center justify-end">
                    <button className="button-submit" onClick={handleExport}>
                        Export
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

const SettingModal = ({
    setData,
    data,
    isModal,
    setIsModal,
    thresholdSetting,
    visibilitySetting,
    unitName,
    selectedUnits,
    addToast,
}) => {
    const [formData, setFormData] = useState({
        thresholdSetting: {},
        visibilitySetting: {},
    });

    const [fields, setFields] = useState([]);

    useEffect(() => {
        const fetchFields = async () => {
            const data = await getFields();
            setFields(data);
        };
        fetchFields();

        let defaultThresholdSetting = {};
        let defaultVisibilitySetting = {};

        formItems
            .filter((item) => item.name !== "time")
            .forEach((item) => {
                if (item?.subheader && item.subheader.length > 0) {
                    item.subheader.forEach((sub) => {
                        defaultThresholdSetting[sub.name] = {
                            value: 0,
                            type: "number",
                        };
                        defaultVisibilitySetting[sub.name] = true;
                    });
                    return;
                }
                defaultThresholdSetting[item.name] = {
                    value: 0,
                    type: "number",
                };
                defaultVisibilitySetting[item.name] = true;
            });
        setFormData((prev) => ({
            ...prev,
            thresholdSetting: thresholdSetting ?? defaultThresholdSetting,
            visibilitySetting: visibilitySetting ?? defaultVisibilitySetting,
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

    const handleClickVisibility = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
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
                const updatedData = data.map((item) =>
                    selectedUnits.includes(item.unit_id)
                        ? { ...item, ...formData }
                        : item
                );
                console.log(updatedData);
                setData(updatedData);
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
                <span className="font-bold text-2xl">
                    {Array.isArray(unitName) && unitName?.length > 5
                        ? unitName.slice(0, 5).join(", ") + ", ..."
                        : unitName?.join(", ") || unitName}
                </span>
                <div className="overflow-y-auto overflow-x-auto w-full bg-white rounded-xl z-50">
                    <table className="w-full h-full table-auto border-collapse">
                        <thead className="bg-[#243F96] text-white z-10 shadow-sm w-full sticky top-0">
                            <tr className="sticky top-0">
                                <th className="font-semibold text-nowrap text-left px-6 py-4 w-[45%]">
                                    Item
                                </th>
                                <th className="font-semibold text-nowrap text-left px-6 py-4 w-[45%]">
                                    Input Threshold
                                </th>
                                <th className="font-semibold text-nowrap text-left px-6 py-4 w-[10%]">
                                    Status
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
                                                className={`${
                                                    !formData.visibilitySetting[
                                                        field.slug
                                                    ]
                                                        ? "bg-[#cecece]"
                                                        : "bg-[#F9FAFB] hover:bg-[#F3F4F6]"
                                                } border-b border-[#E4E7EC] transition-colors`}
                                            >
                                                {/* ITEM NAME */}
                                                <td
                                                    className={`py-6 px-6 font-medium text-[#101828] whitespace-nowrap ${
                                                        !formData
                                                            .visibilitySetting[
                                                            field.slug
                                                        ] && "text-gray-400"
                                                    }`}
                                                >
                                                    {field.name}
                                                </td>

                                                {/* INPUT THRESHOLD */}
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            placeholder="Threshold"
                                                            disabled={
                                                                !formData
                                                                    .visibilitySetting[
                                                                    field.slug
                                                                ]
                                                            }
                                                            className={`w-[120px] h-[40px] border border-[#D0D5DD] rounded-lg px-3 text-[#344054] shadow-sm focus:ring-2 focus:ring-[#2563EB] focus:outline-none transition ${
                                                                !formData
                                                                    .visibilitySetting[
                                                                    field.slug
                                                                ] &&
                                                                "text-gray-400"
                                                            }`}
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
                                                            disabled={
                                                                !formData
                                                                    .visibilitySetting[
                                                                    field.slug
                                                                ]
                                                            }
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

                                                {/* Hide */}
                                                <td className="px-6 py-4">
                                                    <div className="">
                                                        {formData
                                                            ?.visibilitySetting?.[
                                                            field.slug
                                                        ] ? (
                                                            <button
                                                                onClick={(e) =>
                                                                    handleClickVisibility(
                                                                        "visibilitySetting",
                                                                        field.slug,
                                                                        !formData
                                                                            ?.visibilitySetting?.[
                                                                            field
                                                                                .slug
                                                                        ]
                                                                    )
                                                                }
                                                                className="text-red-50 bg-success font-bold px-2 py-1 rounded-lg"
                                                            >
                                                                Active
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) =>
                                                                    handleClickVisibility(
                                                                        "visibilitySetting",
                                                                        field.slug,
                                                                        !formData
                                                                            ?.visibilitySetting?.[
                                                                            field
                                                                                .slug
                                                                        ]
                                                                    )
                                                                }
                                                                className="text-red-50 bg-danger font-bold px-2 py-1 rounded-lg"
                                                            >
                                                                Hidden
                                                            </button>
                                                        )}
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
