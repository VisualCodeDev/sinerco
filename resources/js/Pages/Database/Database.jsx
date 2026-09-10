import PageLayout from "@/Layouts/PageLayout";
import { FaDatabase } from "react-icons/fa";
import useUrlTab from "@/Components/utils/useUrlTab";

import ClientsTab from "./ClientsTab";
import AreasTab from "./AreasTab";
import InputSettingsTab from "./InputSettingsTab";
import FieldsTab from "./FieldsTab";
import RolesTab from "./RolesTab";
import UnitTab from "./UnitTab";
import WorkshopsTab from "./WorkshopsTab";
import UnitPlacementTab from "./UnitPlacementTab";

const TABS = [
    { key: "areas", label: "Areas", Component: AreasTab },
    { key: "unit", label: "Unit", Component: UnitTab },
    { key: "clients", label: "Clients", Component: ClientsTab },
    { key: "workshops", label: "Workshops", Component: WorkshopsTab },
    { key: "placement", label: "Unit Placement", Component: UnitPlacementTab },
    {
        key: "inputSettings",
        label: "Input Settings",
        Component: InputSettingsTab,
    },
    { key: "fields", label: "Fields", Component: FieldsTab },
    { key: "roles", label: "Roles", Component: RolesTab },
];

const Database = () => {
    const [activeTab, setActiveTab] = useUrlTab(
        TABS.map((t) => t.key),
        TABS[0].key,
    );
    const ActiveComponent = TABS.find(
        (tab) => tab.key === activeTab,
    )?.Component;

    return (
        <PageLayout>
            <div className="pb-6">
                <div className="flex overflow-x-auto border-b border-gray-200 mb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2.5 whitespace-nowrap border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.key
                                    ? "border-primary text-primary"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {ActiveComponent && <ActiveComponent />}
            </div>
        </PageLayout>
    );
};

export default Database;
