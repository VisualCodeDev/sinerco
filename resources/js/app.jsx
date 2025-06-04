import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot, hydrateRoot } from "react-dom/client";
import { ToastProvider } from "@/Components/Toast/ToastProvider"; // <-- import your ToastProvider

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

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
