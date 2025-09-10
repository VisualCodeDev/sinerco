import LoadingSpinner from "@/Components/Loading";
import { useToast } from "@/Components/Toast/ToastProvider";
import PageLayout from "@/Layouts/PageLayout";
import axios from "axios";
import React, { useState } from "react";

const AddUser = ({ roles }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role_id: "",
    });
    const { addToast } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: name === "role_id" ? parseInt(value) : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const resp = await axios.post(route("user.add"), form);
            if (resp?.data) {
                setForm({ name: "", email: "", password: "", role_id: "" });
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
            setLoading(false)
        }
    };
    return (
        <PageLayout>
            {loading && <LoadingSpinner/>}
            <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-8 mt-10">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                    Add New User
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
                            required
                        />
                        {errors.name && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.name[0]}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
                            required
                        />
                        {errors.email && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.email[0]}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
                            required
                        />
                        {errors.password && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.password[0]}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            name="role_id"
                            value={form.role_id}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
                            required
                        >
                            <option value="">Select role</option>
                            {roles?.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name.charAt(0).toUpperCase() +
                                        role.name.slice(1)}
                                </option>
                            ))}
                        </select>
                        {errors.role && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.role[0]}
                            </p>
                        )}
                    </div>

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

export default AddUser;
