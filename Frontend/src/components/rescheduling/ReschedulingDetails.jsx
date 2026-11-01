
import
    {
        X,
        CalendarDays,
        Clock,
        MapPin,
        User,
        ArrowRight,
        FileText,
    } from "lucide-react";

function ReschedulingDetails({ request, onClose })
{
    if (!request) return null;

    const status = (request.status || "PENDING").toUpperCase();

    const statusStyles = {
        PENDING: "bg-amber-100 text-amber-700",
        APPROVED: "bg-emerald-100 text-emerald-700",
        REJECTED: "bg-red-100 text-red-700",
        COMPLETED: "bg-blue-100 text-blue-700",
    };

    const details = [
        {
            label: "Requester",
            value: request.requester || "Not specified",
            icon: User,
        },
        {
            label: "Department",
            value: request.department || "Not specified",
            icon: FileText,
        },
        {
            label: "Current Date",
            value: request.currentDate || "Not specified",
            icon: CalendarDays,
        },
        {
            label: "Current Time",
            value: request.currentTime || "Not specified",
            icon: Clock,
        },
        {
            label: "Requested Date",
            value: request.requestedDate || "Not specified",
            icon: CalendarDays,
        },
        {
            label: "Requested Time",
            value: request.requestedTime || "Not specified",
            icon: Clock,
        },
        {
            label: "Room",
            value: request.room || "Not specified",
            icon: MapPin,
        },
    ];

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
                aria-labelledby="rescheduling-details-title"
                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h2
                            id="rescheduling-details-title"
                            className="text-xl font-bold text-slate-900"
                        >
                            Rescheduling Details
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Request ID: {request.id || "Not available"}
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

                <div className="mt-5">
                    <h3 className="text-lg font-semibold text-slate-800">
                        {request.title || "Schedule Change Request"}
                    </h3>

                    <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || "bg-slate-100 text-slate-600"
                            }`}
                    >
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

                <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    <ArrowRight size={16} />
                    Current schedule to requested schedule
                </div>

                {request.reason && (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold text-slate-500">
                            Reason for Rescheduling
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                            {request.reason}
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

export default ReschedulingDetails;
