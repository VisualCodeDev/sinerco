export default function InputError({ message, className = '', ...props }) {
    // hanya tampilkan pesan error jika ada, jika tidak return null
    return message ? (
        <p
            {...props}
            className={'text-sm text-red-600 ' + className}
        >
            {message}
        </p>
    ) : null;
}
