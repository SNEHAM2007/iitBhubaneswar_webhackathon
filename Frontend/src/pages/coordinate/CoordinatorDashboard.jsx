import {
  CalendarDays,
  ClipboardList,
  DoorOpen,
  AlertTriangle,
} from "lucide-react";

import StatCard from "../../components/common/StatCard";

function CoordinatorDashboard() {
  const stats = [
    {
      title: "Scheduled Classes",
      value: "—",
      subtitle: "Current academic schedule",
      icon: CalendarDays,
    },
    {
      title: "Booking Requests",
      value: "—",
      subtitle: "Requests to review",
      icon: ClipboardList,
    },
    {
      title: "Available Rooms",
      value: "—",
      subtitle: "Rooms ready for booking",
      icon: DoorOpen,
    },
    {
      title: "Schedule Conflicts",
      value: "—",
      subtitle: "Issues requiring attention",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Coordinator Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Coordinate academic schedules, room allocations and booking requests.
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
            Pending Approvals
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            Room booking and scheduling requests awaiting your review will
            appear here.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Conflict Alerts
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            Room, faculty and timetable conflicts will appear here.
          </p>
        </div>
      </section>
    </div>
  );
}

export default CoordinatorDashboard;