import Checkbox from "@/Components/Checkbox";
import { getUnitBA, updateClientData } from "@/Components/db";
import LoadingSpinner from "@/Components/Loading";
import Modal from "@/Components/Modal";
import TableComponent from "@/Components/TableComponent";
import { useToast } from "@/Components/Toast/ToastProvider";
import columns from "@/Components/utils/BA/column";
import { fetch as useFetchData } from "@/Components/utils/database-util";
import PageLayout from "@/Layouts/PageLayout";
import React, { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";

const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

const INVOICE_TEMPLATE_OPTIONS = [
    { value: "1", label: "Template 1" },
    { value: "2", label: "Template 2" },
    { value: "3", label: "Template 3 (CLU - Yearly)" },
    { value: "4", label: "Template 4" },
];

const BA_TEMPLATE_OPTIONS = [
    { value: "1", label: "Template 1 (Avg Flow + avail + Sign)" },
    { value: "2", label: "Template 2 (Avg Flow + avail)" },
    { value: "3", label: "Template 3 (Location + Sign)" },
    { value: "4", label: "Template 4 (Location + Engine S/N)" },
    { value: "5", label: "Template 5 (Location + Table Sign)" },
];

const TABS = [
    { key: "invoice", label: "Invoice" },
    { key: "penalty", label: "Penalty" },
    { key: "ba", label: "Berita Acara" },
    { key: "settings", label: "Settings" },
];

const BaPage = () => {
    const [activeTab, setActiveTab] = useState("invoice");
    const { addToast } = useToast();

    return (
        <PageLayout>
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 bg-white transition-all ${
                            activeTab === tab.key
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-primary"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "invoice" && (
                <ClientExportTab
                    addToast={addToast}
                    exportRoute="export_inv"
                    label="Invoice"
                    showTemplateColumn={true}
                />
            )}
            {activeTab === "penalty" && (
                <ClientExportTab
                    addToast={addToast}
                    exportRoute="export_penalty"
                    label="Penalty"
                    showTemplateColumn={false}
                />
            )}
            {activeTab === "ba" && <BeritaAcaraTab addToast={addToast} />}
            {activeTab === "settings" && <SettingsTab addToast={addToast} />}
        </PageLayout>
    );
};

const ClientExportTab = ({ addToast, exportRoute, label, showTemplateColumn }) => {
    const { data: clientsData, loading } = useFetchData("client.get");
    const [clients, setClients] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isMonthModal, setMonthModal] = useState(false);

    useEffect(() => {
        setClients(
            Array.isArray(clientsData)
                ? clientsData.filter((item) => Boolean(item?.is_invoice))
                : [],
        );
    }, [clientsData]);

    const handleCheckItem = (item) => {
        const id = item?.client_id;
        setSelectedRows((prev) =>
            prev.includes(id)
                ? prev.filter((row) => row !== id)
                : [...prev, id],
        );
    };

    const handleSelectAll = (currData) => {
        if (selectedRows.length === currData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(currData.map((item) => item.client_id));
        }
    };

    const handleExport = (month = null) => {
        if (selectedRows.length === 0) {
            return addToast({ type: "error", text: "No client selected" });
        }
        window.open(
            route(exportRoute, {
                start_date: month || null,
                clients: selectedRows,
            }),
            "_blank",
        );
        setMonthModal(false);
    };

    const exportColumns = [
        {
            name: "no",
            header: "No",
            headerClassName: "text-center bg-primary text-white justify-center",
            cellClassName: "text-center",
            width: "5%",
            Cell: ({ index }) => <div>{index + 1}</div>,
        },
        {
            name: "name",
            header: "Client",
            headerClassName: "bg-primary text-white",
            sortable: true,
            Cell: ({ name }) => <div className="font-medium">{name}</div>,
        },
        ...(showTemplateColumn
            ? [
                  {
                      name: "template_inv",
                      header: "Template",
                      headerClassName: "text-center justify-center bg-primary text-white",
                      cellClassName: "text-center",
                      Cell: ({ template_inv }) => {
                          const option = INVOICE_TEMPLATE_OPTIONS.find(
                              (opt) => opt.value === String(template_inv ?? "1"),
                          );
                          return (
                              <div>{option?.label || `Template ${template_inv}`}</div>
                          );
                      },
                  },
              ]
            : []),
        {
            name: "checkbox",
            Header: (data) => (
                <div className="text-center" onClick={() => handleSelectAll(data)}>
                    Select All
                </div>
            ),
            headerClassName: "bg-primary text-white text-center justify-center",
            cellClassName: "text-center",
            width: "10%",
            Cell: ({ client_id }) => (
                <input
                    type="checkbox"
                    checked={selectedRows.includes(client_id)}
                    onChange={(e) => e.stopPropagation()}
                />
            ),
        },
    ];

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="">
            <TableComponent
                title={label}
                subtitle="Select clients to export"
                columns={exportColumns}
                data={clients}
                onRowClick={handleCheckItem}
            />
            <div className="flex justify-end mt-4">
                <button className="button-submit" onClick={() => setMonthModal(true)}>
                    Export {label}
                </button>
            </div>
            {isMonthModal && (
                <MonthExportModal
                    title={`Export ${label}`}
                    handleCloseModal={() => setMonthModal(false)}
                    handleExport={handleExport}
                />
            )}
        </div>
    );
};

const MonthExportModal = ({ title, handleCloseModal, handleExport }) => {
    const [selectedMonth, setSelectedMonth] = useState("");
    const handleSubmit = () => {
        handleExport(selectedMonth ? `${selectedMonth}-01` : null);
    };
    return (
        <>
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
                onClick={handleCloseModal}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-lg z-[1000] max-h-[85vh] overflow-y-auto">
                <div className="bg-primary text-white sticky top-0 left-0 text-center py-4 w-full z-[100] font-bold rounded-t-xl">
                    {title}
                    <div
                        className="font-light absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={handleCloseModal}
                    >
                        <MdClose />
                    </div>
                </div>
                <div className="bg-white p-6 flex flex-col gap-4">
                    <label className="text-sm font-medium">Select Month</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border rounded-lg px-3 py-2"
                    />
                    <button
                        onClick={handleSubmit}
                        className="border border-transparent bg-primary text-white rounded-lg py-2 mt-2"
                    >
                        Export
                    </button>
                </div>
            </div>
        </>
    );
};

const SettingsTab = ({ addToast }) => {
    const { data: clientsData, loading } = useFetchData("client.get");
    const [clients, setClients] = useState([]);

    useEffect(() => {
        setClients(Array.isArray(clientsData) ? clientsData : []);
    }, [clientsData]);

    const handleTemplateChange = async (client_id, field, value) => {
        try {
            const resp = await updateClientData(client_id, [{ [field]: value }]);
            if (resp?.response === "success") {
                setClients((prev) =>
                    prev.map((item) =>
                        item.client_id === client_id
                            ? { ...item, [field]: value }
                            : item,
                    ),
                );
                addToast({ type: "success", text: "Template updated" });
            } else {
                addToast({ type: "error", text: "Failed to update template" });
            }
        } catch (err) {
            console.error(err);
            addToast({ type: "error", text: "Failed to update template" });
        }
    };

    const settingsColumns = [
        {
            name: "no",
            header: "No",
            headerClassName: "text-center bg-primary text-white",
            cellClassName: "text-center",
            width: "5%",
            Cell: ({ index }) => <div>{index + 1}</div>,
        },
        {
            name: "name",
            header: "Client",
            headerClassName: "bg-primary text-white",
            sortable: true,
            Cell: ({ name }) => <div className="font-medium">{name}</div>,
        },
        {
            name: "template_inv",
            header: "Invoice Template",
            headerClassName: "bg-primary text-white",
            width: "30%",
            Cell: ({ client_id, template_inv }) => (
                <select
                    value={String(template_inv ?? "1")}
                    onChange={(e) =>
                        handleTemplateChange(client_id, "template_inv", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                    {INVOICE_TEMPLATE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ),
        },
        {
            name: "template_ba",
            header: "Berita Acara Template",
            headerClassName: "bg-primary text-white",
            width: "35%",
            Cell: ({ client_id, template_ba }) => (
                <select
                    value={String(template_ba ?? "1")}
                    onChange={(e) =>
                        handleTemplateChange(client_id, "template_ba", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                    {BA_TEMPLATE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ),
        },
    ];

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <TableComponent
            title="Template Settings"
            subtitle="Default invoice & Berita Acara template per client"
            columns={settingsColumns}
            data={clients}
        />
    );
};

const BeritaAcaraTab = ({ addToast }) => {
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
                (item) => String(item?.unit_position_id) === String(lastId),
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
                    String(item.unit_position_id),
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
                    (item) => String(item) !== String(value.unit_position_id),
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
        <>
            <TableComponent
                handleSubmit={handleClick}
                isBA={true}
                onRowClick={handleSelect}
                title={"Berita Acara"}
                subtitle={"Settings"}
                data={data}
                columns={tColumns}
            />

            <BaSettingModal
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

            <BaExportModal
                isModal={exportModal}
                addToast={addToast}
                selectedUnits={formData.selectedRows}
                handleClose={() => setExportModal(false)}
            />
        </>
    );
};

const BaSettingModal = (props) => {
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
                                                    e.target.value,
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

const BaExportModal = (props) => {
    const { selectedUnits, isModal, handleClose, addToast } = props;

    const [data, setData] = useState({
        ba_req: false,
        bapm: false,
        bap: false,
        month: new Date().getMonth() + 1,
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
                        <div className="w-full max-w-xs ">
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                                Choose Month
                            </label>
                            <select
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
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
                                <option value="" disabled>
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
