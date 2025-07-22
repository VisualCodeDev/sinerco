import { usePage, router } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import LoadingSpinner from "../Loading";

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchUser = async () => {
            try {
                const res = await axios.get(route("auth.get"));
                if (isMounted) {
                    setUser(res.data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUser();

        return () => {
            isMounted = false;
        };
    }, []);
    return { user, loading, error };
};

export function AuthGuard({ children }) {
    // if (!user) {
    //   router.visit('/login');
    //   return null;
    // }
    return children;
}
