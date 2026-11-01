import
    {
        CalendarDays,
        BookOpen,
        ClipboardList,
        Clock,
    } from "lucide-react";

import StatCard from "../../components/common/StatCard";

function FacultyDashboard()
{
    const stats = [
        {
            title: "My Classes",
            value: "—",
            subtitle: "Assigned classes",
            icon: CalendarDays,
        },
        {
            title: "My Subjects",
            value: "—",
            subtitle: "Assigned subjects",
            icon: BookOpen,
        },
        {
            title: "Pending Requests",
            value: "—",
            subtitle: "Booking requests",
            icon: ClipboardList,
        },
        {
            title: "Free Periods",
            value: "—",
            subtitle: "Available periods",
            icon: Clock,
        },
    ];

    return (
        <div className="space-y-8">
            <section>
                <h1 className="text-2xl font-bold text-slate-900">
                    Faculty Dashboard
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    View your teaching schedule, assigned subjects and room bookings.
                </p>
            </section>

            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        subtitle={stat.subtitle}
                        icon={stat.icon}
                    />
                ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Today's Schedule
                    </h2>
                    <p className="mt-3 text-sm text-slate-500">
                        Your classes and assigned time slots will appear here.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Recent Activities
                    </h2>
                    <p className="mt-3 text-sm text-slate-500">
                        Booking updates and schedule changes will appear here.
                    </p>
                </div>
            </section>
        </div>
    );
}

export default FacultyDashboard;