
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  LockKeyhole,
  Mail,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      const loggedInUser = await login({
        email: email.trim(),
        password,
      });

      const role = loggedInUser.role?.toUpperCase();

      const dashboardRoutes = {
        ADMIN: "/admin",
        FACULTY: "/faculty",
        COORDINATOR: "/coordinator",
        CLUB_REP: "/club",
      };

      const destination = dashboardRoutes[role];

      if (!destination) {
        setError("Your account does not have a valid dashboard role.");
        return;
      }

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left section */}
      <div className="hidden lg:flex flex-col justify-between bg-indigo-700 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-3">
            <CalendarDays size={28} />
          </div>
          <span className="text-2xl font-bold">Campus Scheduler</span>
        </div>

        <div className="max-w-lg">
          <div className="mb-6 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm">
            Smart Campus Management
          </div>

          <h1 className="text-5xl font-bold leading-tight">
            Plan smarter.
            <br />
            Schedule better.
          </h1>

          <p className="mt-6 text-lg leading-8 text-indigo-100">
            Manage classrooms, faculty schedules, examinations and campus
            bookings through one intelligent platform.
          </p>
        </div>

        <p className="text-sm text-indigo-200">
          © 2026 Campus Scheduler. All rights reserved.
        </p>
      </div>

      {/* Right section */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 lg:mx-0">
              <GraduationCap size={30} />
            </div>

            <h2 className="text-3xl font-bold text-slate-900">
              Welcome back
            </h2>

            <p className="mt-2 text-slate-500">
              Sign in to access your campus workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email address
              </label>

              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-indigo-500">
                <Mail size={19} className="text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full border-0 bg-transparent px-3 py-3.5 outline-none"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4 focus-within:border-indigo-500">
                <LockKeyhole size={19} className="text-slate-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border-0 bg-transparent px-3 py-3.5 outline-none"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="text-xs font-semibold text-indigo-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Secure access for administrators, faculty, coordinators and club
            representatives.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
