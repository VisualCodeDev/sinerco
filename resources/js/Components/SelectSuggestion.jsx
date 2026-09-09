import { useState } from "react";

// Single-select dengan search, biar gak perlu scroll <select> panjang buat cari item.
// options: [{ value, label }], value: value yang lagi dipilih, onChange: (value) => void
const SelectSuggestion = ({
    name,
    options = [],
    value,
    onChange,
    placeholder,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    const filteredOptions = options.filter((opt) =>
        (opt.label || "")
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
    );

    return (
        <div className="relative w-full" onBlur={() => setIsOpen(false)}>
            <input
                className="text-gray-700 outline-none ring-0 focus:outline-none focus:ring-0 w-full border rounded-md border-gray-300 focus:border-primary focus:ring-primary px-3 py-2"
                type="text"
                placeholder={placeholder || `-- Select ${name || "item"} --`}
                onFocus={() => setIsOpen(true)}
                value={isOpen ? searchTerm : selectedOption?.label || ""}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                }}
            />
            {isOpen && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {selectedOption && (
                        <li
                            className="px-3 py-2 cursor-pointer text-gray-500 hover:bg-gray-100 border-b border-gray-100"
                            onMouseDown={(e) => {
                                // mousedown lebih dulu daripada blur, supaya klik tidak "hilang"
                                // saat input kehilangan fokus dan dropdown ke-unmount duluan
                                e.preventDefault();
                                onChange("");
                                setSearchTerm("");
                                setIsOpen(false);
                            }}
                        >
                            -- Clear --
                        </li>
                    )}
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <li
                                key={opt.value}
                                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                                    String(opt.value) === String(value)
                                        ? "bg-blue-50"
                                        : ""
                                }`}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    onChange(opt.value);
                                    setSearchTerm("");
                                    setIsOpen(false);
                                }}
                            >
                                {opt.label}
                            </li>
                        ))
                    ) : (
                        <li className="px-3 py-2 text-gray-400">
                            No match found.
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default SelectSuggestion;
