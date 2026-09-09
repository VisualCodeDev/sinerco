import UnitTable from "@/Components/Dashboard/UnitTable";

// UnitTable sudah self-contained (fetch data sendiri saat tidak diberi props),
// dan sudah punya pola edit-inline "List of Unit" yang dijadikan acuan tab-tab lain di sini.
const UnitTab = () => <UnitTable />;

export default UnitTab;
