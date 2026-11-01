
import
    {
        CalendarDays,
        Clock,
        MapPin,
        Users,
        BookOpen,
    } from "lucide-react";

function ExamCard({ exam, onView })
{
    if (!exam) return null;

    const status = (exam.status || "SCHEDULED").toUpperCase();

    const statusStyles = {
        SCHEDULED: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-emerald-100 text-emerald-700",
        CANCELLED: "bg-red-100 text-red-700",
        PENDING: "bg-amber-100 text-amber-700",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-slate-800">
                        {exam.subject || exam.title || "Untitled Exam"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {exam.courseCode || exam.code || "Course code unavailable"}
                    </p>
                </div>

                <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || "bg-slate-100 text-slate-600"
                        }`}
                >
                    {status}
                </span>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    {exam.date || "Date not assigned"}
                </div>

                <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {exam.startTime || exam.time || "Time not assigned"}
                </div>

                <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {exam.room?.name || exam.room || "Room not assigned"}
                </div>

                <div className="flex items-center gap-2">
                    <Users size={16} />
                    {exam.studentCount ?? exam.attendance ?? "Not specified"} students
                </div>

                {exam.duration && (
                    <div className="flex items-center gap-2">
                        <BookOpen size={16} />
                        Duration: {exam.duration}
                    </div>
                )}
            </div>

            {onView && (
                <button
                    type="button"
                    onClick={() => onView(exam)}
                    className="mt-5 w-full rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                >
                    View Exam
                </button>
            )}
        </div>
    );
}

export default ExamCard;
