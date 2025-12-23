import { getUnitBA } from "@/Components/db";
import Modal from "@/Components/Modal";
import TableComponent from "@/Components/TableComponent";
import columns from "@/Components/utils/BA/column";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useState } from "react";

const BaPage = () => {
    const [formData, setFormData] = useState({
        selectedRows: [],
    });
    const [loading, isLoading] = useState(false);
    const [BaData, setBaData] = useState([]);
    const [data, setData] = useState([]);
    const [editModal, setEditModal] = useState(false);
    const [exportModal, setExportModal] = useState(false);

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
                handleClose={() => setExportModal(false)}
            />
        </PageLayout>
    );
};

const SettingModal = (props) => {
    const {
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

    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");

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
            console.log(res);
            if (!res.ok) throw new Error("Request failed");
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
    const { selectedUnits, isModal, handleClose } = props;
    return (
        <Modal
            showModal={isModal}
            handleCloseModal={handleClose}
            title={"Export BA"}
        >
            <Modal.Body>
                
            </Modal.Body>

        </Modal>
    );
};

export default BaPage;
