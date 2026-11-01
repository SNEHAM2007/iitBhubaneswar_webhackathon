
import
    {
        DoorOpen,
        Users,
        MapPin,
        CheckCircle2,
        XCircle,
        Monitor,
    } from "lucide-react";

function RoomCard({ room, onView, onEdit })
{
    if (!room) return null;

    const available = room.isAvailable ?? room.available ?? true;

    const capacity = room.capacity ?? "Not specified";

    const roomType = room.type || room.category || "Classroom";

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                        <DoorOpen size={22} />
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-800">
                            {room.name || room.roomNumber || "Unnamed Room"}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            {roomType}
                        </p>
                    </div>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${available
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                >
                    {available ? "Available" : "Unavailable"}
                </span>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>Capacity: {capacity}</span>
                </div>

                <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{room.building || room.location || "Location not specified"}</span>
                </div>

                <div className="flex items-center gap-2">
                    {room.hasProjector ? (
                        <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                        <XCircle size={16} className="text-slate-400" />
                    )}
                    <span>Projector</span>
                </div>

                <div className="flex items-center gap-2">
                    {room.hasComputer ? (
                        <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                        <XCircle size={16} className="text-slate-400" />
                    )}
                    <span>Computer facility</span>
                </div>

                {room.hasSmartBoard && (
                    <div className="flex items-center gap-2">
                        <Monitor size={16} />
                        <span>Smart board</span>
                    </div>
                )}
            </div>

            {(onView || onEdit) && (
                <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
                    {onView && (
                        <button
                            type="button"
                            onClick={() => onView(room)}
                            className="flex-1 rounded-xl border border-indigo-200 px-3 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                        >
                            View
                        </button>
                    )}

                    {onEdit && (
                        <button
                            type="button"
                            onClick={() => onEdit(room)}
                            className="flex-1 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            Edit
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default RoomCard;
