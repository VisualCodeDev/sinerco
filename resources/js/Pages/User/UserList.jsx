import LoadingSpinner from "@/Components/Loading";
import TableComponent from "@/Components/TableComponent";
import { fetch } from "@/Components/utils/database-util";
import columns from "@/Components/utils/Setting/columns";
import PageLayout from "@/Layouts/PageLayout";
import { router } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import { FaAngleDown, FaNewspaper, FaPlus, FaUser } from "react-icons/fa";

const UserList = ({ roles }) => {
    const [expanded, setExpanded] = useState(false);
    const [selectedRole, setRole] = useState(null);
    const { data: users, loading, error } = fetch("user.get");
    const [filteredUser, setFilteredUser] = useState();
    const onRowClick = (item) => {
        router.visit(route("allocation", item?.id));
    };

    useEffect(() => {
        if (loading) return;
        let selectedFilterUser = users;
        if (selectedRole) {
            selectedFilterUser = users?.filter(
                (item) => item?.role_id === selectedRole?.id
            );
        }
        setFilteredUser(selectedFilterUser);
    }, [selectedRole, users]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <PageLayout>
            <div className="flex flex-col md:flex-row w-full h-full p-4 gap-6 md:gap-12 min-h-[90vh]">
                {/* Role List Desktop*/}
                <div className="md:w-1/3 w-full bg-white shadow-md rounded-lg p-10 space-y-2 lg:md:block hidden">
                    <div className="flex flex-row items-center gap-3 mb-6 text-lg md:text-xl font-semibold">
                        <div className="bg-[#e8edfc] text-primary p-1.5 md:p-1.5 rounded-md">
                            <FaNewspaper className="text-2xl md:text-3xl" />
                        </div>
                        <h2 className="font-bold text-base md:text-2xl text-gray-700">
                            Roles
                        </h2>
                    </div>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                        <button
                            onClick={() => setRole(null)}
                            className={`capitalize w-full text-left px-4 py-2 rounded-md hover:bg-blue-100 text-gray-800 font-medium transition-all duration-150 ${
                                !selectedRole ? "bg-blue-100" : "bg-gray-100"
                            }`}
                        >
                            All
                        </button>
                        {roles
                            ?.filter((item) => item?.name != "super_admin")
                            .map((item, index) => (
                                <button
                                    key={item?.id}
                                    onClick={() => setRole(item)}
                                    className={`capitalize w-full text-left px-4 py-2 rounded-md hover:bg-blue-100 text-gray-800 font-medium transition-all duration-150 ${
                                        selectedRole?.id === item?.id
                                            ? "bg-blue-100"
                                            : "bg-gray-100"
                                    }`}
                                >
                                    {item?.name}
                                </button>
                            ))}
                    </div>
                </div>

                {/* Role List Mobile*/}
                <div className="md:w-1/3 w-full bg-white shadow-md rounded-lg p-4 space-y-2 lg:md:hidden block">
                    <div className="flex flex-row items-center gap-2 mb-6 text-lg md:text-xl font-semibold">
                        <div className="bg-[#e8edfc] text-primary p-1.5 md:p-1.5 rounded-md">
                            <FaNewspaper className="" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-700">
                            Roles
                        </h2>
                    </div>
                    <div className="space-y-2 max-h-[10vh] relative px-2">
                        <div
                            className="flex justify-between items-center capitalize"
                            onClick={() => setExpanded(!expanded)}
                        >
                            <div>{selectedRole?.name || 'All'}</div>
                            <FaAngleDown />
                        </div>
                        <div
                            className={`absolute shadow-xl top-5 left-0 max-h-[20vh] overflow-y-auto ${
                                expanded ? "block" : "hidden"
                            }`}
                        >
                            <button
                                onClick={() => {
                                    setRole(null);
                                    setExpanded(false);
                                }}
                                className={`capitalize w-full text-left px-4 py-2 rounded-md hover:bg-blue-100 text-gray-800 font-medium transition-all duration-150 ${
                                    !selectedRole
                                        ? "bg-blue-100"
                                        : "bg-gray-100"
                                }`}
                            >
                                All
                            </button>
                            {roles
                                ?.filter((item) => item?.name != "super_admin")
                                .map((item) => (
                                    <button
                                        key={item?.name}
                                        onClick={() => {
                                            setRole(item);
                                            setExpanded(false);
                                        }}
                                        className={`capitalize w-full text-left px-4 py-2 hover:bg-blue-100 text-gray-800 font-medium transition-all duration-150 ${
                                            selectedRole === item.role
                                                ? "bg-blue-100"
                                                : "bg-gray-100"
                                        }`}
                                    >
                                        {item?.name}
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>

                {/* User List */}
                <div className="md:w-2/3 w-full bg-white shadow-md rounded-lg p-4 md:p-10 space-y-2">
                    <div className="flex flex-row justify-between items-center mb-6 text-lg md:text-xl font-semibold">
                        <div className="flex flex-row items-center gap-3 ">
                            <div className="bg-[#e8edfc] text-primary p-1.5 md:p-1.5 rounded-md">
                                <FaUser className="text-2xl md:text-3xl" />
                            </div>
                            <h2 className="font-bold text-base md:text-2xl text-gray-700">
                                Users
                            </h2>
                        </div>
                        <div className="flex justify-center items-center gap-2 cursor-pointer bg-primary text-white px-3 py-2 rounded-md hover:bg-white hover:border-primary border-2 hover:text-primary transition-all">
                            <FaPlus />
                            <a className="text-base" href={route("user.new")}>
                                Add New User
                            </a>
                        </div>
                    </div>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                        {filteredUser?.length > 0 ? (
                            filteredUser.map((item) => (
                                <div
                                    key={item?.email}
                                    onClick={() => onRowClick(item)}
                                    className="flex justify-between items-center px-4 py-2 rounded-md bg-blue-50 hover:bg-blue-100 cursor-pointer text-blue-800 font-medium shadow-sm"
                                >
                                    <div>
                                        <p>{item?.name}</p>
                                        <p className="md:text-sm text-xs text-slate-400">
                                            {item?.email}
                                        </p>
                                    </div>
                                    <p>
                                        {item?.role === "super_admin"
                                            ? "ADMIN"
                                            : item?.role.toUpperCase()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 italic">
                                No User available.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default UserList;
