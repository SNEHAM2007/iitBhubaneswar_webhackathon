
import
    {
        CalendarDays,
        Clock,
        User,
        MapPin,
        ArrowRight,
    } from "lucide-react";

function ReschedulingCard({ request, onView })
{
    if (!request) return null;

    const status = (request.status || "PENDING").toUpperCase();

    const statusStyles = {
        PENDING: "bg-amber-100 text-amber-700",
        APPROVED: "bg-emerald-100 text-emerald-700",
        REJECTED: "bg-red-100 text-red-700",
        COMPLETED: "bg-blue-100 text-blue-700",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-slate-800">
                        {request.title || "Schedule Change Request"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {request.requester || "Requester not specified"}
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
                    <span>
                        {request.currentDate || "Current date unavailable"}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>
                        {request.currentTime || "Current time unavailable"}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <ArrowRight size={16} />
                    <span>
                        {request.requestedDate || "Requested date unavailable"}
                        {" · "}
                        {request.requestedTime || "Requested time unavailable"}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{request.room || "Room not specified"}</span>
                </div>

                <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{request.department || "Department not specified"}</span>
                </div>
            </div>

            {request.reason && (
                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-500">
                        Reason
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                        {request.reason}
                    </p>
                </div>
            )}

            {onView && (
                <button
                    type="button"
                    onClick={() => onView(request)}
                    className="mt-5 w-full rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                    View Request
                </button>
            )}
        </div>
    );
}

export default ReschedulingCard;
