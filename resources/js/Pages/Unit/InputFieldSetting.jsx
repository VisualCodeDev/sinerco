import LoadingSpinner from "@/Components/Loading";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useState } from "react";
import { FaObjectGroup } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";

const InputFieldSetting = () => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedField, setSelectedField] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(route("input.field.get"));

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setFields(data);
            } catch (error) {
                console.error("Gagal ambil data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    console.log(fields);
    return (
        <PageLayout>
            {loading && <LoadingSpinner />}
            <div className="flex gap-5">
                {/* Left side */}
                <div className="md:w-1/3 w-full bg-white shadow-md rounded-lg p-10 space-y-2 lg:md:block hidden">
                    <div className="flex flex-row items-center gap-3 mb-6 text-lg md:text-xl font-semibold">
                        <div className="bg-[#e8edfc] text-primary p-1.5 md:p-1.5 rounded-md">
                            <IoDocumentText className="text-2xl md:text-3xl" />
                        </div>
                        <h2 className="font-semibold text-base md:text-2xl text-gray-700">
                            Fields
                        </h2>
                    </div>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                        {fields?.map((item) => (
                            <button
                                key={item?.id}
                                onClick={() => setSelectedField(item)}
                                className={`w-full text-left px-4 py-2 rounded-md hover:bg-blue-100 text-gray-800 font-medium transition-all duration-150 ${
                                    selectedField?.id === item?.id
                                        ? "bg-blue-100"
                                        : "bg-gray-100"
                                }`}
                            >
                                {item?.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right side */}
                <div className="md:w-2/3 w-full bg-white shadow-lg rounded-2xl p-8 space-y-4 hidden lg:block transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-50 text-primary p-2 rounded-xl shadow-sm">
                            <IoDocumentText className="text-3xl" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="font-semibold text-xl text-gray-800">
                                Edit Field
                            </h2>
                            <span className="text-sm text-gray-500">
                                (Changes won't apply to existing committed data)
                            </span>
                        </div>
                    </div>

                    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        {selectedField ? (
                            <div className="space-y-5">
                                {/* Field Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Field Name
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedField?.name}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                                        // onChange={() => {}}
                                    />
                                </div>

                                {/* Subfields */}
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">
                                        Subfields
                                    </p>
                                    {selectedField?.subfields?.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedField.subfields.map(
                                                (item) => (
                                                    <input
                                                        type="text"
                                                        value={
                                                            item?.name
                                                        }
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                                                        // onChange={() => {}}
                                                    />
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">
                                            No Subfields available
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 py-10">
                                <IoDocumentText className="text-5xl mb-3" />
                                <p className="text-sm">
                                    Select a field to start editing
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default InputFieldSetting;
