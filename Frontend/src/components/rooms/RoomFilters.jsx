
import { Search, RotateCcw } from "lucide-react";

function RoomFilters({
    search = "",
    type = "ALL",
    availability = "ALL",
    onSearchChange,
    onTypeChange,
    onAvailabilityChange,
    onReset,
})
{
    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(event) => onSearchChange?.(event.target.value)}
                    placeholder="Search room name or location..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
            </div>

            <select
                value={type}
                onChange={(event) => onTypeChange?.(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
                <option value="ALL">All room types</option>
                <option value="CLASSROOM">Classroom</option>
                <option value="LAB">Laboratory</option>
                <option value="AUDITORIUM">Auditorium</option>
                <option value="SEMINAR_HALL">Seminar Hall</option>
            </select>

            <select
                value={availability}
                onChange={(event) =>
                    onAvailabilityChange?.(event.target.value)
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
                <option value="ALL">All availability</option>
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
            </select>

            <button
                type="button"
                onClick={onReset}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
                <RotateCcw size={16} />
                Reset
            </button>
        </div>
    );
}

export default RoomFilters;
