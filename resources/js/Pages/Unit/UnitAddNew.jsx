import LoadingSpinner from "@/Components/Loading";
import { useToast } from "@/Components/Toast/ToastProvider";
import PageLayout from "@/Layouts/PageLayout";
import CreatableSelect from "react-select/creatable";
import axios from "axios";
import React, { useState } from "react";

const UnitAddNew = ({ clients, locations, areas }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        unit: "",
        status: "running",
        client_id: "",
        area_id: null,
        area_name: "",
        location_id: null,
        location_name: "",
    });
    const { addToast } = useToast();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle Area change
    const handleAreaChange = (newValue, actionMeta) => {
        if (newValue?.__isNew__) {
            // User typed a new area
            setForm({
                ...form,
                area_id: null,
                area_name: newValue.label,
            });
        } else {
            // Existing area
            setForm({
                ...form,
                area_id: newValue?.value || null,
                area_name: "",
            });
        }
    };

    // Handle Location change
    const handleLocationChange = (newValue, actionMeta) => {
        if (newValue?.__isNew__) {
            setForm({
                ...form,
                location_id: null,
                location_name: newValue.label,
            });
        } else {
            setForm({
                ...form,
                location_id: newValue?.value || null,
                location_name: "",
            });
        }
    };

    const filteredLocations = form.area_id
        ? locations.filter((l) => l.area_id === form.area_id)
        : [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const resp = await axios.post(route("unit.add"), form);
            if (resp?.data) {
                setForm({
                    unit: "",
                    status: "running",
                    client_id: "",
                    area_id: "",
                    area_name: "",
                    location_id: "",
                    location_name: "",
                });
                setErrors({});
                addToast(resp.data);
            }
        } catch (e) {
            if (e.response?.status === 422) {
                setErrors(e.response.data.errors);
            } else {
                console.error(e);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageLayout>
            {loading && <LoadingSpinner />}
            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-8 mt-10">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                    Add New Unit
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Unit Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Name
                        </label>
                        <input
                            name="unit"
                            type="text"
                            value={form.unit}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
                            required
                        />
                        {errors.unit && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.unit[0]}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
                        >
                            <option value="running">Runing</option>
                            <option value="sd">Shutdown</option>
                            <option value="stdby">Stand By</option>
                        </select>
                        {errors.status && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.status[0]}
                            </p>
                        )}
                    </div>

                    {/* Client */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Client
                        </label>
                        <select
                            name="client_id"
                            value={form.client_id}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
                            required
                        >
                            <option value="">Select client</option>
                            {clients?.map((client) => (
                                <option
                                    key={client.client_id}
                                    value={client.client_id}
                                >
                                    {client.name}
                                </option>
                            ))}
                        </select>
                        {errors.client_id && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.client_id[0]}
                            </p>
                        )}
                    </div>

                    {/* Area */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Area
                        </label>
                        <CreatableSelect
                            isClearable
                            onChange={handleAreaChange}
                            options={areas.map((a) => ({
                                value: a.id,
                                label: a.area,
                            }))}
                            placeholder="Select or add area..."
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <CreatableSelect
                            isClearable
                            onChange={handleLocationChange}
                            options={filteredLocations.map((l) => ({
                                value: l.id,
                                label: l.location,
                            }))}
                            placeholder={
                                form.area_id || form.area_name
                                    ? "Select or add location..."
                                    : "Pick an area first"
                            }
                            isDisabled={!form.area_id && !form.area_name} // disable until area selected
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </PageLayout>
    );
};

export default UnitAddNew;
