import Checkbox from "@/Components/Checkbox";
import { getUnitBA } from "@/Components/db";
import Modal from "@/Components/Modal";
import TableComponent from "@/Components/TableComponent";
import { useToast } from "@/Components/Toast/ToastProvider";
import columns from "@/Components/utils/BA/column";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useState } from "react";

const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

const BaPage = () => {
    const [formData, setFormData] = useState({
        selectedRows: [],
    });
    const [loading, isLoading] = useState(false);
    const [BaData, setBaData] = useState([]);
    const [data, setData] = useState([]);
    const [editModal, setEditModal] = useState(false);
    const [exportModal, setExportModal] = useState(false);

    const { addToast } = useToast();

    useEffect(() => {
        const fetch = async () => {
            const data = await getUnitBA();
            setData(data);
        };
        fetch();
    }, []);

    useEffect(() => {
        if (
            Array.isArray(formData.selectedRows) &&
            formData?.selectedRows.length > 0
        ) {
            const lastId =
                formData?.selectedRows?.[formData.selectedRows.length - 1];
            const initSetting = data?.find(
                (item) => String(item?.unit_position_id) === String(lastId)
            );
            setBaData({
                spv_name: initSetting?.spv_name || "",
                spv_department: initSetting?.spv_department || "",
                pic_name: initSetting?.pic_name || "",
                pic_department: initSetting?.pic_department || "",
                client_name: initSetting?.client_name || "",
                client_department: initSetting?.client_department || "",
            });
        }
    }, [formData?.selectedRows]);

    const selectAll = (currData) => {
        const isAllSelected =
            formData?.selectedRows?.length == currData?.length;
        if (isAllSelected) {
            setFormData({ ...formData, selectedRows: [] });
        } else {
            setFormData({
                ...formData,
                selectedRows: currData.map((item) =>
                    String(item.unit_position_id)
                ),
            });
        }
    };

    const handleSelect = (value) => {
        const selected = formData?.selectedRows || [];
        if (selected.includes(String(value?.unit_position_id))) {
            setFormData({
                ...formData,
                selectedRows: selected.filter(
                    (item) => String(item) !== String(value.unit_position_id)
                ),
            });
        } else {
            setFormData({
                ...formData,
                selectedRows: [...selected, String(value?.unit_position_id)],
            });
        }
    };

    const handleClick = ({ type }) => {
        if (type === "edit") {
            setEditModal(true);
            setExportModal(false);
        } else if (type === "export") {
            setExportModal(true);
            setEditModal(false);
        }
    };

    const tColumns = columns({ handleSelectAll: selectAll, formData });

    return (
        <PageLayout>
            <TableComponent
                handleSubmit={handleClick}
                isBA={true}
                onRowClick={handleSelect}
                title={"Berita Acara"}
                subtitle={"Settings"}
                data={data}
                columns={tColumns}
            />

            <SettingModal
                addToast={addToast}
                isModal={editModal}
                handleClose={() => setEditModal(false)}
                pic_name={BaData?.pic_name}
                pic_department={BaData?.pic_department}
                spv_name={BaData?.spv_name}
                spv_department={BaData?.spv_department}
                client_name={BaData?.client_name}
                client_department={BaData?.client_department}
                selectedUnits={formData.selectedRows}
            />

            <ExportModal
                isModal={exportModal}
                addToast={addToast}
                selectedUnits={formData.selectedRows}
                handleClose={() => setExportModal(false)}
            />
        </PageLayout>
    );
};

const SettingModal = (props) => {
    const {
        addToast,
        selectedUnits,
        isModal,
        handleClose,
        spv_name,
        spv_department,
        client_department,
        client_name,
        pic_name,
        pic_department,
    } = props;

    const [formData, setFormData] = useState({
        spv_name,
        spv_department,
        client_department,
        client_name,
        pic_name,
        pic_department,
    });

    useEffect(() => {
        setFormData({
            ...formData,
            spv_name,
            spv_department,
            client_department,
            client_name,
            pic_name,
            pic_department,
        });
    }, [
        spv_name,
        spv_department,
        client_department,
        client_name,
        pic_name,
        pic_department,
    ]);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const formSections = [
        {
            title: "PIC",
            fields: [
                {
                    label: "Name",
                    name: "pic_name",
                    value: pic_name,
                    placeholder: "Enter PIC name",
                },
                {
                    label: "Department",
                    name: "pic_department",
                    value: pic_department,
                    placeholder: "Enter PIC department",
                },
            ],
        },
        {
            title: "Supervisor",
            fields: [
                {
                    label: "Name",
                    name: "spv_name",
                    value: spv_name,
                    placeholder: "Enter supervisor name",
                },
                {
                    label: "Department",
                    name: "spv_department",
                    value: spv_department,
                    placeholder: "Enter supervisor department",
                },
            ],
        },
        {
            title: "Client",
            fields: [
                {
                    label: "Name",
                    name: "client_name",
                    value: client_name,
                    placeholder: "Enter client name",
                },
                {
                    label: "Department",
                    name: "client_department",
                    value: client_department,
                    placeholder: "Enter client department",
                },
            ],
        },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(route("ba.set.setting"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({ selectedUnits, ...formData }),
            });
            if (!res.ok) throw new Error("Request failed");
            else {
                addToast({ type: "success", text: "Save Successfully" });
                handleClose();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Modal
            showModal={isModal}
            handleCloseModal={handleClose}
            title={"BA Setting"}
        >
            <Modal.Body>
                {/* PIC */}
                <div className="space-y-6">
                    {formSections.map((section) => (
                        <div key={section.title} className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                {section.title}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.fields.map((field) => (
                                    <div key={field.name}>
                                        <label className="form-label">
                                            {field.label}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData?.[field.name] ?? ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    field.name,
                                                    e.target.value
                                                )
                                            }
                                            placeholder={field.placeholder}
                                            className="input-base"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="flex justify-end gap-3 w-full">
                    <button
                        type="submit"
                        className="button-submit"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

const ExportModal = (props) => {
    const { selectedUnits, isModal, handleClose, addToast } = props;

    const [data, setData] = useState({
        ba_req: false,
        bap: false,
        bapm: false,
        month: new Date().getMonth() + 1,
        template: 1,
    });

    const handleSubmit = async (e) => {
        if (selectedUnits?.length === 0)
            return addToast({
                type: "error",
                text: "Please Choose Unit(s) to Export",
            });
        if (!data?.ba_req && !data?.bapm && !data?.bap)
            return addToast({
                type: "error",
                text: "Please Choose BA to Export",
            });
        try {
            window.open(
                route("export_doc", {
                    unit_pos_id: selectedUnits,
                    ...data,
                }),
                "_blank"
            );
        } catch (e) {
            console.error(e);
        }
    };
    return (
        <Modal
            showModal={isModal}
            handleCloseModal={handleClose}
            title={"Export BA"}
        >
            <Modal.Body>
                <div className="flex flex-col gap-3">
                    <div className="mb-5 flex gap-2">
                        <div class="w-full max-w-xs ">
                            <label class="block mb-1 text-sm font-medium text-gray-700">
                                Choose Month
                            </label>
                            <select
                                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
                            focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                            transition duration-150 ease-in-out"
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        month: Number(e.target.value),
                                    })
                                }
                                value={data?.month}
                            >
                                <option value="" disabled selected>
                                    Choose Month
                                </option>
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                        </div>

                        <div class="w-full max-w-xs ">
                            <label class="block mb-1 text-sm font-medium text-gray-700">
                                Choose BAP Template
                            </label>
                            <select
                                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
                            focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                            transition duration-150 ease-in-out"
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        template: Number(e.target.value),
                                    })
                                }
                                value={data?.template}
                            >
                                <option value="" disabled selected>
                                    Choose Template
                                </option>
                                <option value="1">
                                    Template 1 (Avg Flow + avail + Sign)
                                </option>
                                <option value="2">
                                    Template 2 (Avg Flow + avail)
                                </option>
                                <option value="3">
                                    Template 3 (Location + Sign)
                                </option>
                                <option value="4">
                                    Template 4 (Location + Engine S/N)
                                </option>
                                <option value="5">
                                    Template 5 (Location + Table Sign)
                                </option>
                            </select>
                        </div>
                    </div>
                    {[
                        { name: "ba_req", label: "Berita Acara SD/STDBY" },
                        {
                            name: "bapm",
                            label: "Berita Acara Service Preventive Maintenance Program (BAPM)",
                        },
                        {
                            name: "bap",
                            label: "Berita Acara Penyelesaian Pekerjaan (BAP)",
                        },
                    ].map((item) => (
                        <div
                            key={item.name}
                            className="flex gap-4 items-center cursor-pointer w-full"
                            onClick={() =>
                                setData((prev) => ({
                                    ...prev,
                                    [item.name]: !prev[item.name],
                                }))
                            }
                        >
                            <Checkbox
                                name={item.name}
                                checked={data[item.name]}
                                onChange={(e) =>
                                    setData((prev) => ({
                                        ...prev,
                                        [item.name]: e.target.checked,
                                    }))
                                }
                            />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="flex align-items-center justify-end">
                    <button className="button-submit" onClick={handleSubmit}>
                        Export
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default BaPage;
