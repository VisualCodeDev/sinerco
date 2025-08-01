import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot, hydrateRoot } from "react-dom/client";
import { ToastProvider } from "@/Components/Toast/ToastProvider"; // <-- import your ToastProvider
import axios from "axios";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

if (csrfToken) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = csrfToken;
} else {
    console.error("CSRF token not found in meta tag.");
}

createInertiaApp({
    title: (title) => `${appName} ${title && `- ${title}`}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        if (import.meta.env.SSR) {
            hydrateRoot(
                el,
                <ToastProvider>
                    <App {...props} />
                </ToastProvider>
            );
            return;
        }

        createRoot(el).render(
            <ToastProvider>
                <App {...props} />
            </ToastProvider>
        );
    },
    progress: {
        color: "#4B5563",
    },
});
