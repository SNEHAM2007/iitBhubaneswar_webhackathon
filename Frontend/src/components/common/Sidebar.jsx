
import { NavLink } from "react-router-dom";
import
    {
        LayoutDashboard,
        CalendarDays,
        CalendarPlus,
        GraduationCap,
        RefreshCw,
        Bot,
        Building2,
        Users,
        Settings,
        X,
    } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const navigation = {
    ADMIN: [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { name: "Timetable", path: "/timetable", icon: CalendarDays },
        { name: "Bookings", path: "/bookings", icon: CalendarPlus },
        { name: "Examinations", path: "/exams", icon: GraduationCap },
        { name: "Rescheduling", path: "/rescheduling", icon: RefreshCw },
        { name: "Rooms", path: "/rooms", icon: Building2 },
        { name: "Faculty", path: "/faculty", icon: Users },
        { name: "AI Assistant", path: "/assistant", icon: Bot },
    ],

    FACULTY: [
        { name: "Dashboard", path: "/faculty", icon: LayoutDashboard },
        { name: "My Timetable", path: "/timetable", icon: CalendarDays },
        { name: "Bookings", path: "/bookings", icon: CalendarPlus },
        { name: "Examinations", path: "/exams", icon: GraduationCap },
        { name: "AI Assistant", path: "/assistant", icon: Bot },
    ],

    COORDINATOR: [
        { name: "Dashboard", path: "/coordinator", icon: LayoutDashboard },
        { name: "Timetable", path: "/timetable", icon: CalendarDays },
        { name: "Bookings", path: "/bookings", icon: CalendarPlus },
        { name: "Rescheduling", path: "/rescheduling", icon: RefreshCw },
        { name: "Rooms", path: "/rooms", icon: Building2 },
        { name: "AI Assistant", path: "/assistant", icon: Bot },
    ],

    CLUB_REP: [
        { name: "Dashboard", path: "/club", icon: LayoutDashboard },
        { name: "Bookings", path: "/bookings", icon: CalendarPlus },
        { name: "Rooms", path: "/rooms", icon: Building2 },
        { name: "AI Assistant", path: "/assistant", icon: Bot },
    ],
};

function Sidebar({ open = true, onClose })
{
    const { user, logout } = useAuth();

    const role = user?.role?.toUpperCase();
    const links = navigation[role] || [];

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-indigo-600 p-2 text-white">
                            <CalendarDays size={22} />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-900">
                                Campus Scheduler
                            </h2>
                            <p className="text-xs text-slate-400">
                                Smart Campus Management
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-slate-500 lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={21} />
                    </button>
                </div>

                <div className="px-5 py-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Main Menu
                    </p>

                    <nav className="space-y-1">
                        {links.map((item) =>
                        {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === `/${role?.toLowerCase()}`}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive
                                            ? "bg-indigo-50 text-indigo-700"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                        }`
                                    }
                                >
                                    <Icon size={19} />
                                    {item.name}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto border-t border-slate-100 p-5">
                    <div className="mb-4">
                        <p className="truncate text-sm font-semibold text-slate-800">
                            {user?.name || "Campus User"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {user?.role || "User"}
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
                    >
                        Sign out
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
