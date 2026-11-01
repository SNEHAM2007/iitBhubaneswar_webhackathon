
import { X, CalendarDays, Clock, MapPin, Users, Building2 } from "lucide-react";

function BookingDetails({ booking, onClose })
{
    if (!booking) return null;

    const firstWindow = Array.isArray(booking.windows)
        ? booking.windows[0]
        : null;

    const details = [
        {
            label: "Requester",
            value: booking.requester || "Not specified",
            icon: Users,
        },
        {
            label: "Department",
            value: booking.departmentCode || "Not specified",
            icon: Building2,
        },
        {
            label: "Date",
            value: firstWindow?.date || booking.date || "Not specified",
            icon: CalendarDays,
        },
        {
            label: "Start Time",
            value: firstWindow?.startTime || booking.time || "Not specified",
            icon: Clock,
        },
        {
            label: "Room",
            value:
                booking.room?.name ||
                booking.requestedRoomId ||
                booking.requestedCategory ||
                "Not assigned",
            icon: MapPin,
        },
    ];

    const status = (booking.status || "PENDING").toUpperCase();

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
                aria-labelledby="booking-details-title"
                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2
                            id="booking-details-title"
                            className="text-xl font-bold text-slate-900"
                        >
                            Booking Details
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Request ID: {booking.id || "Not available"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close booking details"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-5">
                    <h3 className="text-lg font-semibold text-slate-800">
                        {booking.title || "Untitled Booking"}
                    </h3>

                    <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
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

                {booking.rawText && (
                    <div className="mt-6 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold text-slate-500">
                            Additional Information
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                            {booking.rawText}
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

export default BookingDetails;
