import TableComponent from "@/Components/TableComponent";
import {
    FaUserCircle,
    FaUserCog,
    FaEnvelope,
    FaPhoneAlt,
    FaKey,
    FaLock,
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
import { FaPencil } from "react-icons/fa6";
import { useToast } from "@/Components/Toast/ToastProvider";
import { router } from "@inertiajs/react";

const Profile = ({ data, permissionData, requestList }) => {
    const [formData, setFormData] = useState({
        selectedRows: [],
    });
    const [edit, setEdit] = useState(false);
    const [phoneNum, setPhoneNum] = useState(data?.whatsAppNum || "");
    const [passwordEdit, setPasswordEdit] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    const { addToast } = useToast();
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordForm.password !== passwordForm.password_confirmation) {
            addToast({ type: "error", text: "New password and confirmation do not match" });
            return;
        }

        if (passwordForm.password.length < 8) {
            addToast({ type: "error", text: "New password must be at least 8 characters" });
            return;
        }

        try {
            const resp = await axios.post(route("user.password.update"), {
                user_id: data?.user_id,
                current_password: passwordForm.current_password,
                password: passwordForm.password,
                password_confirmation: passwordForm.password_confirmation,
            });

            if (resp?.data?.type == "success") {
                setPasswordEdit(false);
                setPasswordForm({
                    current_password: "",
                    password: "",
                    password_confirmation: "",
                });
            }

            addToast(resp.data);
        } catch (err) {
            console.error(err);
            const message =
                err?.response?.data?.errors?.current_password?.[0] ||
                err?.response?.data?.errors?.password?.[0] ||
                "Failed to update password";
            addToast({ type: "error", text: message });
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!/^08\d+$/.test(phoneNum)) {
            addToast({ type: "error", text: "Phone number must start with 08 and contain only digits" });
            return;
        }

        if (phoneNum.length < 10 || phoneNum.length > 13) {
            addToast({ type: "error", text: "Phone number must be between 10 and 13 digits" });
            return;
        }

        try {
            const resp = await axios.post(route("user.phone.update"), {
                whatsAppNum: phoneNum,
                user_id: data?.user_id,
            });
            if (resp?.data?.type == "success") {
                setEdit(false);
            }

            addToast(resp.data);
        } catch (err) {
            console.error(err);
            addToast({ type: "error", text: "Failed to update" });
        }
    };
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
                            <div className="flex flex-col mb-1">
                                <p className="text-xl md:text-3xl font-semibold">
                                    {data?.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <p>More Info</p>
                            <hr className="flex-grow border-t border-[#ccc]" />
                        </div>
                        <div className="flex flex-col justify-start items-start text-md md:text-lg gap-4">
                            <div className="flex flex-row justify-center items-center">
                                <FaPhoneAlt className="bg-white/20 rounded-full p-1.5 md:p-2 text-2xl md:text-3xl mr-3" />
                                {edit ? (
                                    <form
                                        className="flex relative gap-2"
                                        onSubmit={(e) => handleSubmit(e)}
                                    >
                                        <input
                                            className="text-black"
                                            type="text"
                                            inputMode="numeric"
                                            value={phoneNum || ""}
                                            minLength={10}
                                            maxLength={13}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (
                                                    /^$|^0$|^08[0-9]*$/.test(
                                                        val
                                                    )
                                                ) {
                                                    setPhoneNum(val);
                                                }
                                            }}
                                            placeholder="Masukkan nomor diawali 08"
                                            required
                                        />
                                        <span className="text-xs text-start absolute bottom-0 translate-y-[100%] left-0">
                                            Must start with 08xxx
                                        </span>
                                        <button
                                            type="submit"
                                            className="border border-transparent bg-success px-2 py-1 rounded-md font-semibold text-center flex items-center text-sm"
                                        >
                                            Submit
                                        </button>
                                    </form>
                                ) : (
                                    <p className="">{phoneNum}</p>
                                )}
                                <button
                                    type="button"
                                    aria-label="Edit"
                                    className="ms-3 p-2 text-sm cursor-pointer border border-white/30 bg-white/10 rounded"
                                    onClick={() => setEdit(!edit)}
                                >
                                    {!edit && <FaPencil />}
                                </button>
                            </div>
                            <div className="flex flex-row justify-center items-center">
                                <FaEnvelope className="bg-white/20 rounded-full p-1.5 md:p-2 text-2xl md:text-3xl mr-3" />
                                <p className="">{data?.email}</p>
                            </div>
                            <div className="flex flex-row justify-center items-center">
                                <FaLock className="bg-white/20 rounded-full p-1.5 md:p-2 text-2xl md:text-3xl mr-3" />
                                {passwordEdit ? (
                                    <form
                                        className="flex flex-col relative gap-2"
                                        onSubmit={handlePasswordSubmit}
                                    >
                                        <input
                                            className="text-black"
                                            type="password"
                                            value={
                                                passwordForm.current_password
                                            }
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    current_password:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="Current password"
                                            autoComplete="current-password"
                                            required
                                        />
                                        <input
                                            className="text-black"
                                            type="password"
                                            value={passwordForm.password}
                                            minLength={8}
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    password: e.target.value,
                                                })
                                            }
                                            placeholder="New password"
                                            autoComplete="new-password"
                                            required
                                        />
                                        <input
                                            className="text-black"
                                            type="password"
                                            value={
                                                passwordForm.password_confirmation
                                            }
                                            minLength={8}
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    password_confirmation:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="Confirm new password"
                                            autoComplete="new-password"
                                            required
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className="border border-transparent bg-success px-2 py-1 rounded-md font-semibold text-center flex items-center text-sm"
                                            >
                                                Submit
                                            </button>
                                            <button
                                                type="button"
                                                className="border border-white/30 bg-white/20 px-2 py-1 rounded-md font-semibold text-center flex items-center text-sm"
                                                onClick={() => {
                                                    setPasswordEdit(false);
                                                    setPasswordForm({
                                                        current_password: "",
                                                        password: "",
                                                        password_confirmation:
                                                            "",
                                                    });
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <p className="">Reset Password</p>
                                )}
                                <button
                                    type="button"
                                    aria-label="Edit"
                                    className="ms-3 p-2 text-sm cursor-pointer border border-white/30 bg-white/10 rounded"
                                    onClick={() =>
                                        setPasswordEdit(!passwordEdit)
                                    }
                                >
                                    {!passwordEdit && <FaPencil />}
                                </button>
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
                                    <div
                                        key={index}
                                        onClick={() =>
                                            router.visit(
                                                route(
                                                    "daily",
                                                    permission?.unit_position_id
                                                )
                                            )
                                        }
                                        className="flex justify-between items-center border-b border-gray-200 p-4 hover:bg-gray-100 transition-all cursor-pointer"
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
                                    </div>
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
                                                        request.unit_position
                                                            ?.unit?.status ===
                                                        "running"
                                                            ? "text-green-600"
                                                            : request
                                                                  .unit_position
                                                                  ?.unit
                                                                  ?.status ===
                                                              "sd"
                                                            ? "text-red-600"
                                                            : "text-yellow-600"
                                                    }`}
                                                >
                                                    {toCapitalizeFirstLetter(
                                                        getRequestTypeName(
                                                            request
                                                                .unit_position
                                                                ?.unit?.status
                                                        )
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Seen Status:{" "}
                                                    {request.seenStatus
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
