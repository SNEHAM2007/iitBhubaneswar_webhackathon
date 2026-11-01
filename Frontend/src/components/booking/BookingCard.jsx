
import
    {
        CalendarDays,
        Clock,
        MapPin,
        User,
        CheckCircle,
        XCircle,
        Clock3,
    } from "lucide-react";

const statusStyles = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    REJECTED: "bg-red-100 text-red-700",
};

function BookingCard({
    booking,
    onApprove,
    onReject,
    showActions = false,
})
{
    if (!booking) return null;

    const status = (booking.status || "PENDING").toUpperCase();

    const windows = Array.isArray(booking.windows)
        ? booking.windows
        : [];

    const bookingDate =
        windows[0]?.date || booking.date || "Not specified";

    const bookingTime =
        windows[0]?.startTime || booking.time || "Not specified";

    const room =
        booking.room?.name ||
        booking.requestedRoomId ||
        booking.requestedCategory ||
        "Not assigned";

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-slate-800">
                        {booking.title || "Untitled Booking"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        {booking.requester || "Requester not specified"}
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
                    {bookingDate}
                </div>

                <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {bookingTime}
                </div>

                <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {room}
                </div>

                <div className="flex items-center gap-2">
                    <User size={16} />
                    {booking.departmentCode || "Department not specified"}
                </div>
            </div>

            {showActions && status === "PENDING" && (
                <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
                    <button
                        type="button"
                        onClick={() => onApprove?.(booking.id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                        <CheckCircle size={16} />
                        Approve
                    </button>

                    <button
                        type="button"
                        onClick={() => onReject?.(booking.id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                        <XCircle size={16} />
                        Reject
                    </button>
                </div>
            )}

            {status === "PENDING" && (
                <div className="mt-4 flex items-center gap-2 text-xs text-amber-600">
                    <Clock3 size={14} />
                    Awaiting approval
                </div>
            )}
        </div>
    );
}

export default BookingCard;
