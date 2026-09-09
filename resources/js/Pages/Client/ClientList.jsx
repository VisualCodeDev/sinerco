import { deleteClient, getFields, updateClientData } from "@/Components/db";
import LoadingSpinner from "@/Components/Loading";
import Modal from "@/Components/Modal";
import TableComponent from "@/Components/TableComponent";
import { useToast } from "@/Components/Toast/ToastProvider";
import {
    formItems,
    getRequestTypeName,
} from "@/Components/utils/dashboard-util";
import { fetch } from "@/Components/utils/database-util";
import tColumns from "@/Components/utils/User/columns";
import PageLayout from "@/Layouts/PageLayout";
import { router } from "@inertiajs/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    FaAngleDown,
    FaCog,
    FaFileContract,
    FaList,
    FaUserFriends,
} from "react-icons/fa";
import InputValidationSetting from "../Unit/InputValidationSetting";
import columns from "@/Components/utils/Client/columns";

const ClientList = () => {
    // const columns = tColumns();
    const { data: initData, loading, error } = fetch("client.get");
    const [data, setData] = useState(initData);
    const [expanded, setExpanded] = useState(false);
    const [selectedClient, setSelectedClients] = useState(null);
    const [filteredArea, setArea] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState();
    const [isLoading, setLoading] = useState(false);
    // const dailyReportSettingData = unitData?.daily_report_setting || {};
    const [isSettingModal, setSettingModal] = useState(false);
    const [isEditModal, setEditModal] = useState(false);
    const [isDeleteModal, setDeleteModal] = useState(false);
    const [isAddModal, setAddModal] = useState(false);
    const [actionClient, setActionClient] = useState(null);
    const { addToast } = useToast();

    // useEffect(() => {
    //     const fetchUnits = async () => {
    //         setLoading(true);
    //         if (selectedClient) {
    //             try {
    //                 const response = await axios.get(
    //                     route("unit.filter.get", selectedClient),
    //                 );
    //                 const data = response.data;

    //                 const areaMap = new Map();

    //                 for (const item of data) {
    //                     const area = item.location.area;
    //                     const location = item.location;
    //                     const unit = {
    //                         ...item.unit,
    //                         unitAreaLocationId: item.unitAreaLocationId,
    //                     };

    //                     if (!areaMap.has(area.id)) {
    //                         areaMap.set(area.id, {
    //                             ...area,
    //                             locations: new Map(),
    //                         });
    //                     }

    //                     const currentArea = areaMap.get(area.id);

    //                     if (!currentArea.locations.has(location.id)) {
    //                         currentArea.locations.set(location.id, {
    //                             ...location,
    //                             units: [],
    //                         });
    //                     }

    //                     currentArea.locations.get(location.id).units.push(unit);
    //                 }

    //                 const groupedAreas = Array.from(areaMap.values()).map(
    //                     (areaObj) => ({
    //                         ...areaObj,
    //                         locations: Array.from(areaObj.locations.values()),
    //                         isExpanded: false,
    //                     }),
    //                 );

    //                 setArea(groupedAreas);
    //             } catch (err) {
    //                 console.error("Error fetching unit:", err);
    //             } finally {
    //                 setLoading(false);
    //             }
    //         }
    //         setLoading(false);
    //     };

    //     fetchUnits();
    // }, [data, selectedClient]);
    useEffect(() => {
        setData(initData);
    }, [initData]);

    if (loading) {
        return <LoadingSpinner />;
    }
    const handleToggleInvoice = async (id, is_invoice) => {
        if (!id) return;
        try {
            const updateData = [{ is_invoice: !is_invoice }];
            console.log(updateData);
            const resp = await updateClientData(id, updateData);
            if (resp.response === "success") {
                const newTabData = data.map((item) =>
                    item?.client_id === id
                        ? {
                              ...item,
                              is_invoice: !is_invoice,
                          }
                        : item,
                );
                setData(newTabData);
                addToast({
                    type: "success",
                    text: "Data Updated",
                });
            }
        } catch (err) {
            addToast({
                type: "error",
                text: err?.response?.data?.message || "Error updating data",
            });
        }
    };
    const handleClick = (item) => {
        if (!item.unitAreaLocationId) return;
        router.visit(route("daily", item.unitAreaLocationId));
    };

    const handleExpandArea = (item) => {
        setArea((prevAreas) =>
            prevAreas.map((area) =>
                area.id === item.id
                    ? { ...area, isExpanded: !area.isExpanded }
                    : area,
            ),
        );
    };

    const handleOpenSetting = (value) => {
        setSelectedClients(value);
        setSettingModal(true);
    };

    const handleOpenEdit = (value) => {
        setActionClient(value);
        setEditModal(true);
    };

    const handleOpenDelete = (value) => {
        setActionClient(value);
        setDeleteModal(true);
    };

    const handleClientRenamed = (client_id, name) => {
        setData((prev) =>
            prev.map((item) =>
                item.client_id === client_id ? { ...item, name } : item,
            ),
        );
    };

    const handleClientDeleted = (client_id) => {
        setData((prev) => prev.filter((item) => item.client_id !== client_id));
    };

    const handleClientAdded = (client) => {
        setData((prev) => [...(prev || []), client]);
    };

    const col = columns({
        handleOpenSetting,
        handleToggleInvoice,
        handleOpenEdit,
        handleOpenDelete,
    });

    return (
        <PageLayout>
            {/* {Array.isArray(selectedRows) && selectedRows.length > 0 && (
                <div className="fixed bottom-0 left-0 w-[100%] p-6 z-[100]">
                    <div className="bg-primary rounded-xl p-2">
                        <button>Invoice</button>
                    </div>
                </div>
            )} */}
            <div className="flex justify-end mb-4">
                <button
                    className="flex justify-center items-center gap-2 border border-transparent bg-primary text-white px-5 py-2 rounded-md hover:bg-white hover:border-primary hover:border-2 hover:text-primary transition-all"
                    onClick={() => setAddModal(true)}
                >
                    + Add Client
                </button>
            </div>
            <TableComponent title="Clients" columns={col} data={data} />
          
            {isSettingModal && (
                <SettingModal
                    // data={data?.filter()}
                    clientData={selectedClient}
                    handleCloseModal={() => setSettingModal(false)}
                    // handleConfirmSettings={handleConfirmSettings}
                />
            )}
            <EditClientModal
                isModal={isEditModal}
                handleCloseModal={() => setEditModal(false)}
                client={actionClient}
                addToast={addToast}
                onRenamed={handleClientRenamed}
            />
            <DeleteClientModal
                isModal={isDeleteModal}
                handleCloseModal={() => setDeleteModal(false)}
                client={actionClient}
                addToast={addToast}
                onDeleted={handleClientDeleted}
            />
            <AddClientModal
                isModal={isAddModal}
                handleCloseModal={() => setAddModal(false)}
                addToast={addToast}
                onAdded={handleClientAdded}
            />
        </PageLayout>
    );
};

const AddClientModal = ({ isModal, handleCloseModal, addToast, onAdded }) => {
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isModal) setName("");
    }, [isModal]);

    const handleSave = async () => {
        if (!name.trim()) {
            return addToast({ type: "error", text: "Name cannot be empty" });
        }
        setSaving(true);
        try {
            const resp = await axios.post(route("client.store"), {
                name: name.trim(),
            });
            if (resp?.data?.type === "success") {
                onAdded(resp.data.data);
                addToast(resp.data);
                handleCloseModal();
            } else {
                addToast({ type: "error", text: "Failed to add client" });
            }
        } catch (err) {
            console.error(err);
            addToast({
                type: "error",
                text: err?.response?.data?.message || "Failed to add client",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            showModal={isModal}
            handleCloseModal={handleCloseModal}
            title="Add Client"
            size="sm"
        >
            <Modal.Body>
                <label className="form-label" htmlFor="client-name-add">Client Name</label>
                <input
                    id="client-name-add"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-base"
                />
            </Modal.Body>
            <Modal.Footer>
                <div className="flex justify-end">
                    <button
                        className="button-submit"
                        disabled={saving}
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

const EditClientModal = ({
    isModal,
    handleCloseModal,
    client,
    addToast,
    onRenamed,
}) => {
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setName(client?.name || "");
    }, [client]);

    const handleSave = async () => {
        if (!name.trim()) {
            return addToast({ type: "error", text: "Name cannot be empty" });
        }
        setSaving(true);
        try {
            const resp = await updateClientData(client?.client_id, [
                { name: name.trim() },
            ]);
            if (resp?.response === "success") {
                onRenamed(client?.client_id, name.trim());
                addToast({ type: "success", text: "Client updated" });
                handleCloseModal();
            } else {
                addToast({ type: "error", text: "Failed to update client" });
            }
        } catch (err) {
            console.error(err);
            addToast({ type: "error", text: "Failed to update client" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            showModal={isModal}
            handleCloseModal={handleCloseModal}
            title="Edit Client"
            size="sm"
        >
            <Modal.Body>
                <label className="form-label" htmlFor="client-name-edit">Client Name</label>
                <input
                    id="client-name-edit"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-base"
                />
            </Modal.Body>
            <Modal.Footer>
                <div className="flex justify-end">
                    <button
                        className="button-submit"
                        disabled={saving}
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

const DeleteClientModal = ({
    isModal,
    handleCloseModal,
    client,
    addToast,
    onDeleted,
}) => {
    const [confirmText, setConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setConfirmText("");
    }, [client, isModal]);

    const isConfirmed = confirmText === client?.name;

    const handleDelete = async () => {
        if (!isConfirmed) return;
        setDeleting(true);
        try {
            const resp = await deleteClient(client?.client_id);
            if (resp?.type === "success") {
                onDeleted(client?.client_id);
                addToast(resp);
                handleCloseModal();
            } else {
                addToast({
                    type: "error",
                    text: resp?.text || "Failed to delete client",
                });
            }
        } catch (err) {
            console.error(err);
            addToast({ type: "error", text: "Failed to delete client" });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Modal
            showModal={isModal}
            handleCloseModal={handleCloseModal}
            title="Delete Client"
            size="sm"
        >
            <Modal.Body>
                <p className="mb-3">
                    This will remove{" "}
                    <span className="font-semibold">{client?.name}</span> from
                    every list. Type the client name below to confirm.
                </p>
                <label className="form-label" htmlFor="client-delete-confirm">
                    Confirm client name
                </label>
                <input
                    id="client-delete-confirm"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={client?.name}
                    className="input-base"
                />
            </Modal.Body>
            <Modal.Footer>
                <div className="flex justify-end">
                    <button
                        className="border border-transparent bg-danger text-white px-4 py-2 rounded-md disabled:opacity-40 disabled:pointer-events-none"
                        disabled={!isConfirmed || deleting}
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

const SettingModal = (props) => {
    const { clientData, handleCloseModal } = props;
    const [loading, setLoading] = useState({});
    const [settingData, setSettingData] = useState({});
    const [saving, setSaving] = useState(false);
    const [fields, setFields] = useState([]);

    useEffect(() => {
        if (!clientData?.client_id) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const resp = await axios.get(
                    route("unit.setting.get", clientData?.client_id),
                );
                setSettingData(resp.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clientData]);

    useEffect(() => {
        const fetchFields = async () => {
            const data = await getFields();
            setFields(data);
        };
        fetchFields();
    }, []);

    return (
        <Modal
            showModal
            handleCloseModal={handleCloseModal}
            title={clientData?.name}
            size="xl"
        >
            <Modal.Body>
                {loading && <LoadingSpinner />}
                <InputValidationSetting
                    data={settingData}
                    clientData={clientData}
                    selectedClients={[clientData?.client_id]}
                />
            </Modal.Body>
        </Modal>
    );
};

export default ClientList;
