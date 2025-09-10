import TableComponent from "@/Components/TableComponent";
import {
    FaUserCircle,
    FaUserCog,
    FaEnvelope,
    FaPhoneAlt,
    FaKey,
    FaFileSignature,
} from "react-icons/fa";
import {
    getFormattedDate,
    getRequestStatus,
    getRequestTypeName,
    toCapitalizeFirstLetter,
} from "@/Components/utils/dashboard-util";
import tColumns from "@/Components/utils/DataUnit/columns";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useState } from "react";

const Profile = ({ data, permissionData, requestList }) => {
    const [formData, setFormData] = useState({
        selectedRows: [],
    });

    return (
        <PageLayout>
            <div className="flex flex-col md:flex-row h-screen md:gap-10">
                <section className="flex flex-col items-center md:w-1/3 bg-primary text-white p-8 md:p-10 rounded-lg text-center">
                    <div>
                        <h2 className="text-lg md:text-xl font-semibold mb-10">
                            Account Information
                        </h2>
                    </div>
                    <div className="mb-5 md:mb-10">
                        <FaUserCircle className="text-white text-[80px] md:text-[150px]" />
                    </div>
                    <div className="flex flex-col w-full gap-4 md:gap-6">
                        <div className="">
                            <div className="flex justify-center items-center gap-2 mb-1 text-xl md:text-3xl">
                                <FaUserCog />
                                <p className="font-semibold">
                                    {data?.name}
                                </p>
                            </div>
                            {/* <div className="flex flex-row justify-center items-center gap-2 text-sm md:text-md text-[#ccc]">
                                <FaUserCog />
                                <p className="">
                                    {toCapitalizeFirstLetter(data?.role)}
                                </p>
                            </div> */}
                        </div>
                        <div className="flex items-center gap-4">
                            <p>More Info</p>
                            <hr className="flex-grow border-t border-[#ccc]" />
                        </div>
                        <div className="flex flex-col justify-start items-start text-md md:text-lg gap-4">
                            <div className="flex flex-row justify-center items-center">
                                <FaPhoneAlt className="bg-white/20 rounded-full p-1.5 md:p-2 text-2xl md:text-3xl mr-3" />
                                <p className="">{data?.whatsAppNum}</p>
                            </div>
                            <div className="flex flex-row justify-center items-center">
                                <FaEnvelope className="bg-white/20 rounded-full p-1.5 md:p-2 text-2xl md:text-3xl mr-3" />
                                <p className="">{data?.email}</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="md:w-2/3 bg-white p-8 md:p-10 rounded-lg">
                    {/* <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Unit Areas</h2>
                    {unitArea.length > 0 ? (
                        <TableComponent
                            data={unitArea}
                            columns={columns}
                            isSelectable={false}
                        />
                    ) : (
                        <p>No unit areas assigned.</p>
                    )}
                </div> */}
                    <div>
                        <div className="flex flex-row items-center gap-2 mb-6 text-lg md:text-xl">
                            <FaKey />
                            <h2 className="font-semibold">
                                Permissions ({permissionData?.length})
                            </h2>
                        </div>
                        {permissionData && permissionData.length > 0 ? (
                            <div className="flex flex-col max-h-[35vh] overflow-y-auto bg-white">
                                {permissionData.map((permission, index) => (
                                    <a
                                        key={index}
                                        href={route(
                                            "daily",
                                            permission?.unit_position_id
                                        )}
                                        className="flex justify-between items-center border-b border-gray-200 p-4 hover:bg-gray-100 transition-all"
                                    >
                                        <p className="text-md md:text-lg font-medium">
                                            {permission?.unit}
                                        </p>
                                        <a
                                            className="bg-primary text-white font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded text-sm md:text-md hover:scale-90 hover:bg-transparent hover:border-primary border-2 hover:text-primary transition ease-in-out delay-75"
                                            href={route(
                                                "daily",
                                                permission?.unit_position_id
                                            )}
                                        >
                                            Daily Form
                                        </a>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p>No permissions assigned.</p>
                        )}
                    </div>
                    <div className="mt-8">
                        <div className="flex flex-row items-center gap-2 mb-6 text-lg md:text-xl">
                            <FaFileSignature />
                            <h2 className="font-semibold">
                                Request ({requestList.length})
                            </h2>
                        </div>
                        <div className="bg-white max-h-[35vh] overflow-y-auto">
                            {requestList && requestList.length > 0 ? (
                                <div>
                                    {requestList.map((request) => (
                                        <a
                                            href={route("request")}
                                            key={request.request_id}
                                            className="md:p-4 border-b border-gray-200 flex justify-between hover:bg-gray-100 transition-all"
                                        >
                                            <div>
                                                <p className="font-medium text-base md:text-lg">
                                                    {request?.unit?.unit} -{" "}
                                                    {getRequestTypeName(
                                                        request.requestType
                                                    )}
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-600">
                                                    {request.description}
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-500">
                                                    Requested on:{" "}
                                                    {getFormattedDate(
                                                        request.created_at,
                                                        "DD MMM YYYY, HH:mm"
                                                    )}
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-500">
                                                    Status: {request.status}
                                                </p>
                                            </div>
                                            <div className="text-end">
                                                <p
                                                    className={`text-base md:text-lg font-semibold ${
                                                        request?.unit?.status ===
                                                        "running"
                                                            ? "text-green-600"
                                                            : request?.unit
                                                                  ?.status ===
                                                              "sd"
                                                            ? "text-red-600"
                                                            : "text-yellow-600"
                                                    }`}
                                                >
                                                    {toCapitalizeFirstLetter(
                                                        getRequestTypeName(
                                                            request?.unit?.status
                                                        )
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Seen Status:{" "}
                                                    {request.seen_status
                                                        ? "Confirmed"
                                                        : "Not Seen"}
                                                </p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p>No requests found.</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </PageLayout>
    );
};

export default Profile;
