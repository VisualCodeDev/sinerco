export default function DangerButton({
    className = '', // class tambahan dari luar
    disabled, // status tombol dinonaktifkan
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                // tampilan merah untuk aksi berbahaya, opacity berkurang jika disabled
                `inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
