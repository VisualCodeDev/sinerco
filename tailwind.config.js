import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
                roboto: ["Roboto", "sans-serif"],
                lato: ["Lato", "sans-serif"],
                manrope: ["Manrope", "sans-serif"],
            },
            colors: {
                success: "#5cb85c",
                primary: "#273e8f",
                secondary: "#34b98c",
                warning: "#f0ad4e",
                danger: "#d9534f",
            },
            keyframes: {
                slideIn: {
                    "0%": { transform: "translateY(-100%)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
            animation: {
                slideIn: "slideIn 0.5s ease-in-out",
            },
        },
    },

    plugins: [forms],
};
