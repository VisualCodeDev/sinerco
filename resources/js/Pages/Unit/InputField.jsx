import Modal from "@/Components/Modal";
import MultiSelectDropdown from "@/Components/MultiSelectDropdown";
import { useToast } from "@/Components/Toast/ToastProvider";
import { fetch } from "@/Components/utils/database-util";
import PageLayout from "@/Layouts/PageLayout";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";

const InputField = () => {
    const [selectedUnit, setSelectedUnit] = useState([]);
    const [unitOptions, setUnitOptions] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedField, setSelectedField] = useState({});
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
            console.log(data);
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
            console.log(fieldId)
            try {
                const resp = await axios.post(route("subfield.add"), {
                    subfield_name: value,
                    fieldId,
                });
                if (resp?.status === 200 || resp?.status === 201) {
                    console.log(resp?.data);
                    addToast(resp?.data);
                    setFields((prev) =>
                        prev.map((field) =>
                            field.id === fieldId
                                ? {
                                      ...field,
                                      has_subfields: 1,
                                      sub_fields: [
                                          ...(field.sub_fields || []),
                                          {
                                              subfield_name: value,
                                              temp_id: Date.now(),
                                          },
                                      ],
                                  }
                                : field
                        )
                    );
                }
            } catch (e) {
                addToast({ type: "error", text: e.response?.data?.message });
                console.error(e);
            }
        } else if (type === "field") {
            const formattedValue = {
                id: fields[fields?.length - 1]?.id ,
                field_name: value,
            };

            try {
                const resp = await axios.post(route("field.add"), {
                    field_name: value,
                    unitId: selectedUnit,
                });

                if (resp?.status === 200 || resp?.status === 201) {
                    addToast(resp?.data);
                    setFields([...fields, formattedValue]);
                }
            } catch (e) {
                addToast({ type: "error", text: e.response?.data?.message });
                console.error(e);
            }
        }

        setOpenModal(false);
    };

    console.log(fields);
    return (
        <PageLayout>
            <MultiSelectDropdown
                placeholder={"Select Unit"}
                options={unitOptions}
                selected={selectedUnit}
                setSelected={setSelectedUnit}
            />
            {selectedUnit?.length > 0 && (
                <div className="flex overflow-x-auto">
                    {fields?.map((main, index) => (
                        <div
                            key={index}
                            className="border whitespace-nowrap bg-primary text-white flex flex-col justify-center items-center"
                        >
                            <div className="h-full text-center flex items-center px-10 py-2">
                                <p>{main?.field_name}</p>
                            </div>
                            {main.has_subfields ? (
                                <div className="w-full h-full text-center flex flex-nowrap whitespace-nowrap">
                                    {main?.subfields?.map((sub, index) => (
                                        <div className="text-center border w-max h-full p-2 min-w-[100px]">
                                            {(sub?.subfield_name != "" ||
                                                sub?.subfield_name) && (
                                                <p>{sub?.subfield_name}</p>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() =>
                                            handleSubField("subfield", main)
                                        }
                                        className="text-center border w-full h-full p-2 flex items-center justify-center"
                                    >
                                        <FaPlus className="text-white" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() =>
                                        handleSubField("subfield", main)
                                    }
                                    className="text-center border w-full h-full py-2 flex items-center justify-center"
                                >
                                    <FaPlus className="text-white" />
                                </button>
                            )}
                        </div>
                    ))}
                    <div className="whitespace-nowrap bg-primary text-white flex flex-col justify-center items-center">
                        <button
                            onClick={() => handleField("field")}
                            className="border w-full h-full text-center flex items-center px-10 py-2"
                        >
                            <FaPlus className="text-white" />
                        </button>
                    </div>
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

export default InputField;
