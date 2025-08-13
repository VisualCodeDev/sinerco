import { useState, useRef } from "react";

export default function MultiSelectDropdown({
    placeholder = "Select...",
    options,
    selected,
    setSelected,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [optionsState, setOptions] = useState(options);
    const dropdownRef = useRef();
    const toggleOption = (value) => {
        const isSelected = selected.includes(value);

        setSelected((prevSelected) =>
            isSelected
                ? prevSelected.filter((v) => v !== value)
                : [...prevSelected, value]
        );

        setOptions((prevOptions) => {
            const option = options.find((o) => o.value === value);
            if (isSelected) {
                const updated = [...prevOptions, option];
                return options.filter((o) =>
                    updated.some((u) => u.value === o.value)
                );
            } else {
                return prevOptions.filter((o) => o.value !== value);
            }
        });
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                className="border rounded w-full min-h-[48px] flex items-center flex-wrap gap-1 cursor-text bg-white px-3 py-2"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selected && selected?.length === 0 && (
                    <input
                        onClick={() => setIsOpen(true)}
                        className="text-gray-700 outline-none border-none ring-0 focus:outline-none focus:ring-0 flex-1"
                        placeholder={placeholder}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                    />
                )}

                {selected &&
                    selected.map((value) => {
                        const label = options.find(
                            (o) => o.value === value
                        )?.label;
                        if (label)
                        return (
                                <span
                                    key={value}
                                    className="bg-primary text-white text-sm px-3 py-1.5 rounded-full cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOption(value);
                                    }}
                                >
                                    {label} 🗙
                                </span>
                            );
                    })}

                {selected && selected?.length > 0 && (
                    <input
                        className="text-gray-700 outline-none border-none ring-0 focus:outline-none focus:ring-0 flex-1 px-3 py-2"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={() => setIsOpen(true)}
                    />
                )}
            </div>

            {isOpen && (
                <ul
                    className="absolute z-[100] mt-1 w-full border rounded bg-white shadow max-h-[200px] overflow-auto"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    {optionsState
                        .filter((opt) =>
                            opt.label
                                ?.toLowerCase()
                                ?.includes(searchTerm.toLowerCase())
                        )
                        .map((opt) => (
                            <li
                                key={opt.value}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                    selected?.includes(opt.value)
                                        ? "bg-blue-50"
                                        : ""
                                }`}
                                onClick={() => {
                                    toggleOption(opt.value);
                                    setSearchTerm("");
                                }}
                            >
                                {opt.label}
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
}
