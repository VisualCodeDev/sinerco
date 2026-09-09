import { useState } from "react";
import InputValidationSetting from "@/Pages/Unit/InputValidationSetting";
import TableComponent from "@/Components/TableComponent";
import { fetch } from "@/Components/utils/database-util";
import LoadingSpinner from "@/Components/Loading";

// Timezone/input interval/duration/summary interval pindah ke tab Clients
// (itu kolom di tabel `clients` sendiri, bukan bagian dari field validation
// settings). Tab ini cuma perlu: pilih client(s), lalu atur decimal/min-max/
// unit/performance rule-nya lewat InputValidationSetting di bawah.
const InputSettingsTab = () => {
    const { data: clientData, loading } = fetch("client.get");
    const [selectedRows, setSelectedRows] = useState([]);

    const handleSelectAll = (currData) => {
        const currentIds = currData.map((item) => item.client_id.toString());
        const isAllSelected = currentIds.every((id) =>
            selectedRows.includes(id),
        );
        if (isAllSelected) {
            setSelectedRows((prev) =>
                prev.filter((id) => !currentIds.includes(id)),
            );
        } else {
            setSelectedRows((prev) => {
                const updated = [...prev];
                currentIds.forEach((id) => {
                    if (!updated.includes(id)) updated.push(id);
                });
                return updated;
            });
        }
    };

    const handleCheckItem = (client_id) => {
        const stringId = client_id.toString();
        setSelectedRows((prev) =>
            prev.includes(stringId)
                ? prev.filter((id) => id !== stringId)
                : [...prev, stringId],
        );
    };

    const columns = [
        {
            name: "no",
            header: "No.",
            headerClassName: "bg-primary text-white text-center",
            cellClassName: "text-center",
            width: "10%",
            Cell: ({ index }) => index + 1,
        },
        {
            name: "name",
            header: "Client",
            headerClassName: "bg-primary text-white",
            width: "70%",
            Cell: ({ name }) => name,
        },
        {
            name: "checkbox",
            Header: (data) => (
                <div
                    className="text-center w-full cursor-pointer"
                    onClick={() => handleSelectAll(data)}
                >
                    Select All
                </div>
            ),
            headerClassName: "bg-primary text-white text-center justify-center",
            cellClassName: "text-center",
            width: "20%",
            Cell: ({ client_id }) => (
                <div className="flex justify-center">
                    <input
                        type="checkbox"
                        className="w-5 h-5 rounded-sm"
                        checked={selectedRows.includes(client_id.toString())}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleCheckItem(client_id);
                        }}
                    />
                </div>
            ),
        },
    ];

    const selectedClientNames = (clientData || [])
        .filter((item) => selectedRows.includes(item.client_id.toString()))
        .map((item) => item.name);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col gap-6">
            <TableComponent
                title="Select Client(s)"
                subtitle="Field validation settings apply to the selected client(s)"
                height="40vh"
                columns={columns}
                data={clientData}
            />

            <InputValidationSetting
                selectedClients={selectedRows}
                selectedClientNames={selectedClientNames}
            />
        </div>
    );
};

export default InputSettingsTab;
