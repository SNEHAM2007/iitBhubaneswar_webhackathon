import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    RefreshCw,
    Sparkles,
    Users,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getDashboardOverview } from "../../services/dashboard";

const roleContent = {
    ADMIN: {
        eyebrow: "ADMIN / OVERVIEW",
        title: "Your campus, at a glance",
        description: "See schedules, people, rooms and booking requests across campus.",
        action: "Generate timetable",
        actionPath: "/timetable",
        scheduleTitle: "Upcoming campus schedule",
        bookingTitle: "Latest booking requests",
    },
    COORDINATOR: {
        eyebrow: "COORDINATOR / OVERVIEW",
        title: "Your department, in sync",
        description: "Coordinate department schedules, faculty and booking requests.",
        action: "View timetable",
        actionPath: "/timetable",
        scheduleTitle: "Department schedule",
        bookingTitle: "Department requests",
    },
    FACULTY: {
        eyebrow: "FACULTY / OVERVIEW",
        title: "Your teaching day, at a glance",
        description: "Keep track of your classes and the requests you have submitted.",
        action: "View my timetable",
        actionPath: "/timetable",
        scheduleTitle: "My teaching schedule",
        bookingTitle: "My recent requests",
    },
    CLUB_REP: {
        eyebrow: "CLUB REPRESENTATIVE / OVERVIEW",
        title: "Your club activity, in sync",
        description: "Track room requests and plan your upcoming campus activities.",
        action: "Create a booking",
        actionPath: "/bookings",
        scheduleTitle: "Campus schedule",
        bookingTitle: "My recent requests",
    },
};

const statIcons = [CalendarDays, Clock3, Building2, Users];
const statColors = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
};

function formatDate(value)
{
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

function DashboardHome()
{
    const { user } = useAuth();
    const role = user?.role?.toUpperCase();
    const content = roleContent[role] || roleContent.FACULTY;
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshVersion, setRefreshVersion] = useState(0);

    useEffect(() =>
    {
        let isActive = true;

        getDashboardOverview()
            .then((response) =>
            {
                if (!response?.success || !response.data)
                {
                    throw new Error(
                        response?.message || "The server returned an invalid dashboard response."
                    );
                }

                if (isActive)
                {
                    setDashboard(response.data);
                    setError("");
                }
            })
            .catch((requestError) =>
            {
                if (isActive)
                {
                    setError(
                        requestError.response?.data?.message ||
                        requestError.message ||
                        "Unable to load dashboard data."
                    );
                }
            })
            .finally(() =>
            {
                if (isActive) setLoading(false);
            });

        return () =>
        {
            isActive = false;
        };
    }, [refreshVersion]);

    const loadDashboard = () =>
    {
        setError("");
        setLoading(true);
        setRefreshVersion((version) => version + 1);
    };

    const upcomingSessions = useMemo(
        () => dashboard?.sessions || [],
        [dashboard]
    );
    const bookings = dashboard?.bookings || [];

    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">
                        {content.eyebrow}
                    </p>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                        {content.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                        {content.description}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={loadDashboard}
                        disabled={loading}
                        aria-label="Refresh dashboard data"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                    <Link
                        to={content.actionPath}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        {role === "ADMIN" || role === "CLUB_REP"
                            ? <Sparkles size={16} />
                            : <ArrowRight size={16} />}
                        {content.action}
                    </Link>
                </div>
            </div>

            {error && (
                <div
                    role="alert"
                    className="flex flex-col justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center"
                >
                    <div>
                        <p className="text-sm font-semibold text-red-800">
                            Dashboard data is unavailable
                        </p>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={loadDashboard}
                        className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                        Try again
                    </button>
                </div>
            )}

            {role === "FACULTY" &&
                dashboard?.user?.facultyLinked === false && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        Your account is not linked to a faculty profile yet. Ask an
                        administrator to link it to see your assigned classes.
                    </div>
                )}

            <section
                aria-label="Dashboard statistics"
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                {(dashboard?.stats || []).map((stat, index) =>
                {
                    const Icon = statIcons[index % statIcons.length];

                    return (
                        <article
                            key={stat.label}
                            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-500">
                                        {stat.label}
                                    </p>
                                    <p className="mt-3 truncate text-3xl font-bold tracking-tight text-slate-950">
                                        {loading && !dashboard
                                            ? <span className="inline-block h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
                                            : stat.value}
                                    </p>
                                </div>
                                <span
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                        statColors[stat.tone] || statColors.indigo
                                    }`}
                                >
                                    <Icon size={20} />
                                </span>
                            </div>
                            <p className="mt-4 text-xs leading-5 text-slate-500">
                                {stat.note}
                            </p>
                        </article>
                    );
                })}
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
                <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                {content.scheduleTitle}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                {dashboard?.scheduleName
                                    ? `${dashboard.scheduleName}${
                                          dashboard.generatedAt
                                              ? ` · Updated ${formatDate(dashboard.generatedAt)}`
                                              : ""
                                      }`
                                    : "Published timetable"}
                            </p>
                        </div>
                        <CalendarDays size={18} className="text-indigo-500" />
                    </div>

                    {loading && !dashboard ? (
                        <div className="space-y-4 p-6">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="flex gap-4">
                                    <span className="h-10 w-14 animate-pulse rounded-lg bg-slate-100" />
                                    <span className="h-10 flex-1 animate-pulse rounded-lg bg-slate-100" />
                                </div>
                            ))}
                        </div>
                    ) : upcomingSessions.length ? (
                        <div className="divide-y divide-slate-100">
                            {upcomingSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50/80 sm:gap-4 sm:px-6"
                                >
                                    <div className="w-14 shrink-0">
                                        <p className="text-xs font-bold uppercase text-slate-800">
                                            {session.day.slice(0, 3)}
                                        </p>
                                        <p className="mt-1 text-[10px] tabular-nums text-slate-400">
                                            {session.time.split(" – ")[0]}
                                        </p>
                                    </div>
                                    <span className="h-9 w-1 shrink-0 rounded-full bg-indigo-400" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                            {session.subject} · {session.courseCode}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-slate-500">
                                            {session.room} · {session.faculty}
                                            {session.groups?.length
                                                ? ` · ${session.groups.join(", ")}`
                                                : ""}
                                        </p>
                                    </div>
                                    <CheckCircle2
                                        size={16}
                                        className="hidden shrink-0 text-emerald-500 sm:block"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-6 py-10 text-center">
                            <CalendarDays
                                size={23}
                                className="mx-auto text-slate-300"
                            />
                            <p className="mt-3 text-sm font-semibold text-slate-800">
                                {dashboard?.scheduleName
                                    ? "No sessions match this account"
                                    : "No published timetable yet"}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                {dashboard?.scheduleName
                                    ? "There are no sessions for your role or department in the latest schedule."
                                    : "Generate and publish a timetable to show scheduled classes here."}
                            </p>
                        </div>
                    )}

                    <div className="border-t border-slate-100 px-5 py-3.5 sm:px-6">
                        <Link
                            to="/timetable"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                            Open timetable
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </article>

                <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                {content.bookingTitle}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Recent requests from the backend
                            </p>
                        </div>
                        <Clock3 size={18} className="text-indigo-500" />
                    </div>

                    {loading && !dashboard ? (
                        <div className="space-y-3 p-6">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="h-14 animate-pulse rounded-xl bg-slate-100"
                                />
                            ))}
                        </div>
                    ) : bookings.length ? (
                        <div className="divide-y divide-slate-100">
                            {bookings.slice(0, 5).map((booking) => (
                                <div key={booking.id} className="px-5 py-4 sm:px-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                {booking.title}
                                            </p>
                                            <p className="mt-1 truncate text-xs text-slate-500">
                                                {booking.room} · {booking.category}
                                            </p>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                                booking.status === "CANCELLED"
                                                    ? "bg-slate-100 text-slate-600"
                                                    : "bg-amber-50 text-amber-700"
                                            }`}
                                        >
                                            {booking.status === "CANCELLED"
                                                ? "Cancelled"
                                                : "Submitted"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-6 py-10 text-center">
                            <Clock3 size={23} className="mx-auto text-slate-300" />
                            <p className="mt-3 text-sm font-semibold text-slate-800">
                                No booking requests yet
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                New requests will appear here.
                            </p>
                        </div>
                    )}

                    <div className="border-t border-slate-100 px-5 py-3.5 sm:px-6">
                        <Link
                            to="/bookings"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                            View bookings
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </article>
            </section>
        </div>
    );
}

export default DashboardHome;
