import { useEffect } from "react";
import {
    BookOpen,
    Building2,
    CalendarDays,
    Clock3,
    GraduationCap,
    Users,
    X,
} from "lucide-react";

function TimetableDetails({ entry, onClose })
{
    useEffect(() =>
    {
        if (!entry) return undefined;

        const handleKeyDown = (event) =>
        {
            if (event.key === "Escape") onClose?.();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [entry, onClose]);

    if (!entry) return null;

    const details = [
        {
            label: "Day",
            value: entry.day,
            icon: CalendarDays,
        },
        {
            label: "Time",
            value: entry.time,
            icon: Clock3,
        },
        {
            label: "Faculty",
            value: entry.faculty || "Not assigned",
            icon: Users,
        },
        {
            label: "Room",
            value: entry.room || "Not assigned",
            icon: Building2,
        },
        {
            label: "Department and year",
            value: `${entry.department} · Year ${entry.year}`,
            icon: GraduationCap,
        },
        {
            label: "Student groups",
            value: entry.groups?.join(", ") || "Not specified",
            icon: Users,
        },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) =>
            {
                if (event.target === event.currentTarget) onClose?.();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="timetable-details-title"
                className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
                <div className="bg-gradient-to-br from-indigo-950 to-indigo-700 p-6 text-white sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-100">
                                <BookOpen size={13} />
                                {entry.kind || "Class"} · {entry.courseCode}
                            </span>
                            <h2
                                id="timetable-details-title"
                                className="mt-4 text-xl font-bold leading-snug sm:text-2xl"
                            >
                                {entry.subject}
                            </h2>
                            <p className="mt-2 text-sm text-indigo-100">
                                {entry.department} · Year {entry.year}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close class details"
                            className="shrink-0 rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white">
                            <CalendarDays size={14} />
                            {entry.day}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white">
                            <Clock3 size={14} />
                            {entry.time}
                        </span>
                        {entry.duration > 1 && (
                            <span className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white">
                                {entry.duration} hours
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
                    {details.map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                                <Icon size={17} />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                    {label}
                                </p>
                                <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                                    {value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Done
                    </button>
                </div>
            </section>
        </div>
    );
}

export default TimetableDetails;
