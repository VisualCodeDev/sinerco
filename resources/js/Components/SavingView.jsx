import React from "react";

const SavingView = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-40 flex items-center justify-center pointer-events-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <span className="text-gray-800 font-medium text-lg animate-pulse">
                    Saving...
                </span>
            </div>
        </div>
    );
};

export default SavingView;
