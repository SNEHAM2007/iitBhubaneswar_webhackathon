
import
    {
        X,
        CalendarDays,
        Clock,
        MapPin,
        Users,
        BookOpen,
        Building2,
    } from "lucide-react";

function ExamDetails({ exam, onClose })
{
    if (!exam) return null;

    const details = [
        {
            label: "Course Code",
            value: exam.courseCode || exam.code || "Not specified",
            icon: BookOpen,
        },
        {
            label: "Exam Date",
            value: exam.date || "Not scheduled",
            icon: CalendarDays,
        },
        {
            label: "Start Time",
            value: exam.startTime || exam.time || "Not scheduled",
            icon: Clock,
        },
        {
            label: "Examination Room",
            value: exam.room?.name || exam.room || "Not assigned",
            icon: MapPin,
        },
        {
            label: "Student Count",
            value: exam.studentCount ?? exam.attendance ?? "Not specified",
            icon: Users,
        },
        {
            label: "Department",
            value: exam.department || "Not specified",
            icon: Building2,
        },
    ];

    const status = (exam.status || "SCHEDULED").toUpperCase();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
            onMouseDown={(event) =>
            {
                if (event.target === event.currentTarget) onClose?.();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="exam-details-title"
                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h2
                            id="exam-details-title"
                            className="text-xl font-bold text-slate-900"
                        >
                            Exam Details
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Complete examination information
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close exam details"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-5">
                    <h3 className="text-lg font-semibold text-slate-800">
                        {exam.subject || exam.title || "Untitled Exam"}
                    </h3>

                    <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {status}
                    </span>
                </div>

                <div className="mt-6 space-y-4">
                    {details.map((item) =>
                    {
                        const Icon = item.icon;

                        return (
                            <div key={item.label} className="flex items-start gap-3">
                                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                                    <Icon size={18} />
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">{item.label}</p>
                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                        {item.value}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {exam.duration && (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Duration</p>
                        <p className="mt-1 text-sm font-medium text-slate-800">
                            {exam.duration}
                        </p>
                    </div>
                )}

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default ExamDetails;
