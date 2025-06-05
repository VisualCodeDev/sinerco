import { usePage, router } from "@inertiajs/react";

export function useAuth() {
    return usePage().props.auth;
}

export function AuthGuard({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return <div>Loading...</div>;
    }
    // if (!user) {
    //   router.visit('/login');
    //   return null;
    // }

    return children;
}
