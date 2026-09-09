import { useEffect, useState } from "react";
import LoadingSpinner from "@/Components/Loading";

// Read-only: nama role dipakai hardcode di banyak tempat (middleware roles:xxx,
// dan cek user?.role === "..." di puluhan file frontend). Rename/hapus di sini
// bisa diam-diam merusak seluruh sistem permission, jadi sengaja tidak dibuat editable.
const RolesTab = () => {
    const [roles, setRoles] = useState(null);

    useEffect(() => {
        const fetchRoles = async () => {
            const resp = await axios.get(route("roles.get"));
            setRoles(resp.data || []);
        };
        fetchRoles();
    }, []);

    if (!roles) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-white flex-col rounded-lg border shadow-lg">
            <div className="flex flex-col md:flex-row justify-between px-6 py-6 border-b">
                <div>
                    <p className="font-semibold text-base md:text-2xl">
                        Roles
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                        Read-only -- nama role dipakai hardcode di middleware &
                        logic permission, tidak aman untuk diedit dari sini.
                    </p>
                </div>
            </div>

            <div className="overflow-y-auto w-full overflow-x-auto p-6 max-h-[60vh]">
                <table className="w-full border-collapse [&_th]:border [&_th]:border-[#3a56b0] [&_td]:border [&_td]:border-gray-200">
                    <thead className="text-white">
                        <tr>
                            <th className="bg-primary font-semibold text-left px-6 py-4 rounded-tl-lg">
                                ID
                            </th>
                            <th className="bg-primary font-semibold text-left px-6 py-4 rounded-tr-lg">
                                Name
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.length > 0 ? (
                            roles.map((role) => (
                                <tr
                                    key={role.id}
                                    className="border-b border-[#E4E7EC] bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors"
                                >
                                    <td className="px-6 py-4 text-[#101828]">
                                        {role.id}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-[#101828]">
                                        {role.name}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={2}
                                    className="px-6 py-6 text-center text-gray-400"
                                >
                                    No roles found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RolesTab;
