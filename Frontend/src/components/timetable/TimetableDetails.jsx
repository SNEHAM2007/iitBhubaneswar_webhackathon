
import { X, CalendarDays, Clock, MapPin, User, BookOpen } from "lucide-react";

function TimetableDetails({ entry, onClose })
{
    if (!entry) return null;

    const details = [
        {
            label: "Subject",
            value: entry.subject,
            icon: BookOpen,
        },
        {
            label: "Faculty",
            value: entry.faculty || "Not assigned",
            icon: User,
        },
        {
            label: "Day",
            value: entry.day || "Not specified",
            icon: CalendarDays,
        },
        {
            label: "Time",
            value: entry.time || "Not specified",
            icon: Clock,
        },
        {
            label: "Room",
            value: entry.room || "Not assigned",
            icon: MapPin,
        },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="timetable-details-title"
                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h2
                            id="timetable-details-title"
                            className="text-xl font-bold text-slate-900"
                        >
                            Class Details
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Timetable entry information
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close details"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-5 space-y-4">
                    {details.map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
                        >
                            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                                <Icon size={19} />
                            </div>

                            <div>
                                <p className="text-xs font-medium text-slate-500">
                                    {label}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default TimetableDetails;
