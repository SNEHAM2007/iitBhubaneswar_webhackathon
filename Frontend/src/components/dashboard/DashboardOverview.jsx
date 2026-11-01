import
    {
        CalendarDays,
        Users,
        DoorOpen,
        ClipboardList,
    } from "lucide-react";

import StatCard from "../common/StatCard";

function DashboardOverview()
{
    const stats = [
        {
            title: "Total Classes",
            value: "—",
            subtitle: "Scheduled classes",
            icon: CalendarDays,
        },
        {
            title: "Faculty Members",
            value: "—",
            subtitle: "Registered faculty",
            icon: Users,
        },
        {
            title: "Available Rooms",
            value: "—",
            subtitle: "Campus classrooms",
            icon: DoorOpen,
        },
        {
            title: "Pending Bookings",
            value: "—",
            subtitle: "Awaiting approval",
            icon: ClipboardList,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome section */}
            <section>
                <h1 className="text-2xl font-bold text-slate-900">
                    Campus Overview
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Monitor campus schedules, rooms, faculty and booking activities.
                </p>
            </section>

            {/* Statistics */}
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

            {/* Upcoming activities */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800">
                    Upcoming Activities
                </h2>

                <p className="mt-3 text-sm text-slate-500">
                    Upcoming classes, examinations and room bookings will appear here.
                </p>
            </section>
        </div>
    );
}

export default DashboardOverview;