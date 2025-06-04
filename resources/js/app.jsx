import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot, hydrateRoot } from "react-dom/client";
import { ToastProvider } from "@/Components/Toast/ToastProvider"; // <-- import your ToastProvider
import axios from "axios";
import { AuthProvider } from "./Components/Auth/AuthProvider";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";
axios.defaults.headers.common["X-CSRF-TOKEN"] = document.querySelector(
    'meta[name="csrf-token"]'
).content;
createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        if (import.meta.env.SSR) {
            hydrateRoot(
                el,
                <AuthProvider>
                    <ToastProvider>
                        <App {...props} />
                    </ToastProvider>
                </AuthProvider>
            );
            return;
        }

        createRoot(el).render(
            <AuthProvider>
                <ToastProvider>
                    <App {...props} />
                </ToastProvider>
            </AuthProvider>
        );
    },
    progress: {
        color: "#4B5563",
    },
});
