import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    Eye,
    EyeOff,
    GraduationCap,
    LockKeyhole,
    Mail,
    Sparkles,
    UserRound,
    Users,
} from "lucide-react";

import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";

const ROLES = [
    {
        id: "FACULTY",
        label: "Faculty",
        description: "Teach classes and view schedule",
        icon: GraduationCap,
    },
    {
        id: "COORDINATOR",
        label: "Coordinator",
        description: "Department timetables & faculty",
        icon: Users,
    },
    {
        id: "CLUB_REP",
        label: "Club Rep",
        description: "Book venues for fest & club events",
        icon: Sparkles,
    },
];

const DEPARTMENTS = [
    { code: "CSE", name: "Computer Science and Engineering" },
    { code: "ECE", name: "Electronics and Communication" },
    { code: "ME", name: "Mechanical Engineering" },
    { code: "CE", name: "Civil Engineering" },
    { code: "EE", name: "Electrical Engineering" },
];

function Register()
{
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("FACULTY");
    const [departmentCode, setDepartmentCode] = useState("CSE");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const { register, loading } = useAuth();

    const handleSubmit = async (event) =>
    {
        event.preventDefault();
        setError("");

        if (password.length < 8)
        {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword)
        {
            setError("Your passwords do not match.");
            return;
        }

        try
        {
            await register({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                role,
                ...(( role === "FACULTY" || role === "COORDINATOR") && departmentCode
                    ? { departmentCode: departmentCode.toUpperCase() }
                    : {}),
            });

            setSuccess(true);

            // Redirect user to login with their registered email pre-filled!
            setTimeout(() =>
            {
                navigate("/login", {
                    replace: true,
                    state: {
                        email: email.trim().toLowerCase(),
                        message: "Account created successfully! Please sign in with your credentials.",
                    },
                });
            }, 1200);
        }
        catch (requestError)
        {
            setError(
                requestError.response?.data?.message ||
                requestError.message ||
                "Unable to create your account. Please try again."
            );
        }
    };

    return (
        <AuthLayout pageLabel="JOIN THE CAMPUS WORKSPACE">
            <div className="mb-6 mt-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                    Create your account
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Register to access your campus scheduling portal, courses, and venues.
                </p>
            </div>

            {success && (
                <div
                    role="status"
                    className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-semibold text-emerald-800"
                >
                    <CheckCircle2 size={19} className="shrink-0 text-emerald-600" />
                    <span>Registration successful! Redirecting to login...</span>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role selection */}
                <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Select Your Campus Role
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {ROLES.map((r) => {
                            const Icon = r.icon;
                            const isSelected = role === r.id;
                            return (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setRole(r.id)}
                                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                                        isSelected
                                            ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-sm"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                >
                                    <Icon size={18} className={isSelected ? "text-indigo-600" : "text-slate-400"} />
                                    <span className="mt-1 text-xs font-bold leading-tight">{r.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Full name */}
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
                            placeholder="e.g. Dr. Ramesh Kumar"
                            minLength={2}
                            maxLength={100}
                            autoComplete="name"
                            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            required
                        />
                    </div>
                </div>

                {/* Email address */}
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
                            placeholder="you@cit.edu"
                            autoComplete="email"
                            autoCapitalize="none"
                            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            required
                        />
                    </div>
                </div>

                {/* Department code (shown for Faculty and Coordinator) */}
                {(role === "FACULTY" || role === "COORDINATOR") && (
                    <div>
                        <label
                            htmlFor="register-department"
                            className="mb-1.5 block text-sm font-semibold text-slate-700"
                        >
                            Department
                        </label>
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                            <Building2 size={18} className="shrink-0 text-slate-400" />
                            <select
                                id="register-department"
                                value={departmentCode}
                                onChange={(event) => setDepartmentCode(event.target.value)}
                                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                            >
                                {DEPARTMENTS.map((dept) => (
                                    <option key={dept.code} value={dept.code}>
                                        {dept.code} — {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Password and confirm password */}
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
                                minLength={6}
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
                                minLength={6}
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

                <button
                    type="submit"
                    disabled={loading || success}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Creating your account..." : "Complete registration"}
                    {!loading && <ArrowRight size={17} />}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                Already registered?{" "}
                <Link
                    to="/login"
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                    Sign in to your account
                </Link>
            </p>
        </AuthLayout>
    );
}

export default Register;
