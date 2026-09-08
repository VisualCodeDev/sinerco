export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-gray-700 ` +
                className
            }
        >
            {/* pakai prop value jika ada, kalau tidak pakai children sebagai isi label */}
            {value ? value : children}
        </label>
    );
}
