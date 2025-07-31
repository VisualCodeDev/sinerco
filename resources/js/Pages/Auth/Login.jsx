import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
            onSuccess: async () => {
                await axios.get("/sanctum/csrf-cookie");
                window.location.href = route("dashboard");
            },
        });
    };

    return (
        <div className="flex justify-center items-end md:items-center h-screen w-full bg-gradient-to-tr from-primary/75 to-secondary/75">
            <div className="hidden md:block bg-primary shadow-lg shadow-primary/70 w-1/4 h-1/2 p-10 -mr-10 z-20">
                <img
                    className="w-14 h-14 mb-4"
                    src="./logo_white.webp"
                    alt="Logo Sinerco"
                />
                <p className="mb-4 text-4xl text-white font-black">
                    The Future of{" "}
                    <span className="font-thin italic">Cleaner Energy</span>{" "}
                    Starts Here
                </p>
                <p className="text-gray-300 text-xs">
                    PT SINERCO, we help the oil and gas industry reduce
                    emissions, improve efficiency, and support Zero Routine
                    Flaring 2030
                </p>
            </div>
            <div className="bg-white w-full md:w-fit rounded-tr-3xl rounded-tl-3xl md:rounded-none shadow-lg shadow-primary/70 p-10 md:p-20 z-10">
                <img
                    className="block md:hidden w-10 h-10 mb-4"
                    src="./logo_sinerco.webp"
                    alt="Logo Sinerco"
                />
                <p className="text-2xl md:text-4xl pb-1 md:pb-2 font-bold text-primary">
                    Admin Login!
                </p>
                <p className="text-sm md:text-base text-gray-600 pb-5">
                    Welcome back, please log in to your account.
                </p>
                <form onSubmit={submit}>
                    <div>
                        <InputLabel htmlFor="email" value="Email" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData("email", e.target.value)}
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Password" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-4 block">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData("remember", e.target.checked)
                                }
                            />
                            <span className="ms-2 text-sm text-gray-600">
                                Remember me
                            </span>
                        </label>
                    </div>

                    <div className="mt-4 flex items-center justify-center">
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-4 p-2 w-full text-white font-semibold bg-gradient-to-r from-primary to-secondary shadow-md hover:from-primary/85 hover:to-secondary/85 hover:inset-shadow-sm"
                        >
                            LOGIN
                        </button>
                    </div>

                    <div className="mt-4 flex items-center justify-center">
                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                Forgot your password?
                            </Link>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
