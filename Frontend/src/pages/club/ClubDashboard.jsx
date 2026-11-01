import
    {
        CalendarDays,
        ClipboardList,
        DoorOpen,
        CheckCircle,
    } from "lucide-react";

import StatCard from "../../components/common/StatCard";

function ClubDashboard()
{
    const stats = [
        {
            title: "My Bookings",
            value: "—",
            subtitle: "Total booking requests",
            icon: ClipboardList,
        },
        {
            title: "Approved Bookings",
            value: "—",
            subtitle: "Confirmed requests",
            icon: CheckCircle,
        },
        {
            title: "Available Rooms",
            value: "—",
            subtitle: "Rooms available for events",
            icon: DoorOpen,
        },
        {
            title: "Upcoming Events",
            value: "—",
            subtitle: "Scheduled club activities",
            icon: CalendarDays,
        },
    ];

    return (
        <div className="space-y-8">
            <section>
                <h1 className="text-2xl font-bold text-slate-900">
                    Club Representative Dashboard
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Manage club events, submit room booking requests and track approvals.
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
                        My Recent Bookings
                    </h2>

                    <p className="mt-3 text-sm text-slate-500">
                        Your latest room booking requests and their statuses will appear
                        here.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Upcoming Club Events
                    </h2>

                    <p className="mt-3 text-sm text-slate-500">
                        Your approved upcoming club events will appear here.
                    </p>
                </div>
            </section>
        </div>
    );
}

export default ClubDashboard;