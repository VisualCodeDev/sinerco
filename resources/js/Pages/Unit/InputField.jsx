import Modal from "@/Components/Modal";
import MultiSelectDropdown from "@/Components/MultiSelectDropdown";
import { useToast } from "@/Components/Toast/ToastProvider";
import { fetch } from "@/Components/utils/database-util";
import PageLayout from "@/Layouts/PageLayout";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    FaGripHorizontal,
    FaGripVertical,
    FaPlus,
    FaRegTrashAlt,
    FaTrash,
    FaTrashAlt,
} from "react-icons/fa";

const InputField = () => {
    const [selectedUnit, setSelectedUnit] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    const [confirmModal, setConfirmModal] = useState(false);

    const [tempField, setTempField] = useState(null);

    const [selectedType, setSelectedType] = useState("");
    const [fields, setFields] = useState([]);
    const { data, loading } = fetch("unit.area.get");
    const { addToast } = useToast();

    useEffect(() => {
        if (!data || data?.length === 0) return;

        const unitData = data?.map((item) => ({
            label: item?.unit?.unit,
            value: item.unitId,
        }));

        setUnitOptions(unitData);
    }, [data]);

    useEffect(() => {
        if (!selectedUnit || selectedUnit?.length === 0) return;
        const fetchData = async () => {
            const { data } = await axios.get(
                route("field.unit.get", { unitId: selectedUnit[0] })
            );
            setFields(data?.input_fields);
        };

        fetchData();
    }, [selectedUnit]);

    const handleSubField = (type, item) => {
        setSelectedField(item);
        setSelectedType(type);
        setOpenModal(true);
    };

    const handleField = (type) => {
        setSelectedField(null);
        setSelectedType(type);
        setOpenModal(true);
    };

    const handleAddNew = async (type, value, fieldId) => {
        if (type === "subfield") {
            if (!fieldId) return;
            try {
                const resp = await axios.post(route("subfield.add"), {
                    subfield_name: value,
                    fieldId,
                });
                if (resp?.status === 200 || resp?.status === 201) {
                    addToast(resp?.data);
                    setFields((prevFields) =>
                        prevFields.map((f) =>
                            f.id === fieldId
                                ? {
                                      ...f,
                                      subfields: [
                                          ...f.subfields,
                                          resp.data.newSubfield,
                                      ],
                                  }
                                : f
                        )
                    );
                    setSelectedField({
                        ...selectedField,
                        subfields: [
                            ...selectedField?.subfields,
                            resp.data.newSubfield,
                        ],
                    });
                }
            } catch (e) {
                addToast({ type: "error", text: e.response?.data?.message });
                console.error(e);
            }
        } else if (type === "field") {
            try {
                const resp = await axios.post(route("field.add"), {
                    field_name: value,
                    unitId: selectedUnit,
                });

                if (resp?.status === 200 || resp?.status === 201) {
                    addToast(resp?.data);
                    setFields([...fields, resp.data.newField]);
                }
            } catch (e) {
                addToast({ type: "error", text: e.response?.data?.message });
                console.error(e);
            }
        }

        setOpenModal(false);
    };

    const saveChanges = async (field) => {
        try {
            const resp = await axios.post(route("field.edit"), {
                fieldId: field.id,
                field_name: field.field_name,
                subfields: field.subfields,
            });
            if (resp?.status === 200 || resp?.status === 201) {
                addToast(resp?.data);
                setFields(
                    fields.map((f) =>
                        f.id === field.id ? resp.data.newField : f
                    )
                );
            }
        } catch (error) {
            console.error("Error saving changes:", error);
            addToast({ type: "error", text: error.response?.data?.message });
        }
    };

    const editSelectedField = async (field, value) => {
        setTempField({ ...tempField, [field]: value });
    };

    const editSelectedSubfields = async (field, value, id) => {
        setTempField({
            ...tempField,
            subfields: tempField?.subfields?.map((subfield) =>
                subfield.id === id ? { ...subfield, [field]: value } : subfield
            ),
        });
    };

    const removeSubfield = (id) => {
        setTempField({
            ...tempField,
            subfields: tempField?.subfields?.filter(
                (subfield) => subfield.id !== id
            ),
        });
    };

    const removeField = async (pivot) => {
        try {
            const resp = await axios.delete(route("field.delete"), {
                data: {
                    unitId: pivot?.unit_id,
                    fieldId: pivot?.field_id,
                },
            });

            if (resp?.status === 200 || resp?.status === 201) {
                addToast(resp?.data);
            }
        } catch (error) {
            console.error("Error removing field:", error);
            addToast({ type: "error", text: error.response?.data?.message });
        }
        setFields(fields?.filter((field) => field.id !== pivot?.field_id));
        setSelectedField(null);
    };
    useEffect(() => {
        setTempField(selectedField);
    }, [selectedField]);
    return (
        <PageLayout>
            <div className="">
                <MultiSelectDropdown
                    placeholder={"Select Unit"}
                    options={unitOptions}
                    selected={selectedUnit}
                    setSelected={setSelectedUnit}
                />
                {selectedUnit?.length > 0 && (
                    <div className="flex lg:md:flex-row flex-col w-full h-full">
                        {/* Left Panel */}
                        <div className="flex flex-col overflow-x-auto lg:md:min-w-[50%] bg-white border-r border-gray-200">
                            {fields
                                ?.filter(
                                    (field) => field.field_value !== "time"
                                )
                                .map((main, index) => (
                                    <a href={`#${main.id}`}
                                        key={index}
                                        onClick={() => {
                                            setSelectedField(main);
                                        }}
                                        className={`flex justify-between items-center w-full px-6 py-3 transition-colors duration-150 cursor-pointer 
                                        border-b border-gray-200 hover:bg-gray-100 
                                        ${
                                            selectedField?.id === main.id
                                                ? "bg-gray-100"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FaGripVertical className="text-gray-400 text-lg cursor-grab" />
                                            <div className="flex flex-col">
                                                <p className="text-gray-800 font-medium">
                                                    {main?.field_name}
                                                </p>
                                            </div>
                                        </div>
                                        <FaRegTrashAlt
                                            onClick={() => {
                                                setConfirmModal(true);
                                                setSelectedField(main);
                                            }}
                                            className="text-red-400 text-end text-lg cursor-pointer"
                                        />
                                    </a>
                                ))}

                            {/* Add New Field Button */}
                            <button
                                onClick={() => handleField("field")}
                                className="flex items-center justify-center px-6 py-3 bg-primary text-white hover:bg-primary/90 transition rounded-md"
                            >
                                New Field
                            </button>
                        </div>

                        {/* Right Panel */}
                        {tempField && (
                            <div className="flex flex-col gap-4 overflow-x-auto bg-gray-50 w-full h-[80vh] overflow-y-auto p-8 relative">
                                <p className="text-2xl font-bold text-gray-800">
                                    {selectedField?.field_name}
                                </p>

                                <div className="flex flex-col gap-2" id={`${tempField.id}`}>
                                    <label className="text-sm font-medium text-gray-600">
                                        Field Name
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) =>
                                            editSelectedField(
                                                "field_name",
                                                e.target.value
                                            )
                                        }
                                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                        value={tempField?.field_name}
                                    />
                                </div>
                                {tempField &&
                                    tempField?.subfields?.length > 0 && (
                                        <>
                                            <p className="font-bold text-lg">
                                                Subfields
                                            </p>
                                            {tempField?.subfields.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex flex-col gap-2 w-full"
                                                    >
                                                        <label className="text-sm font-medium text-gray-600">
                                                            Subfield {index + 1}{" "}
                                                            Name
                                                        </label>
                                                        <div className="flex w-full items-center gap-2">
                                                            <input
                                                                type="text"
                                                                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
                                                                value={
                                                                    item?.subfield_name
                                                                }
                                                                onChange={(e) =>
                                                                    editSelectedSubfields(
                                                                        `subfield_name`,
                                                                        e.target
                                                                            .value,
                                                                        item?.id
                                                                    )
                                                                }
                                                            />
                                                            <button
                                                                className="text-red-500 hover:text-red-700 font-extrabold"
                                                                onClick={() =>
                                                                    removeSubfield(
                                                                        item?.id
                                                                    )
                                                                }
                                                            >
                                                                x
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </>
                                    )}

                                <button
                                    onClick={() =>
                                        handleSubField(
                                            "subfield",
                                            selectedField
                                        )
                                    }
                                    className="mt-4 flex items-center justify-center px-6 py-3 bg-primary text-white hover:bg-primary/90 transition rounded-md"
                                >
                                    Add Subfield
                                </button>
                                <button
                                    onClick={() => saveChanges(tempField)}
                                    className=" mt-4 flex items-center justify-center px-6 py-3 bg-green-500 text-white hover:bg-green-500/90 transition rounded-md"
                                >
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {openModal && (
                    <FieldMenu
                        setOpenModal={setOpenModal}
                        handleAddNew={handleAddNew}
                        type={selectedType}
                        field={selectedField}
                    />
                )}
                {confirmModal && (
                    <ConfirmModal
                        setOpenModal={setConfirmModal}
                        type={"Field"}
                        field={selectedField}
                        remove={removeField}
                    />
                )}
            </div>
        </PageLayout>
    );
};

const FieldMenu = (props) => {
    const { setOpenModal, type, field, handleAddNew } = props;
    const [name, setName] = useState("");

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-[150] pointer-events-auto"></div>
            <div
                className={`fixed rounded-xl border shadow-sm top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[80vh] flex flex-col z-[160] overflow-hidden`}
            >
                <div className="bg-primary text-white w-full px-5 py-4 md:py-6 sticky top-0 left-0 flex flex-col gap-4 shadow-md z-50">
                    {/* Input Label + Field */}
                    <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-2">
                        <label
                            htmlFor="field_name"
                            className="text-lg md:text-xl font-semibold md:min-w-[160px] capitalize"
                        >
                            {type} Name:
                        </label>
                        <input
                            onChange={(e) => setName(e.target.value)}
                            id="field_name"
                            type="text"
                            className="text-black px-3 py-1.5 rounded-md w-full md:max-w-md focus:outline-none focus:ring-2 focus:ring-white/70"
                            placeholder="Enter subfield name"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex justify-end gap-4 text-sm md:text-base font-medium">
                        <button
                            onClick={() => handleAddNew(type, name, field?.id)}
                            className="px-4 py-2 bg-white text-primary rounded hover:bg-gray-200 transition"
                        >
                            Submit
                        </button>
                        <button
                            onClick={() => setOpenModal(false)}
                            className="px-4 py-2 border border-white rounded hover:bg-white hover:text-primary transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const ConfirmModal = (props) => {
    const { setOpenModal, type, field, handleAddNew, remove } = props;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-[150] pointer-events-auto"></div>
            <div className="fixed rounded-xl border shadow-sm top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[80vh] flex flex-col z-[160] overflow-hidden">
                <div className="bg-primary text-white w-full px-5 py-4 md:py-6 sticky top-0 left-0 flex flex-col gap-4 shadow-md z-50">
                    <h3 className="text-lg md:text-xl font-semibold">
                        Are you sure you want to remove this {type}?
                    </h3>
                    <div className="w-full flex justify-end gap-4 text-sm md:text-base font-medium">
                        <button
                            onClick={() => {
                                remove(field?.pivot);
                                setOpenModal(false);
                            }}
                            className="px-4 py-2 bg-white text-primary rounded hover:bg-gray-200 transition"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={() => setOpenModal(false)}
                            className="px-4 py-2 border border-white rounded hover:bg-white hover:text-primary transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InputField;
