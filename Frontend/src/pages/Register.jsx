import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Building2,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    UserRound,
} from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";

function Register()
{
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [departmentCode, setDepartmentCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { register, loading } = useAuth();

    const handleSubmit = async (event) =>
    {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword)
        {
            setError("Your passwords do not match.");
            return;
        }

        try
        {
            const user = await register({
                name: name.trim(),
                email: email.trim(),
                password,
                ...(departmentCode.trim()
                    ? { departmentCode: departmentCode.trim().toUpperCase() }
                    : {}),
            });

            if (user.role?.toUpperCase() !== "FACULTY")
            {
                throw new Error("The new account was not assigned a faculty role.");
            }

            navigate("/faculty", { replace: true });
        }
        catch (requestError)
        {
            setError(
                requestError.response?.data?.message ||
                requestError.message ||
                "Unable to create your account."
            );
        }
    };

    return (
        <AuthLayout pageLabel="JOIN THE CAMPUS WORKSPACE">
            <div className="mb-6 mt-3">
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                    Create your account
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Set up a faculty account to access your campus workspace.
                </p>
            </div>

            <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5">
                <p className="text-sm font-semibold text-indigo-950">
                    Faculty self-registration
                </p>
                <p className="mt-1 text-xs leading-5 text-indigo-800/80">
                    Administrator, coordinator and club representative accounts
                    are provided by your campus administrator.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="register-name"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                        Full name
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                        <UserRound size={18} className="shrink-0 text-slate-400" />
                        <input
                            id="register-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Your name"
                            minLength={2}
                            maxLength={100}
                            autoComplete="name"
                            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="register-email"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                        Campus email
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                        <Mail size={18} className="shrink-0 text-slate-400" />
                        <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@college.edu"
                            autoComplete="email"
                            autoCapitalize="none"
                            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="register-department"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                        Department <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                        <Building2 size={18} className="shrink-0 text-slate-400" />
                        <input
                            id="register-department"
                            type="text"
                            value={departmentCode}
                            onChange={(event) => setDepartmentCode(event.target.value)}
                            placeholder="e.g. CSE"
                            autoComplete="organization"
                            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="register-password"
                            className="mb-1.5 block text-sm font-semibold text-slate-700"
                        >
                            Password
                        </label>
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                            <LockKeyhole size={17} className="shrink-0 text-slate-400" />
                            <input
                                id="register-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="At least 8 characters"
                                minLength={8}
                                maxLength={72}
                                autoComplete="new-password"
                                className="min-w-0 flex-1 bg-transparent px-2.5 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="register-confirm-password"
                            className="mb-1.5 block text-sm font-semibold text-slate-700"
                        >
                            Confirm password
                        </label>
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                            <LockKeyhole size={17} className="shrink-0 text-slate-400" />
                            <input
                                id="register-confirm-password"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Repeat password"
                                minLength={8}
                                maxLength={72}
                                autoComplete="new-password"
                                className="min-w-0 flex-1 bg-transparent px-2.5 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((previous) => !previous)}
                                aria-label={showPassword ? "Hide passwords" : "Show passwords"}
                                className="rounded-md p-1 text-slate-400 hover:text-slate-700"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-xs leading-5 text-slate-500">
                    Use 8–72 characters. Your password is stored securely.
                </p>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Creating your account..." : "Create faculty account"}
                    {!loading && <ArrowRight size={17} />}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                    to="/login"
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
}

export default Register;
