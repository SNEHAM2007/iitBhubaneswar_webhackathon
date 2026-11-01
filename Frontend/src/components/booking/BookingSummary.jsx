
import
    {
        CalendarDays,
        Clock3,
        CheckCircle2,
        XCircle,
    } from "lucide-react";

const summaryItems = [
    {
        key: "total",
        label: "Total Bookings",
        icon: CalendarDays,
        color: "bg-indigo-50 text-indigo-600",
    },
    {
        key: "pending",
        label: "Pending",
        icon: Clock3,
        color: "bg-amber-50 text-amber-600",
    },
    {
        key: "approved",
        label: "Approved",
        icon: CheckCircle2,
        color: "bg-emerald-50 text-emerald-600",
    },
    {
        key: "rejected",
        label: "Rejected",
        icon: XCircle,
        color: "bg-red-50 text-red-600",
    },
];

function BookingSummary({ bookings = [] })
{
    const counts = bookings.reduce(
        (result, booking) =>
        {
            const status = (booking.status || "PENDING").toUpperCase();

            if (status === "PENDING") result.pending += 1;
            else if (status === "APPROVED") result.approved += 1;
            else if (status === "REJECTED") result.rejected += 1;

            return result;
        },
        {
            total: bookings.length,
            pending: 0,
            approved: 0,
            rejected: 0,
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

export default BookingSummary;
