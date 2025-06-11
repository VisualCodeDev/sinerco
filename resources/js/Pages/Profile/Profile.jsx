import TableComponent from "@/Components/TableComponent";
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

   
    console.log(requestList)
    return (
        <PageLayout>
            <div className="flex flex-row h-screen">
                <section className="w-1/2">
                    <div>
                        <h2 className="text-xl font-bold mb-4">
                            Account Information
                        </h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col">
                            <p className="font-semibold text-lg">Name:</p>
                            <p className="text-lg">{data?.name}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-semibold text-lg">Role:</p>
                            <p className="text-lg">
                                {toCapitalizeFirstLetter(data?.role)}
                            </p>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-semibold text-lg">
                                WhatsApp Number:
                            </p>
                            <p className="text-lg">{data?.whatsAppNum}</p>
                        </div>
                    </div>
                </section>
                <section className="w-1/2">
                    {/* <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Unit Areas</h2>
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
                        <h2 className="text-xl font-bold mb-4">Permissions ({permissionData?.length})</h2>
                        {permissionData && permissionData.length > 0 ? (
                            <div className="flex flex-col max-h-[35vh] overflow-y-auto bg-white">
                                {permissionData.map((permission, index) => (
                                    <a
                                        key={index}
                                        href={route(
                                            "daily",
                                            permission?.unitAreaLocationId
                                        )}
                                        className="flex justify-between items-center border-b border-gray-200 p-4 hover:bg-gray-100 transition-all"
                                    >
                                        <p className="text-lg font-semibold">
                                            {permission?.unit?.unit}
                                        </p>
                                        <a
                                            className="bg-primary text-white px-4 py-2 rounded"
                                            href={route(
                                                "daily",
                                                permission?.unitAreaLocationId
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
                        <h2 className="text-xl font-bold mb-4">
                            Request ({requestList.length})
                        </h2>
                        <div className="bg-white max-h-[35vh] overflow-y-auto">
                            {requestList && requestList.length > 0 ? (
                                <div>
                                    {requestList.map((request) => (
                                        <a
                                            href={route("request")}
                                            key={request.requestId}
                                            className="p-4 border-b border-gray-200 flex justify-between hover:bg-gray-100 transition-all"
                                        >
                                            <div>
                                                <p className="font-semibold text-lg">
                                                    {request?.unit?.unit} -{" "}
                                                    {getRequestTypeName(
                                                        request.requestType
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {request.description}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Requested on:{" "}
                                                    {getFormattedDate(
                                                        request.created_at,
                                                        "DD MMM YYYY, HH:mm"
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Status: {request.status}
                                                </p>
                                            </div>
                                            <div className="text-end">
                                                <p
                                                    className={`text-lg font-bold ${
                                                        request.unit.status ===
                                                        "online"
                                                            ? "text-green-600"
                                                            : request.unit
                                                                  .status ===
                                                              "sd"
                                                            ? "text-red-600"
                                                            : "text-yellow-600"
                                                    }`}
                                                >
                                                    {toCapitalizeFirstLetter(
                                                        getRequestTypeName(
                                                            request.unit.status
                                                        )
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Seen Status:{" "}
                                                    {request.action ||
                                                        "Not Seen"}
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
