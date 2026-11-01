import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";

const dashboardRoutes = {
    ADMIN: "/admin",
    FACULTY: "/faculty",
    COORDINATOR: "/coordinator",
    CLUB_REP: "/club",
};

function Login()
{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { login, loading } = useAuth();

    const handleSubmit = async (event) =>
    {
        event.preventDefault();
        setError("");

        try
        {
            const loggedInUser = await login({
                email: email.trim(),
                password,
            });
            const destination = dashboardRoutes[loggedInUser.role?.toUpperCase()];

            if (!destination)
            {
                setError("Your account does not have a valid dashboard role.");
                return;
            }

            navigate(destination, { replace: true });
        }
        catch (requestError)
        {
            setError(
                requestError.response?.data?.message ||
                requestError.message ||
                "Login failed. Please check your credentials."
            );
        }
    };

    return (
        <AuthLayout pageLabel="CAMPUS WORKSPACE">
            <div className="mb-7 mt-3">
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                    Welcome back
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Sign in to continue to your campus workspace.
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

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        htmlFor="login-email"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Email address
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                        <Mail size={18} className="shrink-0 text-slate-400" />
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@college.edu"
                            className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            autoComplete="email"
                            autoCapitalize="none"
                            required
                        />
                    </div>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label
                            htmlFor="login-password"
                            className="text-sm font-semibold text-slate-700"
                        >
                            Password
                        </label>
                    </div>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                        <LockKeyhole size={18} className="shrink-0 text-slate-400" />
                        <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((previous) => !previous)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Signing you in..." : "Sign in"}
                    {!loading && <ArrowRight size={17} />}
                </button>
            </form>

            <div className="my-7 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400">New to Campus Scheduler?</span>
                <span className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
                to="/register"
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
                Create a faculty account
            </Link>

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                Sign-in access for all four roles. Your dashboard is selected
                automatically from your account.
            </p>
        </AuthLayout>
    );
}

export default Login;
