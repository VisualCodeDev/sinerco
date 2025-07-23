import React from "react";

const LoadingSpinner = ({ text = "Loading..." }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-white bg-opacity-70 flex items-center justify-center">
            <div className="flex items-center gap-3">
                <svg
                    className="w-6 h-6 animate-spin-slow text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                    ></path>
                </svg>
                <span className="text-indigo-700 font-medium">{text}</span>
            </div>
        </div>
    );
};

export default LoadingSpinner;
