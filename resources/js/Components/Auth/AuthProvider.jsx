import { usePage } from "@inertiajs/react";

export function useAuth() {
    return usePage().props.auth;
}
