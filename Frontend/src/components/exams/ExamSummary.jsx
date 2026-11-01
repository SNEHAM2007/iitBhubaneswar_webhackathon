
import
    {
        BookOpen,
        CalendarCheck,
        CheckCircle2,
        Clock3,
    } from "lucide-react";

const summaryItems = [
    {
        key: "total",
        label: "Total Exams",
        icon: BookOpen,
        color: "bg-indigo-50 text-indigo-600",
    },
    {
        key: "scheduled",
        label: "Scheduled",
        icon: CalendarCheck,
        color: "bg-blue-50 text-blue-600",
    },
    {
        key: "completed",
        label: "Completed",
        icon: CheckCircle2,
        color: "bg-emerald-50 text-emerald-600",
    },
    {
        key: "pending",
        label: "Pending",
        icon: Clock3,
        color: "bg-amber-50 text-amber-600",
    },
];

function ExamSummary({ exams = [] })
{
    const counts = exams.reduce(
        (result, exam) =>
        {
            const status = (exam.status || "SCHEDULED").toUpperCase();

            if (status === "SCHEDULED") result.scheduled += 1;
            if (status === "COMPLETED") result.completed += 1;
            if (status === "PENDING") result.pending += 1;

            return result;
        },
        {
            total: exams.length,
            scheduled: 0,
            completed: 0,
            pending: 0,
        }
    );

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryItems.map((item) =>
            {
                const Icon = item.icon;

                return (
                    <div
                        key={item.key}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    {item.label}
                                </p>

                                <p className="mt-3 text-3xl font-bold text-slate-900">
                                    {counts[item.key]}
                                </p>
                            </div>

                            <div className={`rounded-xl p-3 ${item.color}`}>
                                <Icon size={23} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default ExamSummary;
