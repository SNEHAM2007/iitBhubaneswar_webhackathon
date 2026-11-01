
import
    {
        DoorOpen,
        CheckCircle2,
        XCircle,
        Users,
    } from "lucide-react";

const summaryItems = [
    {
        key: "total",
        label: "Total Rooms",
        icon: DoorOpen,
        color: "bg-indigo-50 text-indigo-600",
    },
    {
        key: "available",
        label: "Available Rooms",
        icon: CheckCircle2,
        color: "bg-emerald-50 text-emerald-600",
    },
    {
        key: "unavailable",
        label: "Unavailable Rooms",
        icon: XCircle,
        color: "bg-red-50 text-red-600",
    },
    {
        key: "capacity",
        label: "Total Capacity",
        icon: Users,
        color: "bg-amber-50 text-amber-600",
    },
];

function RoomSummary({ rooms = [] })
{
    const counts = rooms.reduce(
        (result, room) =>
        {
            const available = room.isAvailable ?? room.available ?? true;

            if (available) {
                result.available += 1;
            } else {
                result.unavailable += 1;
            }

            result.capacity += Number(room.capacity) || 0;

            return result;
        },
        {
            total: rooms.length,
            available: 0,
            unavailable: 0,
            capacity: 0,
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
                                    {counts[item.key].toLocaleString()}
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

export default RoomSummary;
