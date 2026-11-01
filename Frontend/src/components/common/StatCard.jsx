
import
    {
        CalendarDays,
        Users,
        DoorOpen,
        BookOpen,
        TrendingUp,
    } from "lucide-react";

const iconMap = {
    calendar: CalendarDays,
    users: Users,
    rooms: DoorOpen,
    bookings: BookOpen,
};

function StatCard({
    title,
    value,
    subtitle,
    icon = "calendar",
    trend,
})
{
    const Icon =
        typeof icon === "string"
            ? iconMap[icon] || CalendarDays
            : icon;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h3 className="mt-3 text-3xl font-bold text-slate-900">
                        {value ?? "—"}
                    </h3>
                </div>

                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                    <Icon size={23} />
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                    {subtitle}
                </p>

                {trend && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <TrendingUp size={14} />
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}

export default StatCard;
